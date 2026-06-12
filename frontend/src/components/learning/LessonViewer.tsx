import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import type { Lesson } from "../../types";

export function LessonViewer({ lesson, onCompleted }: { lesson: Lesson; onCompleted: () => void }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();

    if (lesson.status === "NOT_STARTED") {
      api
        .post("/progress/lessons", { lessonId: lesson.id, status: "IN_PROGRESS", timeSpentSeconds: 0 })
        .catch(() => undefined);
    }
  }, [lesson.id, lesson.status]);

  async function handleComplete() {
    setIsCompleting(true);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
    try {
      await api.post("/progress/lessons", { lessonId: lesson.id, status: "COMPLETED", timeSpentSeconds });
      onCompleted();
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2>
        {lesson.status === "COMPLETED" ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Terminée
          </span>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isCompleting ? "..." : "Marquer comme terminée"}
          </button>
        )}
      </div>

      <div className="prose-lesson mt-4">
        <ReactMarkdown>{lesson.contentMd}</ReactMarkdown>
      </div>
    </div>
  );
}
