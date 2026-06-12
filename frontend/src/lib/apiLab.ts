// Serveur REST simulé (mock) pour pratiquer l'authentification JWT et les rôles.
// Tout est exécuté en mémoire côté client : aucune requête réseau réelle n'est
// effectuée et le "JWT" produit ici est un format pédagogique (signature par
// hachage simple), pas une implémentation cryptographique sûre.

export type ApiRole = "admin" | "author" | "user";

export interface ApiUser {
  id: number;
  email: string;
  password: string;
  role: ApiRole;
  name: string;
}

export interface ApiArticle {
  id: number;
  title: string;
  content: string;
  authorId: number;
  published: boolean;
}

export interface ApiLabState {
  users: ApiUser[];
  articles: ApiArticle[];
  nextArticleId: number;
}

export interface MockRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
}

export interface MockResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface HandleResult {
  state: ApiLabState;
  response: MockResponse;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: ApiRole;
  name: string;
  iat: number;
  exp: number;
}

const SECRET = "devacademy-secret-pedagogique";
const TOKEN_TTL_SECONDS = 3600;

export const DEMO_ACCOUNTS: { email: string; password: string; role: ApiRole; description: string }[] = [
  { email: "admin@devacademy.pro", password: "admin123", role: "admin", description: "Accès complet, gestion des utilisateurs" },
  { email: "auteur@devacademy.pro", password: "auteur123", role: "author", description: "Peut créer/éditer ses propres articles" },
  { email: "visiteur@devacademy.pro", password: "visiteur123", role: "user", description: "Lecture seule des articles publiés" },
];

export function createInitialState(): ApiLabState {
  return {
    users: [
      { id: 1, email: "admin@devacademy.pro", password: "admin123", role: "admin", name: "Admin" },
      { id: 2, email: "auteur@devacademy.pro", password: "auteur123", role: "author", name: "Auteur Demo" },
      { id: 3, email: "visiteur@devacademy.pro", password: "visiteur123", role: "user", name: "Visiteur Demo" },
    ],
    articles: [
      { id: 1, title: "Introduction à REST", content: "Les API REST utilisent les verbes HTTP...", authorId: 1, published: true },
      { id: 2, title: "Comprendre JWT", content: "Un JWT est composé de 3 parties...", authorId: 2, published: true },
      { id: 3, title: "Brouillon en cours", content: "Cet article n'est pas encore publié.", authorId: 2, published: false },
    ],
    nextArticleId: 4,
  };
}

function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): unknown {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

function simpleHash(input: string): string {
  let h1 = 0;
  let h2 = 5381;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = (h1 << 5) - h1 + c;
    h1 |= 0;
    h2 = (h2 * 33) ^ c;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

export function signToken(payload: JwtPayload): string {
  const headerB64 = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payloadB64 = base64UrlEncode(payload);
  const signature = simpleHash(`${headerB64}.${payloadB64}.${SECRET}`);
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyToken(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, error: "Format de token invalide (3 parties attendues)" };
  const [headerB64, payloadB64, signature] = parts;
  const expected = simpleHash(`${headerB64}.${payloadB64}.${SECRET}`);
  if (signature !== expected) return { valid: false, error: "Signature invalide" };
  let payload: JwtPayload;
  try {
    payload = base64UrlDecode(payloadB64) as JwtPayload;
  } catch {
    return { valid: false, error: "Payload illisible" };
  }
  if (payload.exp * 1000 < Date.now()) return { valid: false, error: "Token expiré" };
  return { valid: true, payload };
}

export function decodeTokenUnsafe(token: string): { header: unknown; payload: unknown } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return { header: base64UrlDecode(parts[0]), payload: base64UrlDecode(parts[1]) };
  } catch {
    return null;
  }
}

function json(status: number, statusText: string, body: unknown): MockResponse {
  return { status, statusText, headers: { "Content-Type": "application/json" }, body };
}

function publicUser(user: ApiUser) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

function publicArticle(article: ApiArticle) {
  return article;
}

function authenticate(state: ApiLabState, headers: Record<string, string>): { user: ApiUser } | { error: MockResponse } {
  const authHeader = Object.entries(headers).find(([key]) => key.toLowerCase() === "authorization")?.[1];
  if (!authHeader) return { error: json(401, "Unauthorized", { error: "En-tête Authorization manquant" }) };
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return { error: json(401, "Unauthorized", { error: "Format attendu : 'Bearer <token>'" }) };
  const verification = verifyToken(match[1]);
  if (!verification.valid || !verification.payload) {
    return { error: json(401, "Unauthorized", { error: verification.error ?? "Token invalide" }) };
  }
  const user = state.users.find((u) => u.id === verification.payload!.sub);
  if (!user) return { error: json(401, "Unauthorized", { error: "Utilisateur du token introuvable" }) };
  return { user };
}

function parseBody(body: string | undefined): { data?: Record<string, unknown>; error?: MockResponse } {
  if (!body || !body.trim()) return { data: {} };
  try {
    const data = JSON.parse(body);
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { error: json(400, "Bad Request", { error: "Le corps doit être un objet JSON" }) };
    }
    return { data: data as Record<string, unknown> };
  } catch {
    return { error: json(400, "Bad Request", { error: "JSON invalide dans le corps de la requête" }) };
  }
}

export function handleRequest(state: ApiLabState, request: MockRequest): HandleResult {
  const method = request.method.toUpperCase();
  const path = request.path.split("?")[0].replace(/\/+$/, "") || "/";

  if (method === "POST" && path === "/api/auth/login") {
    const { data, error } = parseBody(request.body);
    if (error) return { state, response: error };
    const email = String(data?.email ?? "");
    const password = String(data?.password ?? "");
    const user = state.users.find((u) => u.email === email && u.password === password);
    if (!user) return { state, response: json(401, "Unauthorized", { error: "Email ou mot de passe incorrect" }) };
    const now = Math.floor(Date.now() / 1000);
    const token = signToken({ sub: user.id, email: user.email, role: user.role, name: user.name, iat: now, exp: now + TOKEN_TTL_SECONDS });
    return { state, response: json(200, "OK", { token, user: publicUser(user) }) };
  }

  if (method === "GET" && path === "/api/auth/me") {
    const auth = authenticate(state, request.headers);
    if ("error" in auth) return { state, response: auth.error };
    return { state, response: json(200, "OK", publicUser(auth.user)) };
  }

  if (method === "GET" && path === "/api/articles") {
    const authHeader = Object.entries(request.headers).find(([key]) => key.toLowerCase() === "authorization")?.[1];
    let currentUser: ApiUser | null = null;
    if (authHeader) {
      const auth = authenticate(state, request.headers);
      if ("error" in auth) return { state, response: auth.error };
      currentUser = auth.user;
    }
    const visible = state.articles.filter((article) => {
      if (article.published) return true;
      if (!currentUser) return false;
      return currentUser.role === "admin" || currentUser.id === article.authorId;
    });
    return { state, response: json(200, "OK", visible.map(publicArticle)) };
  }

  const articleMatch = /^\/api\/articles\/(\d+)$/.exec(path);
  if (articleMatch) {
    const id = Number(articleMatch[1]);
    const article = state.articles.find((a) => a.id === id);

    if (method === "GET") {
      const authHeader = Object.entries(request.headers).find(([key]) => key.toLowerCase() === "authorization")?.[1];
      let currentUser: ApiUser | null = null;
      if (authHeader) {
        const auth = authenticate(state, request.headers);
        if ("error" in auth) return { state, response: auth.error };
        currentUser = auth.user;
      }
      const canSee = !!article && (article.published || (!!currentUser && (currentUser.role === "admin" || currentUser.id === article.authorId)));
      if (!canSee) return { state, response: json(404, "Not Found", { error: "Article introuvable" }) };
      return { state, response: json(200, "OK", publicArticle(article!)) };
    }

    if (method === "PUT") {
      const auth = authenticate(state, request.headers);
      if ("error" in auth) return { state, response: auth.error };
      if (!article) return { state, response: json(404, "Not Found", { error: "Article introuvable" }) };
      if (auth.user.role !== "admin" && auth.user.id !== article.authorId) {
        return { state, response: json(403, "Forbidden", { error: "Vous ne pouvez modifier que vos propres articles" }) };
      }
      const { data, error } = parseBody(request.body);
      if (error) return { state, response: error };
      const updated: ApiArticle = {
        ...article,
        title: typeof data?.title === "string" ? data.title : article.title,
        content: typeof data?.content === "string" ? data.content : article.content,
        published: typeof data?.published === "boolean" ? data.published : article.published,
      };
      const articles = state.articles.map((a) => (a.id === id ? updated : a));
      return { state: { ...state, articles }, response: json(200, "OK", publicArticle(updated)) };
    }

    if (method === "DELETE") {
      const auth = authenticate(state, request.headers);
      if ("error" in auth) return { state, response: auth.error };
      if (!article) return { state, response: json(404, "Not Found", { error: "Article introuvable" }) };
      if (auth.user.role !== "admin" && auth.user.id !== article.authorId) {
        return { state, response: json(403, "Forbidden", { error: "Vous ne pouvez supprimer que vos propres articles" }) };
      }
      const articles = state.articles.filter((a) => a.id !== id);
      return { state: { ...state, articles }, response: { status: 204, statusText: "No Content", headers: {}, body: null } };
    }
  }

  if (method === "POST" && path === "/api/articles") {
    const auth = authenticate(state, request.headers);
    if ("error" in auth) return { state, response: auth.error };
    if (auth.user.role !== "admin" && auth.user.role !== "author") {
      return { state, response: json(403, "Forbidden", { error: "Rôle 'author' ou 'admin' requis" }) };
    }
    const { data, error } = parseBody(request.body);
    if (error) return { state, response: error };
    const title = typeof data?.title === "string" ? data.title : "";
    const content = typeof data?.content === "string" ? data.content : "";
    if (!title) return { state, response: json(400, "Bad Request", { error: "Le champ 'title' est requis" }) };
    const article: ApiArticle = {
      id: state.nextArticleId,
      title,
      content,
      authorId: auth.user.id,
      published: typeof data?.published === "boolean" ? data.published : false,
    };
    const newState: ApiLabState = { ...state, articles: [...state.articles, article], nextArticleId: state.nextArticleId + 1 };
    return { state: newState, response: json(201, "Created", publicArticle(article)) };
  }

  if (method === "GET" && path === "/api/users") {
    const auth = authenticate(state, request.headers);
    if ("error" in auth) return { state, response: auth.error };
    if (auth.user.role !== "admin") return { state, response: json(403, "Forbidden", { error: "Rôle 'admin' requis" }) };
    return { state, response: json(200, "OK", state.users.map(publicUser)) };
  }

  return { state, response: json(404, "Not Found", { error: `Route inconnue : ${method} ${path}` }) };
}
