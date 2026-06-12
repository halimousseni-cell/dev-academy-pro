import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Trophy, BookOpen, Layers, Target, CheckCircle2, XCircle } from "lucide-react";
import { api } from "../api/client";
import type { DashboardData } from "../types";
import { StatCard } from "../components/dashboard/StatCard";
import { ProgressBar } from "../components/dashboard/ProgressBar";
import { BadgeList } from "../components/dashboard/BadgeList";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<DashboardData>("/progress/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Impossible de charger le tableau de bord."));
  }, []);

  if (error) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Chargement...</p>;
  }

  const { stats, weeklyGoal, badges, user, moduleStats, recentActivity } = data;
  const lessonsPercent = stats.totalLessons === 0 ? 0 : Math.round((stats.completedLessons / stats.totalLessons) * 100);
  const weeklyPercent = weeklyGoal.targetMinutes === 0 ? 0 : Math.round((weeklyGoal.achievedMinutes / weeklyGoal.targetMinutes) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Bonjour {user.firstName} 👋
      </h1>
      <p className="mt-1 text-sm text-slate-500">Voici un aperçu de votre progression.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Trophy} label="Niveau" value={String(stats.level)} />
        <StatCard icon={Clock} label="Temps total" value={formatDuration(stats.totalTimeSeconds)} />
        <StatCard
          icon={BookOpen}
          label="Leçons"
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          sublabel="terminées"
        />
        <StatCard
          icon={Layers}
          label="Modules"
          value={`${stats.completedModules}/${stats.totalModules}`}
          sublabel="terminés"
        />
        <StatCard icon={Target} label="Quiz réussis" value={String(stats.quizzesPassed)} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Progression globale</h2>
          <p className="mt-1 text-sm text-slate-500">{lessonsPercent}% du parcours terminé</p>
          <div className="mt-3">
            <ProgressBar percent={lessonsPercent} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Objectif hebdomadaire</h2>
          <p className="mt-1 text-sm text-slate-500">
            {weeklyGoal.achievedMinutes} / {weeklyGoal.targetMinutes} minutes cette semaine
          </p>
          <div className="mt-3">
            <ProgressBar percent={weeklyPercent} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{weeklyGoal.quizAttemptsThisWeek} tentative(s) de quiz cette semaine</p>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Badges et récompenses</h2>
        <div className="mt-3">
          <BadgeList badges={badges} />
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Progression par module</h2>
          <div className="mt-3 flex flex-col gap-4">
            {moduleStats.map((module) => (
              <div key={module.slug}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{module.title}</span>
                  <span className="text-xs text-slate-500">
                    {module.completedLessons}/{module.totalLessons} leçons · {module.quizzesPassed}/{module.totalQuizzes} quiz
                  </span>
                </div>
                <div className="mt-1.5">
                  <ProgressBar percent={module.progressPercent} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Activité récente</h2>
          {recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Aucune tentative de quiz pour le moment.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {recentActivity.map((activity, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {activity.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{activity.quizTitle}</p>
                    <p className="text-xs text-slate-500">
                      {activity.moduleTitle} · {activity.score}% · {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-8">
        <Link
          to="/modules"
          className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continuer mon parcours
        </Link>
      </div>
    </div>
  );
}
