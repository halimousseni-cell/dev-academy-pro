import { useState } from "react";
import { FileText, Users, Send } from "lucide-react";
import {
  createInitialState,
  fetchAdminUsers,
  fetchDocument,
  getCurrentUser,
  USERS,
  DOCUMENTS,
  type AccessState,
  type FetchResult,
} from "../../lib/accessControlDemo";

interface HistoryEntry {
  request: string;
  result: FetchResult;
}

export function AccessControlDemoPage() {
  const [state, setState] = useState<AccessState>(() => createInitialState());
  const [docId, setDocId] = useState("2");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentUser = getCurrentUser(state);
  const myDocuments = DOCUMENTS.filter((d) => d.ownerId === currentUser.id);

  function toggleProtection() {
    setState((prev) => ({ ...prev, protectionEnabled: !prev.protectionEnabled }));
  }

  function selectUser(userId: number) {
    setState((prev) => ({ ...prev, currentUserId: userId }));
  }

  function runFetchDocument() {
    const id = Number(docId);
    const result = fetchDocument(state, id);
    setHistory((prev) => [...prev, { request: `GET /api/documents/${id}`, result }]);
  }

  function runFetchAdminUsers() {
    const result = fetchAdminUsers(state);
    setHistory((prev) => [...prev, { request: "GET /api/admin/users", result }]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Contrôle d'accès défaillant</h1>
      <p className="mt-1 text-sm text-slate-500">
        Le contrôle d'accès consiste à vérifier, pour chaque requête, que l'utilisateur authentifié a le
        droit d'accéder à la ressource ou à l'action demandée — pas seulement qu'il est connecté. Cette
        démonstration simule une API de documents (factures) en mémoire, sans appel réseau réel.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Le problème</h2>
          <p className="mt-1">
            Une route comme <code>/api/documents/:id</code> vérifie souvent uniquement que l'utilisateur est
            connecté, mais pas qu'il est <strong>propriétaire</strong> du document <code>id</code>. En
            changeant simplement l'identifiant dans l'URL (référence directe non sécurisée, IDOR), un
            utilisateur peut accéder aux données d'un autre. De même, une route d'administration peut
            n'être protégée que côté interface, sans vérification du rôle côté serveur.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Vérifier l'autorisation sur le serveur pour chaque requête, pas seulement l'authentification.</li>
            <li>Refuser par défaut (deny by default) et vérifier la propriété de la ressource.</li>
            <li>Protéger aussi les routes d'administration côté serveur, pas seulement dans l'interface.</li>
            <li>Préférer des identifiants non devinables ou indirects pour les ressources sensibles.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Vérification des autorisations</p>
          <p className="text-xs text-slate-500">
            {state.protectionEnabled
              ? "Activée : chaque requête vérifie la propriété du document ou le rôle requis."
              : "Désactivée : l'API vérifie seulement que l'utilisateur est connecté."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleProtection}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold text-white ${
              state.protectionEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {state.protectionEnabled ? "Protection activée" : "Protection désactivée"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Connecté en tant que</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                user.id === currentUser.id
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-300 text-slate-600 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {user.name} ({user.role})
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Mes documents : {myDocuments.map((d) => `#${d.id} ${d.title}`).join(", ") || "aucun"}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4 text-brand-600" />
            Accéder à un document par identifiant
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Documents existants : {DOCUMENTS.map((d) => `#${d.id}`).join(", ")}. Essayez un identifiant qui
            n'appartient pas à {currentUser.name}.
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              type="number"
              className="w-24 rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button
              onClick={runFetchDocument}
              className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Send className="h-3.5 w-3.5" />
              GET /api/documents/{docId}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Users className="h-4 w-4 text-brand-600" />
            Liste des utilisateurs (réservée aux admins)
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cette route ne devrait être accessible qu'au rôle <code>admin</code>.
          </p>
          <button
            onClick={runFetchAdminUsers}
            className="mt-2 flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Send className="h-3.5 w-3.5" />
            GET /api/admin/users
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          Historique des requêtes
        </div>
        <div className="max-h-72 overflow-y-auto p-3 text-sm">
          {history.length === 0 && <p className="text-slate-400">Aucune requête envoyée.</p>}
          <ul className="space-y-2">
            {history
              .slice()
              .reverse()
              .map((entry, i) => (
                <li key={i}>
                  <p className="font-mono text-xs text-slate-600">{entry.request}</p>
                  <p className="font-mono text-xs">
                    <span
                      className={
                        entry.result.status < 300
                          ? "font-semibold text-emerald-600"
                          : entry.result.status < 500
                            ? "font-semibold text-amber-600"
                            : "font-semibold text-red-600"
                      }
                    >
                      {entry.result.status} {entry.result.statusText}
                    </span>
                  </p>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                    {JSON.stringify(entry.result.body, null, 2)}
                  </pre>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
