import { useState } from "react";
import { Send, RotateCcw, KeyRound } from "lucide-react";
import {
  createInitialState,
  decodeTokenUnsafe,
  handleRequest,
  DEMO_ACCOUNTS,
  type ApiLabState,
  type MockResponse,
} from "../../lib/apiLab";

interface HistoryEntry {
  method: string;
  path: string;
  status: number;
  statusText: string;
}

interface PresetRequest {
  label: string;
  method: string;
  path: string;
  body?: string;
}

const PRESETS: PresetRequest[] = [
  { label: "Connexion (admin)", method: "POST", path: "/api/auth/login", body: '{\n  "email": "admin@devacademy.pro",\n  "password": "admin123"\n}' },
  { label: "Connexion (auteur)", method: "POST", path: "/api/auth/login", body: '{\n  "email": "auteur@devacademy.pro",\n  "password": "auteur123"\n}' },
  { label: "Connexion (visiteur)", method: "POST", path: "/api/auth/login", body: '{\n  "email": "visiteur@devacademy.pro",\n  "password": "visiteur123"\n}' },
  { label: "Mon profil", method: "GET", path: "/api/auth/me" },
  { label: "Liste des articles", method: "GET", path: "/api/articles" },
  { label: "Détail article #3 (brouillon)", method: "GET", path: "/api/articles/3" },
  { label: "Créer un article", method: "POST", path: "/api/articles", body: '{\n  "title": "Mon nouvel article",\n  "content": "Contenu...",\n  "published": false\n}' },
  { label: "Publier l'article #3", method: "PUT", path: "/api/articles/3", body: '{\n  "published": true\n}' },
  { label: "Supprimer l'article #3", method: "DELETE", path: "/api/articles/3" },
  { label: "Liste des utilisateurs (admin)", method: "GET", path: "/api/users" },
];

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export function ApiLabPage() {
  const [apiState, setApiState] = useState<ApiLabState>(() => createInitialState());
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/articles");
  const [token, setToken] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<MockResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function send() {
    const headers: Record<string, string> = {};
    if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
    const result = handleRequest(apiState, { method, path, headers, body });
    setApiState(result.state);
    setResponse(result.response);
    setHistory((prev) => [...prev, { method, path, status: result.response.status, statusText: result.response.statusText }]);

    const respBody = result.response.body as { token?: string } | null;
    if (respBody && typeof respBody === "object" && typeof respBody.token === "string") {
      setToken(respBody.token);
    }
  }

  function applyPreset(preset: PresetRequest) {
    setMethod(preset.method);
    setPath(preset.path);
    setBody(preset.body ?? "");
  }

  function reset() {
    setApiState(createInitialState());
    setMethod("GET");
    setPath("/api/articles");
    setToken("");
    setBody("");
    setResponse(null);
    setHistory([]);
  }

  const decoded = token ? decodeTokenUnsafe(token) : null;
  const showBody = method === "POST" || method === "PUT" || method === "PATCH";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Laboratoire API — REST &amp; JWT</h1>
      <p className="mt-1 text-sm text-slate-500">
        Envoyez des requêtes à un serveur REST simulé (en mémoire, aucun appel réseau réel) pour pratiquer
        l'authentification par JWT et la gestion des rôles (admin / author / user). Le format de token utilisé
        ici est pédagogique — la signature n'utilise pas de cryptographie réelle.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <span className="text-xs font-semibold text-slate-500">Requête</span>
              <div className="flex gap-2">
                <button
                  onClick={send}
                  className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <Send className="h-3.5 w-3.5" />
                  Envoyer
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Réinitialiser
                </button>
              </div>
            </div>
            <div className="space-y-3 p-3">
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm font-mono"
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  spellCheck={false}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="/api/articles"
                />
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <KeyRound className="h-3.5 w-3.5" />
                  Token (Authorization: Bearer ...)
                </label>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  spellCheck={false}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="Collez ici le token reçu après une connexion"
                />
              </div>

              {showBody && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Corps (JSON)</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    spellCheck={false}
                    className="h-32 w-full resize-none rounded-md border border-slate-300 p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Réponse
            </div>
            <div className="p-3">
              {!response && <p className="text-sm text-slate-400">Envoyez une requête pour voir la réponse.</p>}
              {response && (
                <>
                  <p className="mb-2 font-mono text-sm">
                    <span
                      className={
                        response.status < 300
                          ? "font-semibold text-emerald-600"
                          : response.status < 500
                            ? "font-semibold text-amber-600"
                            : "font-semibold text-red-600"
                      }
                    >
                      {response.status} {response.statusText}
                    </span>
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
                    {response.body === null ? "(pas de contenu)" : JSON.stringify(response.body, null, 2)}
                  </pre>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Comptes de démonstration
            </div>
            <div className="space-y-2 p-3 text-xs">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.email}>
                  <p className="font-mono font-semibold text-slate-800">{account.email}</p>
                  <p className="font-mono text-slate-500">mot de passe : {account.password}</p>
                  <p className="text-slate-400">
                    rôle <span className="font-mono">{account.role}</span> — {account.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Requêtes prêtes à l'emploi
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {decoded && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Token décodé
              </div>
              <div className="space-y-2 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-600">Header</p>
                  <pre className="overflow-auto rounded-md bg-slate-50 p-2 text-slate-700">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-slate-600">Payload</p>
                  <pre className="overflow-auto rounded-md bg-slate-50 p-2 text-slate-700">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                </div>
                <p className="text-slate-400">
                  La signature n'est jamais lisible côté client dans un vrai JWT, mais le header et le payload sont
                  toujours décodables — ne jamais y stocker d'information sensible.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Historique
            </div>
            <div className="max-h-48 overflow-y-auto p-3 text-xs">
              {history.length === 0 && <p className="text-slate-400">Aucune requête envoyée.</p>}
              <ul className="space-y-1">
                {history
                  .slice()
                  .reverse()
                  .map((entry, i) => (
                    <li key={i} className="flex items-center justify-between font-mono">
                      <span>
                        {entry.method} {entry.path}
                      </span>
                      <span
                        className={
                          entry.status < 300 ? "text-emerald-600" : entry.status < 500 ? "text-amber-600" : "text-red-600"
                        }
                      >
                        {entry.status}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
