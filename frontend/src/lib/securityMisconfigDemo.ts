// Démonstration pédagogique de "Mauvaise configuration de sécurité"
// (OWASP A05). Contenu statique illustrant des réponses HTTP typiques,
// avant/après durcissement. Aucune requête réseau réelle.

export interface HttpExample {
  title: string;
  status: string;
  headers: string[];
  body: string;
}

export const RESPONSE_HEADERS: { insecure: HttpExample; secure: HttpExample } = {
  insecure: {
    title: "GET / — réponse du serveur",
    status: "HTTP/1.1 200 OK",
    headers: [
      "Server: Apache/2.4.41 (Ubuntu)",
      "X-Powered-By: PHP/7.4.3",
      "Content-Type: text/html; charset=UTF-8",
    ],
    body: "<!-- Aucun en-tête de sécurité : CSP, X-Frame-Options, HSTS, X-Content-Type-Options absents -->",
  },
  secure: {
    title: "GET / — réponse du serveur",
    status: "HTTP/1.1 200 OK",
    headers: [
      "Content-Type: text/html; charset=UTF-8",
      "Content-Security-Policy: default-src 'self'",
      "X-Content-Type-Options: nosniff",
      "X-Frame-Options: DENY",
      "Referrer-Policy: no-referrer",
      "Strict-Transport-Security: max-age=63072000; includeSubDomains",
    ],
    body: "<!-- Pas d'information de version exposée, en-têtes de sécurité présents -->",
  },
};

export const ERROR_PAGE: { insecure: HttpExample; secure: HttpExample } = {
  insecure: {
    title: "GET /api/commandes/abc — erreur serveur",
    status: "HTTP/1.1 500 Internal Server Error",
    headers: ["Content-Type: application/json"],
    body: JSON.stringify(
      {
        error: "TypeError: Cannot read properties of undefined (reading 'id')",
        stack:
          "at OrderController.getById (/srv/app/src/controllers/orderController.js:42:18)\n" +
          "at Layer.handle (/srv/app/node_modules/express/lib/router/layer.js:95:5)",
        database: "postgres://app_user:Sup3rS3cret!@db.internal:5432/prod",
      },
      null,
      2,
    ),
  },
  secure: {
    title: "GET /api/commandes/abc — erreur serveur",
    status: "HTTP/1.1 500 Internal Server Error",
    headers: ["Content-Type: application/json"],
    body: JSON.stringify({ error: "Une erreur est survenue. Réf: a1b2c3d4" }, null, 2),
  },
};

export const DIRECTORY_LISTING: { insecure: HttpExample; secure: HttpExample } = {
  insecure: {
    title: "GET /uploads/",
    status: "HTTP/1.1 200 OK",
    headers: ["Content-Type: text/html"],
    body: "Index of /uploads/\n\n- avatar-1.png\n- contrat-client-dupont.pdf\n- backup-2026-01.sql\n- .env.bak",
  },
  secure: {
    title: "GET /uploads/",
    status: "HTTP/1.1 403 Forbidden",
    headers: ["Content-Type: application/json"],
    body: JSON.stringify({ error: "Accès interdit" }, null, 2),
  },
};

export const CORS_CONFIG: { insecure: HttpExample; secure: HttpExample } = {
  insecure: {
    title: "OPTIONS /api/profil (requête depuis https://site-malveillant.exemple)",
    status: "HTTP/1.1 204 No Content",
    headers: [
      "Access-Control-Allow-Origin: *",
      "Access-Control-Allow-Credentials: true",
      "Access-Control-Allow-Methods: GET, POST, PUT, DELETE",
    ],
    body: "// N'importe quel site peut appeler l'API avec les cookies de l'utilisateur.",
  },
  secure: {
    title: "OPTIONS /api/profil (requête depuis https://site-malveillant.exemple)",
    status: "HTTP/1.1 403 Forbidden",
    headers: ["Access-Control-Allow-Origin: https://devacademy.pro", "Vary: Origin"],
    body: "// L'origine n'est pas dans la liste blanche : la requête est rejetée par le navigateur.",
  },
};
