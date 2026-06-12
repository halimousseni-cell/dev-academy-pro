import { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { Database } from "sql.js";
import { createDatabase, runQuery, type RunResult } from "../../lib/sqlLab";
import { buildVulnerableQuery, SAFE_QUERY_TEMPLATE, SQLI_PAYLOADS, USERS_SEED_SQL } from "../../lib/sqliDemo";

interface AttemptResult {
  sql: string;
  result: RunResult;
}

function ResultPanel({
  title,
  description,
  icon: Icon,
  iconClass,
  attempt,
}: {
  title: string;
  description: string;
  icon: typeof ShieldAlert;
  iconClass: string;
  attempt: AttemptResult | null;
}) {
  const rows = attempt?.result.results[0]?.rows ?? [];
  const columns = attempt?.result.results[0]?.columns ?? [];
  const loggedIn = rows.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>
      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-500">{description}</p>
      <div className="p-3">
        {!attempt ? (
          <p className="text-sm text-slate-400">Soumettez le formulaire pour voir le résultat.</p>
        ) : (
          <>
            <p className="mb-2 font-mono text-xs text-slate-600">Requête exécutée :</p>
            <pre className="mb-3 overflow-x-auto rounded-md bg-slate-50 p-2 text-xs text-slate-700">{attempt.sql}</pre>
            {attempt.result.error ? (
              <p className="font-mono text-sm text-red-600">Erreur : {attempt.result.error}</p>
            ) : (
              <>
                <p className={`mb-2 text-sm font-semibold ${loggedIn ? "text-emerald-600" : "text-red-600"}`}>
                  {loggedIn ? "Connexion réussie !" : "Échec de la connexion."}
                </p>
                {rows.length > 0 && (
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {columns.map((col) => (
                          <th key={col} className="px-2 py-1 font-semibold text-slate-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-2 py-1 font-mono text-slate-600">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SqliDemoPage() {
  const dbRef = useRef<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [vulnerable, setVulnerable] = useState<AttemptResult | null>(null);
  const [safe, setSafe] = useState<AttemptResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    createDatabase(USERS_SEED_SQL).then((db) => {
      if (cancelled) {
        db.close();
        return;
      }
      dbRef.current = db;
      setLoading(false);
    });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, []);

  function handleSubmit() {
    const db = dbRef.current;
    if (!db) return;

    const vulnerableSql = buildVulnerableQuery(username, password);
    setVulnerable({ sql: vulnerableSql, result: runQuery(db, vulnerableSql) });

    const safeSql = `${SAFE_QUERY_TEMPLATE}\n-- paramètres : [${JSON.stringify(username)}, ${JSON.stringify(password)}]`;
    setSafe({ sql: safeSql, result: runQuery(db, SAFE_QUERY_TEMPLATE, [username, password]) });
  }

  function applyPayload(payload: (typeof SQLI_PAYLOADS)[number]) {
    setUsername(payload.username);
    setPassword(payload.password);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Injection SQL</h1>
      <p className="mt-1 text-sm text-slate-500">
        L'injection SQL consiste à manipuler une requête SQL en y insérant des entrées non prévues. La
        démonstration ci-dessous utilise une base SQLite en mémoire (WebAssembly, exécutée dans votre
        navigateur) — aucune base de données réelle n'est concernée.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Le problème</h2>
          <p className="mt-1">
            Si une application construit ses requêtes SQL par concaténation de chaînes avec des entrées
            utilisateur, un attaquant peut injecter des fragments SQL (ex : <code>' OR '1'='1</code>) qui
            modifient la logique de la requête : contournement d'authentification, extraction de données,
            voire suppression de tables.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Utiliser des requêtes préparées / paramétrées (placeholders <code>?</code>).</li>
            <li>Ne jamais construire de SQL par concaténation de chaînes avec des entrées utilisateur.</li>
            <li>Utiliser un ORM qui échappe et paramètre automatiquement les requêtes.</li>
            <li>Appliquer le principe du moindre privilège sur le compte de connexion à la base.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Formulaire de connexion (démonstration)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Comptes existants : <code className="rounded bg-slate-100 px-1">admin / admin123</code>,{" "}
          <code className="rounded bg-slate-100 px-1">alice / alice2024</code>,{" "}
          <code className="rounded bg-slate-100 px-1">bob / bobsecret</code>.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              spellCheck={false}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Mot de passe</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              spellCheck={false}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SQLI_PAYLOADS.map((payload) => (
            <button
              key={payload.label}
              onClick={() => applyPayload(payload)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              {payload.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-3 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Chargement de la base..." : "Se connecter"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ResultPanel
          title="Site vulnérable (concaténation)"
          description="La requête est construite en insérant directement les valeurs saisies dans le texte SQL."
          icon={ShieldAlert}
          iconClass="text-red-600"
          attempt={vulnerable}
        />
        <ResultPanel
          title="Site protégé (requête paramétrée)"
          description="Les valeurs saisies sont passées comme paramètres liés (?), jamais interprétées comme du SQL."
          icon={ShieldCheck}
          iconClass="text-emerald-600"
          attempt={safe}
        />
      </div>
    </div>
  );
}
