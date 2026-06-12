import { Link } from "react-router-dom";
import { Code2, GitBranch, Terminal, Database, Globe, type LucideIcon } from "lucide-react";

interface LabCard {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string | null;
}

const LABS: LabCard[] = [
  {
    title: "Laboratoire de code",
    description: "Écrivez et exécutez du HTML/CSS/JS dans un aperçu isolé (sandbox).",
    icon: Code2,
    to: "/laboratoires/code",
  },
  {
    title: "Simulateur Git",
    description: "Pratiquez les commandes Git dans un environnement simulé, sans risque.",
    icon: GitBranch,
    to: "/laboratoires/git",
  },
  {
    title: "Simulateur Linux",
    description: "Un terminal pédagogique avec un système de fichiers virtuel.",
    icon: Terminal,
    to: "/laboratoires/linux",
  },
  {
    title: "Laboratoire SQL",
    description: "Exécutez des requêtes SQL sur une base SQLite en mémoire.",
    icon: Database,
    to: "/laboratoires/sql",
  },
  {
    title: "Laboratoire API",
    description: "Testez des appels REST/JWT/rôles sur un serveur simulé.",
    icon: Globe,
    to: "/laboratoires/api",
  },
];

export function LabsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Laboratoires interactifs</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pratiquez dans des environnements sandboxés, sans aucun risque pour votre machine.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => {
          const Icon = lab.icon;
          const content = (
            <>
              <Icon className="h-8 w-8 text-brand-600" />
              <h2 className="mt-3 font-semibold text-slate-900">{lab.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{lab.description}</p>
              {!lab.to && (
                <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Bientôt disponible
                </span>
              )}
            </>
          );

          if (!lab.to) {
            return (
              <div key={lab.title} className="rounded-xl border border-slate-200 bg-white p-5 opacity-60 shadow-sm">
                {content}
              </div>
            );
          }

          return (
            <Link
              key={lab.title}
              to={lab.to}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
