import { CheckCircle2, FileText, ListChecks } from "lucide-react";
import type { Chapter } from "../../types";

export type SelectedItem = { kind: "lesson" | "quiz"; id: string };

export function ChapterNav({
  chapters,
  selected,
  onSelect,
}: {
  chapters: Chapter[];
  selected: SelectedItem | null;
  onSelect: (item: SelectedItem) => void;
}) {
  return (
    <nav className="flex flex-col gap-4">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{chapter.title}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {chapter.lessons.map((lesson) => {
              const isActive = selected?.kind === "lesson" && selected.id === lesson.id;
              return (
                <li key={lesson.id}>
                  <button
                    onClick={() => onSelect({ kind: "lesson", id: lesson.id })}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                      isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {lesson.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    {lesson.title}
                  </button>
                </li>
              );
            })}
            {chapter.quizzes.map((quiz) => {
              const isActive = selected?.kind === "quiz" && selected.id === quiz.id;
              return (
                <li key={quiz.id}>
                  <button
                    onClick={() => onSelect({ kind: "quiz", id: quiz.id })}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                      isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {quiz.bestAttempt?.passed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <ListChecks className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    {quiz.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
