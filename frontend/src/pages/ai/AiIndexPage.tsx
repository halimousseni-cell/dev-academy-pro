import { Link } from "react-router-dom";
import { Sparkles, Boxes, type LucideIcon } from "lucide-react";

interface IndexCard {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}

const CARDS: IndexCard[] = [
  {
    title: "Assistant IA",
    description: "Demandez une explication, une correction de code, ou générez un exercice sur mesure.",
    icon: Sparkles,
    to: "/ia/assistant",
  },
  {
    title: "Générateur de projets",
    description: "Choisissez un type de projet, sélectionnez des options de sécurité et obtenez une structure et une analyse OWASP ASVS.",
    icon: Boxes,
    to: "/ia/generateur-projets",
  },
];

export function AiIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">IA pédagogique &amp; génération de projets</h1>
      <p className="mt-1 text-sm text-slate-500">
        Des outils pour vous accompagner dans votre apprentissage et démarrer rapidement de nouveaux projets.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
