import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { api } from "../../api/client";
import type { ModuleSummary } from "../../types";
import { ProgressBar } from "../../components/dashboard/ProgressBar";

export function CourseListPage() {
  const [modules, setModules] = useState<ModuleSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ modules: ModuleSummary[] }>("/modules")
      .then((res) => setModules(res.data.modules))
      .catch(() => setError("Impossible de charger le parcours pédagogique."));
  }, []);

  if (error) return <p className="mx-auto max-w-4xl px-4 py-8 text-red-600">{error}</p>;
  if (!modules) return <p className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Chargement...</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Parcours pédagogique</h1>
      <p className="mt-1 text-sm text-slate-500">Suivez les modules dans l'ordre pour progresser efficacement.</p>

      <div className="mt-6 flex flex-col gap-4">
        {modules.map((m) => (
          <Link
            key={m.id}
            to={`/modules/${m.slug}`}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{m.category}</p>
                <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <BookOpen className="h-5 w-5 text-brand-500" />
                  {m.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{m.description}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">~{m.estimatedMinutes} min</span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-slate-500">
                <span>
                  {m.completedLessons}/{m.totalLessons} leçons
                </span>
                <span>{m.progressPercent}%</span>
              </div>
              <ProgressBar percent={m.progressPercent} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
