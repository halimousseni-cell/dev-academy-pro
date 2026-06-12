// Démonstration pédagogique du contrôle d'accès défaillant (IDOR / contrôle
// d'accès au niveau fonction). Tout est simulé en mémoire, en pur
// TypeScript : aucune requête réseau réelle.

export interface AccessUser {
  id: number;
  name: string;
  role: "user" | "admin";
}

export interface AccessDocument {
  id: number;
  ownerId: number;
  title: string;
  content: string;
}

export interface AccessState {
  protectionEnabled: boolean;
  currentUserId: number;
}

export interface FetchResult {
  status: number;
  statusText: string;
  body: unknown;
}

export const USERS: AccessUser[] = [
  { id: 1, name: "Alice", role: "user" },
  { id: 2, name: "Bob", role: "user" },
  { id: 3, name: "Admin", role: "admin" },
];

export const DOCUMENTS: AccessDocument[] = [
  { id: 1, ownerId: 1, title: "Facture Alice #1", content: "Montant : 120 € — Janvier 2026" },
  { id: 2, ownerId: 2, title: "Facture Bob #1", content: "Montant : 350 € — Janvier 2026 — Confidentiel" },
  { id: 3, ownerId: 1, title: "Facture Alice #2", content: "Montant : 80 € — Février 2026" },
  { id: 4, ownerId: 2, title: "Facture Bob #2", content: "Montant : 210 € — Mars 2026 — Confidentiel" },
];

export function createInitialState(): AccessState {
  return { protectionEnabled: false, currentUserId: 1 };
}

export function getCurrentUser(state: AccessState): AccessUser {
  return USERS.find((u) => u.id === state.currentUserId) ?? USERS[0];
}

/** GET /api/documents/:id — un utilisateur ne devrait voir que ses propres documents. */
export function fetchDocument(state: AccessState, docId: number): FetchResult {
  const doc = DOCUMENTS.find((d) => d.id === docId);
  if (!doc) return { status: 404, statusText: "Not Found", body: { error: "Document introuvable" } };
  if (state.protectionEnabled && doc.ownerId !== state.currentUserId) {
    return { status: 403, statusText: "Forbidden", body: { error: "Vous n'avez pas accès à ce document" } };
  }
  return { status: 200, statusText: "OK", body: doc };
}

/** GET /api/admin/users — devrait être réservé au rôle admin. */
export function fetchAdminUsers(state: AccessState): FetchResult {
  const user = getCurrentUser(state);
  if (state.protectionEnabled && user.role !== "admin") {
    return { status: 403, statusText: "Forbidden", body: { error: "Rôle 'admin' requis" } };
  }
  return { status: 200, statusText: "OK", body: USERS };
}
