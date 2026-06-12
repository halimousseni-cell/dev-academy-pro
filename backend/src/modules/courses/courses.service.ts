import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function listModules(userId: string) {
  const modules = await prisma.module.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { lessons: { select: { id: true } } },
      },
    },
  });

  const lessonIds = modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons.map((l) => l.id)));
  const completed = await prisma.userProgress.findMany({
    where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
    select: { lessonId: true },
  });
  const completedSet = new Set(completed.map((c) => c.lessonId));

  return modules.map((module) => {
    const totalLessons = module.chapters.reduce((sum, c) => sum + c.lessons.length, 0);
    const completedLessons = module.chapters.reduce(
      (sum, c) => sum + c.lessons.filter((l) => completedSet.has(l.id)).length,
      0
    );
    return {
      id: module.id,
      slug: module.slug,
      title: module.title,
      description: module.description,
      category: module.category,
      order: module.order,
      estimatedMinutes: module.estimatedMinutes,
      totalLessons,
      completedLessons,
      progressPercent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    };
  });
}

export async function getModuleBySlug(slug: string, userId: string) {
  const module = await prisma.module.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          quizzes: {
            include: { questions: { include: { answers: true }, orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  if (!module || !module.published) {
    throw new AppError(404, "Module introuvable");
  }

  const lessonIds = module.chapters.flatMap((c) => c.lessons.map((l) => l.id));
  const progressRecords = await prisma.userProgress.findMany({
    where: { userId, lessonId: { in: lessonIds } },
  });
  const progressByLesson = new Map(progressRecords.map((p) => [p.lessonId, p]));

  const quizIds = module.chapters.flatMap((c) => c.quizzes.map((q) => q.id));
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, quizId: { in: quizIds } },
    orderBy: { createdAt: "desc" },
  });
  const bestAttemptByQuiz = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    const existing = bestAttemptByQuiz.get(attempt.quizId);
    if (!existing || attempt.score > existing.score) {
      bestAttemptByQuiz.set(attempt.quizId, attempt);
    }
  }

  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description,
    category: module.category,
    chapters: module.chapters.map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      order: chapter.order,
      lessons: chapter.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        type: lesson.type,
        contentMd: lesson.contentMd,
        status: progressByLesson.get(lesson.id)?.status ?? "NOT_STARTED",
      })),
      quizzes: chapter.quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passingScore,
        timeLimitSeconds: quiz.timeLimitSeconds,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          order: q.order,
          type: q.type,
          prompt: q.prompt,
          answers:
            q.type === "DRAG_DROP"
              ? shuffle(q.answers).map((a, i) => ({ id: a.id, label: a.label, order: i }))
              : q.answers.map((a) => ({ id: a.id, label: a.label, order: a.order })),
        })),
        bestAttempt: bestAttemptByQuiz.has(quiz.id)
          ? {
              score: bestAttemptByQuiz.get(quiz.id)!.score,
              passed: bestAttemptByQuiz.get(quiz.id)!.passed,
            }
          : null,
      })),
    })),
  };
}
