import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Play, RotateCcw, Database as DatabaseIcon } from "lucide-react";
import {
  createSeedDatabase,
  getSchema,
  runQuery,
  type RunResult,
  type TableSchema,
} from "../../lib/sqlLab";
import type { Database } from "sql.js";

const DEFAULT_QUERY = "SELECT * FROM etudiants;";

const SAMPLE_QUERIES = [
  { label: "Tous les étudiants", sql: "SELECT * FROM etudiants;" },
  { label: "Cours par catégorie", sql: "SELECT categorie, COUNT(*) AS nb_cours FROM cours GROUP BY categorie;" },
  {
    label: "Inscriptions avec jointure",
    sql:
      "SELECT e.prenom, e.nom, c.titre, i.progression\n" +
      "FROM inscriptions i\n" +
      "JOIN etudiants e ON e.id = i.etudiant_id\n" +
      "JOIN cours c ON c.id = i.cours_id\n" +
      "ORDER BY e.nom;",
  },
  {
    label: "Étudiants ayant terminé un cours",
    sql:
      "SELECT DISTINCT e.prenom, e.nom\n" +
      "FROM etudiants e\n" +
      "JOIN inscriptions i ON i.etudiant_id = e.id\n" +
      "WHERE i.progression = 100;",
  },
  {
    label: "Créer une table",
    sql: "CREATE TABLE badges (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  code TEXT NOT NULL\n);",
  },
];

export function SqlLabPage() {
  const dbRef = useRef<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<RunResult | null>(null);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    createSeedDatabase()
      .then((db) => {
        if (cancelled) {
          db.close();
          return;
        }
        dbRef.current = db;
        setSchema(getSchema(db));
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, []);

  function execute(sql: string) {
    const db = dbRef.current;
    if (!db) return;
    const res = runQuery(db, sql);
    setResult(res);
    setSchema(getSchema(db));
    setHistory((prev) => [...prev, sql]);
  }

  function handleRun() {
    const sql = query.trim();
    if (!sql) return;
    execute(sql);
  }

  function handleReset() {
    dbRef.current?.close();
    setLoading(true);
    setResult(null);
    setHistory([]);
    createSeedDatabase()
      .then((db) => {
        dbRef.current = db;
        setSchema(getSchema(db));
        setLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Laboratoire SQL</h1>
      <p className="mt-1 text-sm text-slate-500">
        Exécutez des requêtes SQL sur une base SQLite en mémoire (moteur WebAssembly exécuté entièrement
        dans votre navigateur). Aucune donnée n'est envoyée à un serveur, et la base est réinitialisée à
        chaque rechargement de la page.
      </p>

      {loadError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Erreur de chargement du moteur SQL : {loadError}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Chargement du moteur SQLite...
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
                <span className="text-xs font-semibold text-slate-500">Requête SQL</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Exécuter (Ctrl+Entrée)
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Réinitialiser la base
                  </button>
                </div>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="h-40 w-full resize-none border-0 p-3 font-mono text-sm text-slate-800 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => setQuery(sample.sql)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Résultat
              </div>
              <div className="max-h-96 overflow-auto p-3">
                {!result && <p className="text-sm text-slate-400">Exécutez une requête pour voir le résultat.</p>}
                {result?.error && (
                  <p className="font-mono text-sm text-red-600">Erreur : {result.error}</p>
                )}
                {result && !result.error && result.results.length === 0 && (
                  <p className="text-sm text-emerald-600">
                    Requête exécutée avec succès.
                    {result.rowsModified > 0 && ` ${result.rowsModified} ligne(s) affectée(s).`}
                  </p>
                )}
                {result?.results.map((res, i) => (
                  <div key={i} className={i > 0 ? "mt-4" : ""}>
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {res.columns.map((col) => (
                            <th key={col} className="px-2 py-1 font-semibold text-slate-700">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {res.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-2 py-1 font-mono text-slate-600">
                                {cell === null ? <span className="text-slate-400">NULL</span> : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {res.rows.length === 0 && (
                      <p className="px-2 py-1 text-sm text-slate-400">Aucune ligne.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                <DatabaseIcon className="h-3.5 w-3.5" />
                Schéma de la base
              </div>
              <div className="max-h-64 overflow-y-auto p-3 text-sm">
                {schema.map((table) => (
                  <div key={table.name} className="mb-3 last:mb-0">
                    <p className="font-mono font-semibold text-slate-800">{table.name}</p>
                    <ul className="mt-1 space-y-0.5 pl-3 text-xs text-slate-500">
                      {table.columns.map((col) => (
                        <li key={col.name} className="font-mono">
                          {col.name} <span className="text-slate-400">{col.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
                Historique
              </div>
              <div className="max-h-64 overflow-y-auto p-3 text-xs">
                {history.length === 0 && <p className="text-slate-400">Aucune requête exécutée.</p>}
                <ul className="space-y-2">
                  {history
                    .slice()
                    .reverse()
                    .map((sql, i) => (
                      <li key={i}>
                        <button
                          onClick={() => setQuery(sql)}
                          className="block w-full truncate rounded border border-slate-200 px-2 py-1 text-left font-mono text-slate-600 hover:border-brand-300 hover:text-brand-700"
                          title={sql}
                        >
                          {sql.split("\n")[0]}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
