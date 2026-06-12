import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, Download, XCircle, Timer, Award } from "lucide-react";
import { api } from "../../api/client";
import type { Exam, ExamSubmitResult } from "../../types";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ExamPlayer({ exam, onPassed }: { exam: Exam; onPassed: () => void }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(exam.timeLimitSeconds);

  function selectAnswer(questionId: string, answerId: string) {
    setSelected((prev) => ({ ...prev, [questionId]: answerId }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const answers: Record<string, string[]> = {};
      for (const question of exam.questions) {
        const choice = selected[question.id];
        answers[question.id] = choice && choice.trim() ? [choice.trim()] : [];
      }
      const res = await api.post<ExamSubmitResult>(`/exams/${exam.id}/submit`, { answers });
      setResult(res.data);
      if (res.data.passed) onPassed();
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setSelected({});
    setTimeLeft(exam.timeLimitSeconds);
  }

  async function downloadCertificate() {
    if (!result?.certificate) return;
    setIsDownloading(true);
    try {
      const res = await api.get(`/certificates/${result.certificate.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificat-${exam.module.slug}-${result.certificate.serialNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  const allAnswered = exam.questions.every((q) => selected[q.id]?.trim());
  const detailByQuestion = new Map(result?.detail.map((d) => [d.questionId, d]) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{exam.title}</h2>
        <span className="text-xs text-slate-500">Score requis : {exam.passingScore}%</span>
      </div>

      {exam.timeLimitSeconds !== null && !result && (
        <p
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            timeLeft !== null && timeLeft <= 60 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Timer className="h-3.5 w-3.5" />
          Temps restant : {formatTime(timeLeft ?? 0)}
        </p>
      )}

      {exam.bestAttempt && !result && (
        <p
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            exam.bestAttempt.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          Meilleure tentative : {exam.bestAttempt.score}% {exam.bestAttempt.passed ? "— réussi" : "— à retenter"}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-5">
        {exam.questions.map((question, idx) => {
          const detail = detailByQuestion.get(question.id);
          return (
            <div key={question.id} className="rounded-lg border border-slate-200 p-4">
              <div className="prose-lesson font-medium text-slate-900">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p>{idx + 1}. {children}</p>,
                  }}
                >
                  {question.prompt}
                </ReactMarkdown>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {question.answers.map((answer) => {
                  const isSelected = selected[question.id] === answer.id;
                  const isCorrect = detail?.correctAnswerIds.includes(answer.id);
                  let style = "border-slate-200 hover:border-brand-300";
                  if (result) {
                    if (isCorrect) style = "border-emerald-400 bg-emerald-50";
                    else if (isSelected && !isCorrect) style = "border-red-300 bg-red-50";
                  } else if (isSelected) {
                    style = "border-brand-400 bg-brand-50";
                  }
                  return (
                    <label
                      key={answer.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${style}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={isSelected}
                        disabled={!!result}
                        onChange={() => selectAnswer(question.id, answer.id)}
                      />
                      {answer.label}
                    </label>
                  );
                })}
              </div>
              {detail && (
                <div className={`mt-3 flex items-start gap-2 rounded-md p-3 text-sm ${detail.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                  {detail.isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{detail.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!result ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? "Correction..." : "Valider l'examen"}
        </button>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <p className={`text-lg font-bold ${result.passed ? "text-emerald-600" : "text-red-600"}`}>
              Score : {result.score}% {result.passed ? "— Réussi 🎉" : "— Non validé"}
            </p>
            <button onClick={reset} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Réessayer
            </button>
          </div>
          {result.certificate && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <Award className="h-6 w-6 shrink-0 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Félicitations, vous avez obtenu votre certificat !</p>
                <p className="text-xs text-emerald-700">Numéro de série : {result.certificate.serialNumber}</p>
              </div>
              <button
                onClick={downloadCertificate}
                disabled={isDownloading}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? "Téléchargement..." : "Télécharger le PDF"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
