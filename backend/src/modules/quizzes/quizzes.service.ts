import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";
import { checkAndAwardModuleCompletion, maybeAwardBadge } from "../progress/progress.service";
import type { SubmitQuizInput } from "./quizzes.schema";

function normalizeCode(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function submitQuiz(userId: string, quizId: string, input: SubmitQuizInput) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { answers: true } }, chapter: { select: { moduleId: true } } },
  });

  if (!quiz) {
    throw new AppError(404, "Quiz introuvable");
  }

  let correctCount = 0;
  const detail = quiz.questions.map((question) => {
    const correctAnswers = question.answers.filter((a) => a.isCorrect);
    const givenAnswers = input.answers[question.id] ?? [];
    let isCorrect: boolean;
    let correctAnswerIds: string[];

    if (question.type === "CODE_FILL" || question.type === "DEBUG") {
      const expected = correctAnswers.map((a) => normalizeCode(a.label));
      const given = normalizeCode(givenAnswers[0] ?? "");
      isCorrect = expected.includes(given);
      correctAnswerIds = correctAnswers.map((a) => a.id);
    } else if (question.type === "DRAG_DROP") {
      correctAnswerIds = [...question.answers].sort((a, b) => a.order - b.order).map((a) => a.id);
      isCorrect =
        correctAnswerIds.length === givenAnswers.length &&
        correctAnswerIds.every((id, i) => id === givenAnswers[i]);
    } else {
      correctAnswerIds = correctAnswers.map((a) => a.id).sort();
      const givenAnswerIds = [...givenAnswers].sort();
      isCorrect =
        correctAnswerIds.length === givenAnswerIds.length &&
        correctAnswerIds.every((id, i) => id === givenAnswerIds[i]);
    }

    if (isCorrect) correctCount += 1;

    return {
      questionId: question.id,
      isCorrect,
      correctAnswerIds,
      correctAnswerLabel: question.type === "CODE_FILL" || question.type === "DEBUG" ? correctAnswers[0]?.label : undefined,
      explanation: question.explanation,
    };
  });

  const score = quiz.questions.length === 0 ? 0 : Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      passed,
      answersJson: JSON.stringify(input.answers),
    },
  });

  if (passed) {
    await maybeAwardBadge(userId, "FIRST_QUIZ_PASSED");
    await checkAndAwardModuleCompletion(userId, quiz.chapter.moduleId);
  }

  return { score, passed, passingScore: quiz.passingScore, detail };
}
