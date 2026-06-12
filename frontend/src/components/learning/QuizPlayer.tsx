import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, GripVertical, XCircle, ChevronUp, ChevronDown, Timer } from "lucide-react";
import { api } from "../../api/client";
import type { Quiz, QuizSubmitResult } from "../../types";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function initialDragOrder(quiz: Quiz): Record<string, string[]> {
  const init: Record<string, string[]> = {};
  for (const question of quiz.questions) {
    if (question.type === "DRAG_DROP") {
      init[question.id] = question.answers.map((a) => a.id);
    }
  }
  return init;
}

export function QuizPlayer({ quiz, onPassed }: { quiz: Quiz; onPassed: () => void }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [dragOrder, setDragOrder] = useState<Record<string, string[]>>(() => initialDragOrder(quiz));
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(quiz.timeLimitSeconds);

  function selectAnswer(questionId: string, answerId: string) {
    setSelected((prev) => ({ ...prev, [questionId]: answerId }));
  }

  function setTextAnswer(questionId: string, value: string) {
    setSelected((prev) => ({ ...prev, [questionId]: value }));
  }

  function moveDragItem(questionId: string, index: number, direction: -1 | 1) {
    setDragOrder((prev) => {
      const arr = [...(prev[questionId] ?? [])];
      const target = index + direction;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, [questionId]: arr };
    });
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("text/plain", String(index));
  }

  function handleDrop(e: React.DragEvent, questionId: string, index: number) {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex) || fromIndex === index) return;
    setDragOrder((prev) => {
      const arr = [...(prev[questionId] ?? [])];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(index, 0, item);
      return { ...prev, [questionId]: arr };
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const answers: Record<string, string[]> = {};
      for (const question of quiz.questions) {
        if (question.type === "DRAG_DROP") {
          answers[question.id] = dragOrder[question.id] ?? [];
        } else {
          const choice = selected[question.id];
          answers[question.id] = choice && choice.trim() ? [choice.trim()] : [];
        }
      }
      const res = await api.post<QuizSubmitResult>(`/quizzes/${quiz.id}/submit`, { answers });
      setResult(res.data);
      if (res.data.passed) onPassed();
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setSelected({});
    setDragOrder(initialDragOrder(quiz));
    setTimeLeft(quiz.timeLimitSeconds);
  }

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      // Soumission automatique à l'expiration du temps imparti.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  const allAnswered = quiz.questions.every((q) => q.type === "DRAG_DROP" || selected[q.id]?.trim());
  const detailByQuestion = new Map(result?.detail.map((d) => [d.questionId, d]) ?? []);
  const labelById = (question: Quiz["questions"][number], id: string) =>
    question.answers.find((a) => a.id === id)?.label ?? id;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{quiz.title}</h2>
        <span className="text-xs text-slate-500">Score requis : {quiz.passingScore}%</span>
      </div>

      {quiz.timeLimitSeconds !== null && !result && (
        <p
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            timeLeft !== null && timeLeft <= 30 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Timer className="h-3.5 w-3.5" />
          Temps restant : {formatTime(timeLeft ?? 0)}
        </p>
      )}

      {quiz.bestAttempt && (
        <p
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            quiz.bestAttempt.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          Meilleur score : {quiz.bestAttempt.score}% {quiz.bestAttempt.passed ? "— réussi" : "— à retenter"}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-5">
        {quiz.questions.map((question, idx) => {
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
              {question.type === "CODE_FILL" || question.type === "DEBUG" ? (
                <div className="mt-3">
                  <input
                    type="text"
                    value={selected[question.id] ?? ""}
                    disabled={!!result}
                    onChange={(e) => setTextAnswer(question.id, e.target.value)}
                    placeholder="Votre réponse..."
                    className="w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm focus:border-brand-400 focus:outline-none disabled:bg-slate-50"
                  />
                  {detail && !detail.isCorrect && detail.correctAnswerLabel && (
                    <p className="mt-2 text-xs text-slate-600">
                      Réponse attendue : <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">{detail.correctAnswerLabel}</code>
                    </p>
                  )}
                </div>
              ) : question.type === "DRAG_DROP" ? (
                <div className="mt-3 flex flex-col gap-2">
                  {(dragOrder[question.id] ?? []).map((answerId, index) => (
                    <div
                      key={answerId}
                      draggable={!result}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, question.id, index)}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-mono ${
                        result ? "border-slate-200 bg-slate-50" : "cursor-move border-slate-200 hover:border-brand-300"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="flex-1">{labelById(question, answerId)}</span>
                      {!result && (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label="Monter"
                            onClick={() => moveDragItem(question.id, index, -1)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label="Descendre"
                            onClick={() => moveDragItem(question.id, index, 1)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {detail && !detail.isCorrect && (
                    <p className="mt-1 text-xs text-slate-600">
                      Ordre attendu :{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">
                        {detail.correctAnswerIds.map((id) => labelById(question, id)).join(" → ")}
                      </code>
                    </p>
                  )}
                </div>
              ) : (
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
              )}
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
          {isSubmitting ? "Correction..." : "Valider mes réponses"}
        </button>
      ) : (
        <div className="mt-5 flex items-center gap-4">
          <p className={`text-lg font-bold ${result.passed ? "text-emerald-600" : "text-red-600"}`}>
            Score : {result.score}% {result.passed ? "— Réussi 🎉" : "— Non validé"}
          </p>
          <button onClick={reset} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
