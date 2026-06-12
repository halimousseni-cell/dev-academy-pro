import PDFDocument from "pdfkit";
import { prisma } from "../../db/client";
import { AppError } from "../../middleware/errorHandler";
import { generateSerialNumber, signCertificate, verifyCertificateSignature } from "../../utils/certificateSignature";
import type { SubmitExamInput } from "./certification.schema";

function normalizeCode(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

async function isModuleCompleted(userId: string, moduleId: string): Promise<boolean> {
  const module = await prisma.module.findUniqueOrThrow({
    where: { id: moduleId },
    include: { chapters: { include: { lessons: true, quizzes: true } } },
  });

  const lessonIds = module.chapters.flatMap((c) => c.lessons.map((l) => l.id));
  const quizIds = module.chapters.flatMap((c) => c.quizzes.map((q) => q.id));

  if (lessonIds.length === 0) return false;

  const completedLessons = await prisma.userProgress.count({
    where: { userId, lessonId: { in: lessonIds }, status: "COMPLETED" },
  });
  if (completedLessons < lessonIds.length) return false;

  if (quizIds.length > 0) {
    const passedAttempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId: { in: quizIds }, passed: true },
      select: { quizId: true },
    });
    const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId));
    if (!quizIds.every((id) => passedQuizIds.has(id))) return false;
  }

  return true;
}

export async function getExamForModule(userId: string, moduleId: string) {
  const exam = await prisma.exam.findUnique({
    where: { moduleId },
    include: {
      module: { select: { id: true, title: true, slug: true } },
      questions: { include: { answers: true }, orderBy: { order: "asc" } },
    },
  });

  if (!exam) {
    throw new AppError(404, "Aucun examen final n'est disponible pour ce module");
  }

  const moduleCompleted = await isModuleCompleted(userId, moduleId);

  const attempts = await prisma.examAttempt.findMany({
    where: { userId, examId: exam.id },
    orderBy: { createdAt: "desc" },
  });
  const bestAttempt = attempts.reduce<(typeof attempts)[number] | null>((best, attempt) => {
    if (!best || attempt.score > best.score) return attempt;
    return best;
  }, null);

  const certificate = await prisma.certificate.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  return {
    id: exam.id,
    title: exam.title,
    passingScore: exam.passingScore,
    timeLimitSeconds: exam.timeLimitSeconds,
    module: exam.module,
    moduleCompleted,
    questions: exam.questions.map((q) => ({
      id: q.id,
      order: q.order,
      type: q.type,
      prompt: q.prompt,
      answers: q.answers.map((a) => ({ id: a.id, label: a.label, order: a.order })),
    })),
    bestAttempt: bestAttempt ? { score: bestAttempt.score, passed: bestAttempt.passed } : null,
    certificate: certificate ? { id: certificate.id, serialNumber: certificate.serialNumber } : null,
  };
}

export async function submitExam(userId: string, examId: string, input: SubmitExamInput) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { include: { answers: true } }, module: true },
  });

  if (!exam) {
    throw new AppError(404, "Examen introuvable");
  }

  const moduleCompleted = await isModuleCompleted(userId, exam.moduleId);
  if (!moduleCompleted) {
    throw new AppError(403, "Vous devez terminer toutes les leçons et tous les quiz du module avant de passer l'examen final");
  }

  let correctCount = 0;
  const detail = exam.questions.map((question) => {
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

  const score = exam.questions.length === 0 ? 0 : Math.round((correctCount / exam.questions.length) * 100);
  const passed = score >= exam.passingScore;

  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      examId,
      score,
      passed,
      answersJson: JSON.stringify(input.answers),
    },
  });

  let certificate: { id: string; serialNumber: string } | null = null;

  if (passed) {
    const existing = await prisma.certificate.findUnique({
      where: { userId_moduleId: { userId, moduleId: exam.moduleId } },
    });

    if (existing) {
      certificate = { id: existing.id, serialNumber: existing.serialNumber };
    } else {
      const serialNumber = generateSerialNumber();
      const issuedAt = new Date();
      const signature = signCertificate({
        serialNumber,
        userId,
        moduleId: exam.moduleId,
        score,
        issuedAt: issuedAt.toISOString(),
      });

      const created = await prisma.certificate.create({
        data: {
          serialNumber,
          userId,
          moduleId: exam.moduleId,
          examAttemptId: attempt.id,
          score,
          signature,
          issuedAt,
        },
      });
      certificate = { id: created.id, serialNumber: created.serialNumber };
    }
  }

  return { score, passed, passingScore: exam.passingScore, detail, certificate };
}

export async function listCertificates(userId: string) {
  const certificates = await prisma.certificate.findMany({
    where: { userId },
    include: { module: { select: { title: true, slug: true, category: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return certificates.map((c) => ({
    id: c.id,
    serialNumber: c.serialNumber,
    score: c.score,
    issuedAt: c.issuedAt,
    module: c.module,
  }));
}

async function getOwnedCertificate(userId: string, certificateId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { module: true, user: { select: { firstName: true, lastName: true } } },
  });

  if (!certificate || certificate.userId !== userId) {
    throw new AppError(404, "Certificat introuvable");
  }

  return certificate;
}

export async function getCertificate(userId: string, certificateId: string) {
  const certificate = await getOwnedCertificate(userId, certificateId);

  return {
    id: certificate.id,
    serialNumber: certificate.serialNumber,
    score: certificate.score,
    issuedAt: certificate.issuedAt,
    signature: certificate.signature,
    module: { title: certificate.module.title, slug: certificate.module.slug, category: certificate.module.category },
    holder: { firstName: certificate.user.firstName, lastName: certificate.user.lastName },
  };
}

export async function verifyCertificate(serialNumber: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { serialNumber },
    include: { module: true, user: { select: { firstName: true, lastName: true } } },
  });

  if (!certificate) {
    return { valid: false, reason: "Aucun certificat ne correspond à ce numéro de série." };
  }

  const valid = verifyCertificateSignature(
    {
      serialNumber: certificate.serialNumber,
      userId: certificate.userId,
      moduleId: certificate.moduleId,
      score: certificate.score,
      issuedAt: certificate.issuedAt.toISOString(),
    },
    certificate.signature
  );

  return {
    valid,
    serialNumber: certificate.serialNumber,
    holder: `${certificate.user.firstName} ${certificate.user.lastName}`,
    module: certificate.module.title,
    score: certificate.score,
    issuedAt: certificate.issuedAt,
  };
}

export async function generateCertificatePdf(userId: string, certificateId: string): Promise<{ buffer: Buffer; filename: string }> {
  const certificate = await getOwnedCertificate(userId, certificateId);

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(2)
    .strokeColor("#1d4ed8")
    .stroke();

  doc.fontSize(28).fillColor("#1d4ed8").text("Certificat de réussite", 0, 80, { align: "center" });

  doc.moveDown(2);
  doc.fontSize(14).fillColor("#334155").text("Dev Academy Pro certifie que", { align: "center" });

  doc.moveDown(0.5);
  doc
    .fontSize(24)
    .fillColor("#0f172a")
    .text(`${certificate.user.firstName} ${certificate.user.lastName}`, { align: "center" });

  doc.moveDown(0.5);
  doc.fontSize(14).fillColor("#334155").text("a terminé avec succès le module", { align: "center" });

  doc.moveDown(0.5);
  doc.fontSize(20).fillColor("#0f172a").text(certificate.module.title, { align: "center" });

  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .fillColor("#334155")
    .text(`Score à l'examen final : ${certificate.score}%`, { align: "center" });

  doc.moveDown(2);
  const issuedDate = certificate.issuedAt.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  doc.fontSize(11).fillColor("#64748b").text(`Délivré le ${issuedDate}`, { align: "center" });
  doc.text(`Numéro de série : ${certificate.serialNumber}`, { align: "center" });
  doc.text(`Signature de vérification : ${certificate.signature.slice(0, 32)}...`, { align: "center" });

  doc.moveDown(1);
  doc
    .fontSize(9)
    .fillColor("#94a3b8")
    .text(
      "Ce certificat peut être vérifié sur la page de vérification de Dev Academy Pro à l'aide du numéro de série. " +
        "La signature est une empreinte HMAC à but pédagogique, et non une signature numérique de production.",
      { align: "center" }
    );

  doc.end();

  const buffer = await done;
  const filename = `certificat-${certificate.module.slug}-${certificate.serialNumber}.pdf`;
  return { buffer, filename };
}
