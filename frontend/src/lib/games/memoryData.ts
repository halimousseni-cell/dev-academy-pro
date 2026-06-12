export interface MemoryPair {
  id: string;
  term: string;
  definition: string;
}

export const MEMORY_PAIRS: MemoryPair[] = [
  { id: "xss", term: "XSS", definition: "Injection de scripts malveillants dans une page web." },
  { id: "csrf", term: "CSRF", definition: "Action exécutée à l'insu d'un utilisateur authentifié." },
  { id: "sqli", term: "Injection SQL", definition: "Manipulation d'une requête SQL via une entrée non filtrée." },
  { id: "idor", term: "IDOR", definition: "Accès direct à une ressource d'un autre utilisateur via son identifiant." },
  { id: "hash", term: "Hachage", definition: "Fonction à sens unique transformant une donnée en empreinte fixe." },
  { id: "jwt", term: "JWT", definition: "Jeton signé contenant des informations d'authentification." },
  { id: "cors", term: "CORS", definition: "Mécanisme contrôlant les requêtes entre origines différentes." },
  { id: "mfa", term: "MFA", definition: "Authentification nécessitant plusieurs facteurs de vérification." },
];

export type CardKind = "term" | "definition";

export interface MemoryCard {
  cardId: string;
  pairId: string;
  kind: CardKind;
  text: string;
}

export function buildDeck(pairs: MemoryPair[]): MemoryCard[] {
  const cards: MemoryCard[] = [];
  for (const pair of pairs) {
    cards.push({ cardId: `${pair.id}-term`, pairId: pair.id, kind: "term", text: pair.term });
    cards.push({ cardId: `${pair.id}-def`, pairId: pair.id, kind: "definition", text: pair.definition });
  }
  return cards;
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
