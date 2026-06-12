import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Rocket, Square } from "lucide-react";
import { CAPSTONE_STAGES } from "../../lib/capstone/capstoneProject";

const STORAGE_KEY = "capstone-progress";

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function CapstoneProjectPage() {
  const [done, setDone] = useState<Record<string, boolean>>(() => loadProgress());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }, [done]);

  function toggle(taskId: string) {
    setDone((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }

  const allTasks = CAPSTONE_STAGES.flatMap((s) => s.tasks);
  const completedCount = allTasks.filter((t) => done[t.id]).length;
  const progressPercent = allTasks.length === 0 ? 0 : Math.round((completedCount / allTasks.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Projet fil rouge</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Mettez en pratique tout ce que vous avez appris en construisant un projet complet, du cahier des charges au
        déploiement. Cochez les étapes au fur et à mesure de votre progression — votre avancement est sauvegardé
        localement dans votre navigateur.
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Progression globale</span>
          <span className="font-semibold text-brand-600">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {CAPSTONE_STAGES.map((stage) => {
          const stageDone = stage.tasks.filter((t) => done[t.id]).length;
          return (
            <div key={stage.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{stage.title}</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {stageDone}/{stage.tasks.length}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-brand-700">{stage.goal}</p>
              <p className="mt-2 text-sm text-slate-600">{stage.description}</p>

              <ul className="mt-4 flex flex-col gap-2">
                {stage.tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => toggle(task.id)}
                      className="flex w-full items-start gap-2 rounded-md p-1.5 text-left text-sm hover:bg-slate-50"
                    >
                      {done[task.id] ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span className={done[task.id] ? "text-slate-400 line-through" : "text-slate-700"}>{task.label}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {stage.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                  {stage.links.map((link) => (
                    <Link key={link.to} to={link.to} className="text-xs font-medium text-brand-600 hover:underline">
                      {link.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
