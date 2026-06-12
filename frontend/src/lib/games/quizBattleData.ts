export interface QuizBattleQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_BATTLE_QUESTIONS: QuizBattleQuestion[] = [
  {
    id: "q1",
    question: "Que signifie l'acronyme XSS ?",
    options: ["Cross-Site Scripting", "X-Server Security", "Cross-System Sync", "Extended Session State"],
    correctIndex: 0,
  },
  {
    id: "q2",
    question: "Quelle méthode HTTP est généralement utilisée pour créer une ressource ?",
    options: ["GET", "POST", "DELETE", "OPTIONS"],
    correctIndex: 1,
  },
  {
    id: "q3",
    question: "Quel algorithme est recommandé pour le hachage de mots de passe ?",
    options: ["MD5", "SHA-1", "Argon2id", "Base64"],
    correctIndex: 2,
  },
  {
    id: "q4",
    question: "En JavaScript, quel mot-clé déclare une variable non réassignable ?",
    options: ["var", "let", "const", "static"],
    correctIndex: 2,
  },
  {
    id: "q5",
    question: "Quelle commande Git crée une nouvelle branche et bascule dessus ?",
    options: ["git branch -b", "git checkout -b", "git switch new", "git merge -b"],
    correctIndex: 1,
  },
  {
    id: "q6",
    question: "Quel en-tête HTTP aide à prévenir le clickjacking ?",
    options: ["Content-Type", "X-Frame-Options", "Accept-Language", "Cache-Control"],
    correctIndex: 1,
  },
  {
    id: "q7",
    question: "Que retourne `typeof null` en JavaScript ?",
    options: ["'null'", "'undefined'", "'object'", "'number'"],
    correctIndex: 2,
  },
  {
    id: "q8",
    question: "Quelle clause SQL permet de filtrer les lignes après un GROUP BY ?",
    options: ["WHERE", "HAVING", "FILTER", "ON"],
    correctIndex: 1,
  },
];

export const QUESTION_TIME_SECONDS = 15;
export const POINTS_BASE = 100;

export function computePoints(remainingSeconds: number): number {
  return POINTS_BASE + remainingSeconds * 10;
}

export function botAnswer(): { correct: boolean; remainingSeconds: number } {
  const correct = Math.random() < 0.65;
  const remainingSeconds = Math.floor(Math.random() * (QUESTION_TIME_SECONDS - 2)) + 1;
  return { correct, remainingSeconds: correct ? remainingSeconds : 0 };
}
