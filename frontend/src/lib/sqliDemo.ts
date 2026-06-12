export const USERS_SEED_SQL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL
);

INSERT INTO users (username, password, role) VALUES
  ('admin', 'admin123', 'admin'),
  ('alice', 'alice2024', 'user'),
  ('bob', 'bobsecret', 'user');
`.trim();

export const SAFE_QUERY_TEMPLATE = "SELECT id, username, role FROM users WHERE username = ? AND password = ?;";

export function buildVulnerableQuery(username: string, password: string): string {
  return `SELECT id, username, role FROM users WHERE username = '${username}' AND password = '${password}';`;
}

export const SQLI_PAYLOADS = [
  { label: "Identifiants normaux", username: "alice", password: "alice2024" },
  { label: "Mot de passe incorrect", username: "alice", password: "mauvais_mdp" },
  { label: "Injection : contourner le mot de passe", username: "admin", password: "' OR '1'='1" },
  { label: "Injection : afficher tous les comptes", username: "' OR '1'='1' --", password: "peu importe" },
];
