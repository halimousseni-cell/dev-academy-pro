// Démonstration pédagogique d'authentification défaillante (OWASP A07).
// Tout est simulé en mémoire, en pur TypeScript : aucun vrai compte, aucune
// requête réseau.

export const ACCOUNT = { username: "alice", password: "Password123" };

export const MAX_ATTEMPTS = 5;

export const BRUTE_FORCE_PASSWORDS = [
  "123456",
  "password",
  "azerty123",
  "motdepasse",
  "qwerty123",
  "Password123",
  "admin123",
  "letmein123",
];

export const COMMON_PASSWORDS = ["123456", "password", "azerty", "motdepasse", "qwerty", "admin", "00000000"];

export interface LogEntry {
  message: string;
  outcome: "success" | "failure" | "blocked";
}

export interface AuthState {
  protectionEnabled: boolean;
  failedAttempts: number;
  locked: boolean;
  log: LogEntry[];
}

export function createInitialState(): AuthState {
  return { protectionEnabled: false, failedAttempts: 0, locked: false, log: [] };
}

export function toggleProtection(state: AuthState): AuthState {
  return { ...createInitialState(), protectionEnabled: !state.protectionEnabled };
}

export function reset(state: AuthState): AuthState {
  return { ...createInitialState(), protectionEnabled: state.protectionEnabled };
}

export function attemptLogin(state: AuthState, username: string, password: string): AuthState {
  if (state.protectionEnabled && state.locked) {
    return {
      ...state,
      log: [...state.log, { message: "Compte verrouillé après trop de tentatives échouées. Réessayez plus tard.", outcome: "blocked" }],
    };
  }

  if (username === ACCOUNT.username && password === ACCOUNT.password) {
    return { ...state, failedAttempts: 0, log: [...state.log, { message: `Connexion réussie pour "${username}".`, outcome: "success" }] };
  }

  const failedAttempts = state.failedAttempts + 1;
  const locked = state.protectionEnabled && failedAttempts >= MAX_ATTEMPTS;
  return {
    ...state,
    failedAttempts,
    locked,
    log: [
      ...state.log,
      locked
        ? { message: `Échec avec "${password}" — ${failedAttempts}/${MAX_ATTEMPTS} tentatives : compte verrouillé.`, outcome: "blocked" }
        : { message: `Échec avec "${password}" (${failedAttempts}/${MAX_ATTEMPTS} tentatives${state.protectionEnabled ? "" : ", aucune limite"}).`, outcome: "failure" },
    ],
  };
}

export function runBruteForce(state: AuthState, username: string): AuthState {
  let next = state;
  for (const password of BRUTE_FORCE_PASSWORDS) {
    if (next.protectionEnabled && next.locked) break;
    if (username === ACCOUNT.username && password === ACCOUNT.password) {
      next = attemptLogin(next, username, password);
      break;
    }
    next = attemptLogin(next, username, password);
  }
  return next;
}

export interface PasswordCheck {
  valid: boolean;
  reasons: string[];
}

export function checkPasswordPolicy(password: string, enforced: boolean): PasswordCheck {
  if (!enforced) {
    return { valid: password.length > 0, reasons: password.length > 0 ? [] : ["Le mot de passe ne peut pas être vide."] };
  }

  const reasons: string[] = [];
  if (password.length < 8) reasons.push("Au moins 8 caractères requis.");
  if (!/[a-z]/.test(password)) reasons.push("Au moins une lettre minuscule requise.");
  if (!/[A-Z]/.test(password)) reasons.push("Au moins une lettre majuscule requise.");
  if (!/[0-9]/.test(password)) reasons.push("Au moins un chiffre requis.");
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) reasons.push("Ce mot de passe est trop courant.");

  return { valid: reasons.length === 0, reasons };
}
