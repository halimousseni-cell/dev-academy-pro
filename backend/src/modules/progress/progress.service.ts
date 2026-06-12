import { prisma } from "../../db/client";
import type { UpdateLessonProgressInput } from "./progress.schema";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getDashboard(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { firstName: true, lastName: true, weeklyGoalMinutes: true, createdAt: true },
  });

  const progress = await prisma.userProgress.findMany({ where: { userId } });
  const totalTimeSeconds = progress.reduce((sum, p) => sum + p.timeSpentSeconds, 0);
  const completedLessons = progress.filter((p) => p.status === "COMPLETED").length;

  const weekAgo = new Date(Date.now() - WEEK_MS);
  const weeklyAttempts = await prisma.quizAttempt.findMany({
    where: { userId, createdAt: { gte: weekAgo } },
  });

  const totalLessons = await prisma.lesson.count();
  const totalModules = await prisma.module.count({ where: { published: true } });
  const completedModules = await getCompletedModulesCount(userId);

  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  const quizAttempts = await prisma.quizAttempt.findMany({ where: { userId } });
  const quizzesPassed = new Set(quizAttempts.filter((a) => a.passed).map((a) => a.quizId)).size;

  const moduleStats = await getModuleStats(userId);
  const recentActivity = await getRecentActivity(userId);

  return {
    user: { firstName: user.firstName, lastName: user.lastName, memberSince: user.createdAt },
    stats: {
      totalTimeSeconds,
      completedLessons,
      totalLessons,
      completedModules,
      totalModules,
      quizzesPassed,
      level: computeLevel(completedLessons, quizzesPassed),
    },
    weeklyGoal: {
      targetMinutes: user.weeklyGoalMinutes,
      achievedMinutes: Math.round(
        progress
          .filter((p) => p.completedAt && p.completedAt >= weekAgo)
          .reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60
      ),
      quizAttemptsThisWeek: weeklyAttempts.length,
    },
    badges: badges.map((b) => ({
      code: b.badge.code,
      title: b.badge.title,
      description: b.badge.description,
      icon: b.badge.icon,
      earnedAt: b.earnedAt,
    })),
    moduleStats,
    recentActivity,
  };
}

async function getModuleStats(userId: string) {
  const modules = await prisma.module.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: { chapters: { include: { lessons: { select: { id: true } }, quizzes: { select: { id: true } } } } },
  });

  const completedLessonIds = new Set(
    (
      await prisma.userProgress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId)
  );

  const passedQuizIds = new Set(
    (
      await prisma.quizAttempt.findMany({
        where: { userId, passed: true },
        select: { quizId: true },
      })
    ).map((a) => a.quizId)
  );

  return modules.map((module) => {
    const lessonIds = module.chapters.flatMap((c) => c.lessons.map((l) => l.id));
    const quizIds = module.chapters.flatMap((c) => c.quizzes.map((q) => q.id));
    const completedLessons = lessonIds.filter((id) => completedLessonIds.has(id)).length;
    const quizzesPassed = quizIds.filter((id) => passedQuizIds.has(id)).length;

    return {
      slug: module.slug,
      title: module.title,
      category: module.category,
      completedLessons,
      totalLessons: lessonIds.length,
      quizzesPassed,
      totalQuizzes: quizIds.length,
      progressPercent: lessonIds.length === 0 ? 0 : Math.round((completedLessons / lessonIds.length) * 100),
    };
  });
}

async function getRecentActivity(userId: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { quiz: { include: { chapter: { include: { module: true } } } } },
  });

  return attempts.map((attempt) => ({
    quizTitle: attempt.quiz.title,
    moduleTitle: attempt.quiz.chapter.module.title,
    score: attempt.score,
    passed: attempt.passed,
    createdAt: attempt.createdAt,
  }));
}

function computeLevel(completedLessons: number, quizzesPassed: number): number {
  return 1 + Math.floor((completedLessons * 10 + quizzesPassed * 25) / 100);
}

async function getCompletedModulesCount(userId: string): Promise<number> {
  const modules = await prisma.module.findMany({
    where: { published: true },
    include: { chapters: { include: { lessons: { select: { id: true } } } } },
  });

  const completedLessonIds = new Set(
    (
      await prisma.userProgress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId)
  );

  return modules.filter((module) => {
    const lessonIds = module.chapters.flatMap((c) => c.lessons.map((l) => l.id));
    return lessonIds.length > 0 && lessonIds.every((id) => completedLessonIds.has(id));
  }).length;
}

export async function upsertLessonProgress(userId: string, input: UpdateLessonProgressInput) {
  const lesson = await prisma.lesson.findUniqueOrThrow({
    where: { id: input.lessonId },
    include: { chapter: { select: { moduleId: true } } },
  });

  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    create: {
      userId,
      lessonId: lesson.id,
      status: input.status,
      timeSpentSeconds: input.timeSpentSeconds,
      completedAt: input.status === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: input.status,
      timeSpentSeconds: { increment: input.timeSpentSeconds },
      completedAt: input.status === "COMPLETED" ? new Date() : undefined,
    },
  });

  if (input.status === "COMPLETED") {
    await maybeAwardBadge(userId, "FIRST_LESSON_COMPLETED");
    await checkAndAwardModuleCompletion(userId, lesson.chapter.moduleId);
  }

  return progress;
}

/**
 * Vérifie si toutes les leçons sont terminées et tous les quiz réussis pour
 * un module donné, et attribue le badge de complétion associé si défini.
 */
export async function checkAndAwardModuleCompletion(userId: string, moduleId: string) {
  const module = await prisma.module.findUniqueOrThrow({
    where: { id: moduleId },
    include: { chapters: { include: { lessons: true, quizzes: true } } },
  });

  if (!module.completionBadgeCode) return;

  const lessonIds = module.chapters.flatMap((c) => c.lessons.map((l) => l.id));
  const quizIds = module.chapters.flatMap((c) => c.quizzes.map((q) => q.id));

  if (lessonIds.length === 0) return;

  const completedLessons = await prisma.userProgress.count({
    where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
  });
  if (completedLessons < lessonIds.length) return;

  if (quizIds.length > 0) {
    const passedAttempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId: { in: quizIds }, passed: true },
      select: { quizId: true },
    });
    const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId));
    if (!quizIds.every((id) => passedQuizIds.has(id))) return;
  }

  await maybeAwardBadge(userId, module.completionBadgeCode);
}

export async function maybeAwardBadge(userId: string, code: string) {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return;

  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    create: { userId, badgeId: badge.id },
    update: {},
  });
}
