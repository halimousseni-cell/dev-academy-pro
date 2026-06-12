import { ShieldAlert, ShieldCheck } from "lucide-react";
import {
  RESPONSE_HEADERS,
  ERROR_PAGE,
  DIRECTORY_LISTING,
  CORS_CONFIG,
  type HttpExample,
} from "../../lib/securityMisconfigDemo";

function HttpPanel({ example, kind }: { example: HttpExample; kind: "insecure" | "secure" }) {
  const Icon = kind === "insecure" ? ShieldAlert : ShieldCheck;
  const iconClass = kind === "insecure" ? "text-red-600" : "text-emerald-600";
  const label = kind === "insecure" ? "Mal configuré" : "Durci";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-xs font-semibold text-slate-700">{label}</span>
      </div>
      <div className="p-3 font-mono text-xs">
        <p className="text-slate-500">{example.title}</p>
        <p className="mt-1 font-semibold text-slate-800">{example.status}</p>
        <ul className="mt-1 space-y-0.5 text-slate-600">
          {example.headers.map((header) => (
            <li key={header}>{header}</li>
          ))}
        </ul>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-slate-700">
          {example.body}
        </pre>
      </div>
    </div>
  );
}

interface Section {
  title: string;
  description: string;
  example: { insecure: HttpExample; secure: HttpExample };
}

const SECTIONS: Section[] = [
  {
    title: "En-têtes de réponse HTTP",
    description:
      "Le serveur expose les versions exactes du logiciel (Apache, PHP) — utiles à un attaquant pour cibler des failles connues — et n'envoie aucun en-tête de sécurité (CSP, HSTS, X-Frame-Options...).",
    example: RESPONSE_HEADERS,
  },
  {
    title: "Page d'erreur détaillée",
    description:
      "En cas d'erreur, l'application renvoie la pile d'appels complète, les chemins de fichiers internes, voire des identifiants de connexion à la base de données.",
    example: ERROR_PAGE,
  },
  {
    title: "Listing de répertoire",
    description:
      "Le serveur de fichiers statiques liste le contenu d'un dossier (autoindex activé), exposant des sauvegardes ou fichiers de configuration sensibles.",
    example: DIRECTORY_LISTING,
  },
  {
    title: "Configuration CORS",
    description:
      "Une politique CORS trop permissive (origine \"*\" combinée à l'envoi des cookies) permet à n'importe quel site de faire des requêtes authentifiées vers l'API au nom de l'utilisateur.",
    example: CORS_CONFIG,
  },
];

export function SecurityMisconfigDemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Mauvaise configuration de sécurité</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cette catégorie regroupe les failles qui ne viennent pas du code applicatif mais de la
        configuration : en-têtes manquants, messages d'erreur trop verbeux, options par défaut dangereuses,
        services exposés inutilement... Les exemples ci-dessous sont des réponses HTTP statiques, à but
        purement illustratif.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Le problème</h2>
          <p className="mt-1">
            Une configuration par défaut ou trop permissive (frameworks en mode debug, en-têtes de sécurité
            absents, erreurs détaillées en production, CORS ouvert, ports ou répertoires exposés) facilite
            la reconnaissance et l'exploitation par un attaquant, même sans bug applicatif.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Désactiver le mode debug et les pages d'erreur détaillées en production.</li>
            <li>Définir des en-têtes de sécurité (CSP, HSTS, X-Frame-Options, X-Content-Type-Options...).</li>
            <li>Masquer les bannières de version des serveurs et frameworks.</li>
            <li>Désactiver le listing de répertoire et restreindre les CORS à une liste blanche.</li>
            <li>Revoir périodiquement la configuration via une checklist de sécurité.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-slate-800">{section.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{section.description}</p>
            <div className="mt-2 grid gap-4 lg:grid-cols-2">
              <HttpPanel example={section.example.insecure} kind="insecure" />
              <HttpPanel example={section.example.secure} kind="secure" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
