import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Database,
  Repeat,
  Lock,
  Settings,
  KeyRound,
  Swords,
  Bug,
  DoorOpen,
  Brain,
  Puzzle,
  type LucideIcon,
} from "lucide-react";

interface CenterCard {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string | null;
}

const OWASP_MODULES: CenterCard[] = [
  {
    title: "XSS — Cross-Site Scripting",
    description: "Injection de scripts dans une page web. Comparez une version vulnérable et une version protégée.",
    icon: ShieldAlert,
    to: "/securite/xss",
  },
  {
    title: "Injection SQL",
    description: "Manipulation de requêtes SQL via des entrées non filtrées.",
    icon: Database,
    to: "/securite/sqli",
  },
  {
    title: "CSRF — Cross-Site Request Forgery",
    description: "Exécution d'actions à l'insu de l'utilisateur authentifié.",
    icon: Repeat,
    to: "/securite/csrf",
  },
  {
    title: "Contrôle d'accès défaillant",
    description: "Accès à des ressources ou actions sans autorisation suffisante.",
    icon: Lock,
    to: "/securite/controle-acces",
  },
  {
    title: "Mauvaise configuration de sécurité",
    description: "En-têtes manquants, options par défaut dangereuses, messages d'erreur trop verbeux.",
    icon: Settings,
    to: "/securite/configuration",
  },
  {
    title: "Authentification défaillante",
    description: "Mots de passe faibles, sessions mal protégées, absence de limitation des tentatives.",
    icon: KeyRound,
    to: "/securite/authentification",
  },
];

const GAMES: CenterCard[] = [
  {
    title: "Quiz Battle",
    description: "Affrontez d'autres apprenants sur des questions de sécurité et de programmation.",
    icon: Swords,
    to: "/securite/jeux/quiz-battle",
  },
  {
    title: "Chasse aux bugs",
    description: "Trouvez les failles cachées dans des extraits de code.",
    icon: Bug,
    to: "/securite/jeux/chasse-aux-bugs",
  },
  {
    title: "Escape Game",
    description: "Résolvez une série d'énigmes techniques pour vous échapper.",
    icon: DoorOpen,
    to: "/securite/jeux/escape-game",
  },
  {
    title: "Memory",
    description: "Associez les concepts de sécurité à leurs définitions.",
    icon: Brain,
    to: "/securite/jeux/memory",
  },
  {
    title: "Puzzle JS",
    description: "Réordonnez des fragments de code JavaScript pour reconstituer un programme valide.",
    icon: Puzzle,
    to: "/securite/jeux/puzzle-js",
  },
];

function CardGrid({ cards }: { cards: CenterCard[] }) {
  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const content = (
          <>
            <Icon className="h-8 w-8 text-brand-600" />
            <h3 className="mt-3 font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            {!card.to && (
              <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                Bientôt disponible
              </span>
            )}
          </>
        );

        if (!card.to) {
          return (
            <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-5 opacity-60 shadow-sm">
              {content}
            </div>
          );
        }

        return (
          <Link
            key={card.title}
            to={card.to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function SecurityCenterIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Centre Cybersécurité &amp; Jeux</h1>
      <p className="mt-1 text-sm text-slate-500">
        Découvrez les vulnérabilités du Top 10 OWASP dans des environnements sandboxés dédiés — jamais sur
        l'application réelle — et entraînez-vous via des jeux pédagogiques.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Modules OWASP Top 10</h2>
      <CardGrid cards={OWASP_MODULES} />

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Jeux pédagogiques</h2>
      <CardGrid cards={GAMES} />
    </div>
  );
}
