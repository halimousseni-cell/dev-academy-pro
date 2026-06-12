// Démonstration pédagogique de CSRF (Cross-Site Request Forgery).
// Tout est simulé en mémoire : il n'y a ni vrai cookie, ni vraie requête
// réseau, ni vrai site tiers. L'objectif est d'illustrer la différence de
// comportement avec et sans jeton anti-CSRF.

export interface CsrfState {
  balance: number;
  csrfToken: string;
  protectionEnabled: boolean;
  log: LogEntry[];
}

export interface LogEntry {
  source: "app" | "attacker";
  message: string;
  outcome: "success" | "blocked";
}

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createInitialState(): CsrfState {
  return { balance: 1000, csrfToken: generateToken(), protectionEnabled: false, log: [] };
}

export function toggleProtection(state: CsrfState): CsrfState {
  return { ...state, protectionEnabled: !state.protectionEnabled, csrfToken: generateToken() };
}

/** Virement effectué depuis le formulaire légitime de l'application (le jeton CSRF est connu). */
export function transferFromApp(state: CsrfState, amount: number, recipient: string): CsrfState {
  const newBalance = state.balance - amount;
  return {
    ...state,
    balance: newBalance,
    log: [
      ...state.log,
      { source: "app", message: `Virement de ${amount} € vers ${recipient} depuis l'application (jeton valide).`, outcome: "success" },
    ],
  };
}

/**
 * Virement déclenché par un site tiers malveillant pendant que la victime est
 * connectée. Le "cookie de session" est envoyé automatiquement par le
 * navigateur (simulé ici), mais le site attaquant ne connaît pas le jeton
 * CSRF de la victime.
 */
export function transferFromAttackerSite(state: CsrfState, amount: number, recipient: string): CsrfState {
  if (state.protectionEnabled) {
    return {
      ...state,
      log: [
        ...state.log,
        {
          source: "attacker",
          message: `Le site piégé a tenté un virement de ${amount} € vers ${recipient}, mais aucun jeton CSRF valide n'a été fourni : requête rejetée (403).`,
          outcome: "blocked",
        },
      ],
    };
  }
  const newBalance = state.balance - amount;
  return {
    ...state,
    balance: newBalance,
    log: [
      ...state.log,
      {
        source: "attacker",
        message: `Le site piégé a déclenché un virement de ${amount} € vers ${recipient} en utilisant le cookie de session de la victime, sans son consentement.`,
        outcome: "success",
      },
    ],
  };
}
