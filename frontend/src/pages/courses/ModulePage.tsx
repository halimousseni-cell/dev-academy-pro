import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { api } from "../../api/client";
import type { ModuleDetail } from "../../types";
import { ChapterNav, type SelectedItem } from "../../components/learning/ChapterNav";
import { LessonViewer } from "../../components/learning/LessonViewer";
import { QuizPlayer } from "../../components/learning/QuizPlayer";

export function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedItem | null>(null);

  const load = useCallback(() => {
    if (!slug) return;
    api
      .get<{ module: ModuleDetail }>(`/modules/${slug}`)
      .then((res) => {
        setModule(res.data.module);
        setSelected((current) => {
          if (current) return current;
          const firstChapter = res.data.module.chapters[0];
          const firstLesson = firstChapter?.lessons[0];
          return firstLesson ? { kind: "lesson", id: firstLesson.id } : null;
        });
      })
      .catch(() => setError("Impossible de charger ce module."));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="mx-auto max-w-5xl px-4 py-8 text-red-600">{error}</p>;
  if (!module) return <p className="mx-auto max-w-5xl px-4 py-8 text-slate-400">Chargement...</p>;

  const lesson = selected?.kind === "lesson" ? findLesson(module, selected.id) : null;
  const quiz = selected?.kind === "quiz" ? findQuiz(module, selected.id) : null;
  const moduleCompleted = module.chapters.every(
    (c) => c.lessons.every((l) => l.status === "COMPLETED") && c.quizzes.every((q) => q.bestAttempt?.passed)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{module.category}</p>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{module.description}</p>
        </div>
        {moduleCompleted && (
          <Link
            to={`/modules/${slug}/examen`}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <GraduationCap className="h-4 w-4" />
            Passer l'examen final
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-4 md:self-start">
          <ChapterNav chapters={module.chapters} selected={selected} onSelect={setSelected} />
        </aside>

        <main className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {lesson && <LessonViewer key={lesson.id} lesson={lesson} onCompleted={load} />}
          {quiz && <QuizPlayer key={quiz.id} quiz={quiz} onPassed={load} />}
          {!lesson && !quiz && <p className="text-slate-400">Sélectionnez une leçon ou un quiz.</p>}
        </main>
      </div>
    </div>
  );
}

function findLesson(module: ModuleDetail, id: string) {
  for (const chapter of module.chapters) {
    const lesson = chapter.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return null;
}

function findQuiz(module: ModuleDetail, id: string) {
  for (const chapter of module.chapters) {
    const quiz = chapter.quizzes.find((q) => q.id === id);
    if (quiz) return quiz;
  }
  return null;
}
