import initSqlJs, { type BindParams, type Database, type SqlJsStatic } from "sql.js";

export const SEED_SQL = `
CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  date_inscription TEXT NOT NULL
);

CREATE TABLE cours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  categorie TEXT NOT NULL,
  duree_heures INTEGER NOT NULL
);

CREATE TABLE inscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  etudiant_id INTEGER NOT NULL REFERENCES etudiants(id),
  cours_id INTEGER NOT NULL REFERENCES cours(id),
  date_inscription TEXT NOT NULL,
  progression INTEGER NOT NULL DEFAULT 0
);

INSERT INTO etudiants (nom, prenom, email, date_inscription) VALUES
  ('Martin', 'Lucie', 'lucie.martin@example.com', '2026-01-12'),
  ('Bernard', 'Hugo', 'hugo.bernard@example.com', '2026-01-15'),
  ('Dubois', 'Chloe', 'chloe.dubois@example.com', '2026-02-01'),
  ('Thomas', 'Nathan', 'nathan.thomas@example.com', '2026-02-10'),
  ('Robert', 'Emma', 'emma.robert@example.com', '2026-03-05'),
  ('Petit', 'Leo', 'leo.petit@example.com', '2026-03-20');

INSERT INTO cours (titre, categorie, duree_heures) VALUES
  ('HTML5 & CSS3 - Fondamentaux', 'Front-end', 12),
  ('JavaScript - Fondamentaux', 'Front-end', 18),
  ('Git & GitHub - Fondamentaux', 'Outils', 8),
  ('Linux - Fondamentaux', 'Outils', 10),
  ('SQL - Fondamentaux', 'Donnees', 14),
  ('React - Fondamentaux', 'Front-end', 20),
  ('Node.js & Express - Fondamentaux', 'Back-end', 16);

INSERT INTO inscriptions (etudiant_id, cours_id, date_inscription, progression) VALUES
  (1, 1, '2026-01-13', 100),
  (1, 2, '2026-01-20', 80),
  (1, 5, '2026-02-15', 40),
  (2, 1, '2026-01-16', 100),
  (2, 3, '2026-01-22', 100),
  (2, 4, '2026-02-01', 60),
  (3, 2, '2026-02-02', 30),
  (3, 5, '2026-02-05', 0),
  (4, 1, '2026-02-11', 100),
  (4, 6, '2026-03-01', 50),
  (5, 3, '2026-03-06', 100),
  (5, 4, '2026-03-08', 100),
  (5, 5, '2026-03-15', 90),
  (6, 6, '2026-03-21', 10),
  (6, 7, '2026-03-25', 0);
`.trim();

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
}

export interface RunResult {
  results: QueryResult[];
  error: string | null;
  rowsModified: number;
}

export interface TableSchema {
  name: string;
  columns: { name: string; type: string }[];
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  }
  return sqlJsPromise;
}

export async function createDatabase(seedSql: string): Promise<Database> {
  const SQL = await loadSqlJs();
  const db = new SQL.Database();
  db.run(seedSql);
  return db;
}

export async function createSeedDatabase(): Promise<Database> {
  return createDatabase(SEED_SQL);
}

export function runQuery(db: Database, sql: string, params?: BindParams): RunResult {
  try {
    const results = db.exec(sql, params).map((res) => ({ columns: res.columns, rows: res.values }));
    return { results, error: null, rowsModified: db.getRowsModified() };
  } catch (err) {
    return { results: [], error: err instanceof Error ? err.message : String(err), rowsModified: 0 };
  }
}

export function getSchema(db: Database): TableSchema[] {
  const result = runQuery(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
  );
  if (result.results.length === 0) return [];

  return result.results[0].rows.map((row) => {
    const tableName = String(row[0]);
    const cols = runQuery(db, `PRAGMA table_info(${tableName});`);
    const columns = cols.results[0]
      ? cols.results[0].rows.map((colRow) => ({ name: String(colRow[1]), type: String(colRow[2]) }))
      : [];
    return { name: tableName, columns };
  });
}
