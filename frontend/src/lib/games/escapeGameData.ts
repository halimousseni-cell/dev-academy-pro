export interface EscapeStep {
  id: string;
  title: string;
  narrative: string;
  question: string;
  answers: string[];
  hint: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export const ESCAPE_STEPS: EscapeStep[] = [
  {
    id: "porte-verrouillee",
    title: "La porte verrouillée",
    narrative:
      "Vous êtes enfermé dans la salle des serveurs. Un terminal affiche un fichier `.env` avec la ligne " +
      "`ADMIN_PASSWORD_HASH=5f4dcc3b5aa765d61d8327deb882cf99` (hachage MD5). Pour déverrouiller la porte, " +
      "entrez le mot de passe en clair correspondant à ce hachage MD5 bien connu.",
    question: "Quel est le mot de passe en clair ?",
    answers: ["password"],
    hint: "C'est l'un des mots de passe les plus utilisés au monde, 8 lettres.",
  },
  {
    id: "code-source",
    title: "Le code source piégé",
    narrative:
      "Un écran montre un extrait de code : `if (user.role = 'admin') { grantAccess(); }`. " +
      "Ce code contient un bug classique qui donne accès admin à tout le monde. " +
      "Quel opérateur faut-il utiliser à la place de `=` pour corriger la comparaison stricte ?",
    question: "Entrez l'opérateur correct (ex: ==, ===, !=...)",
    answers: ["===", "=="],
    hint: "En JavaScript, l'opérateur de comparaison stricte utilise trois caractères identiques.",
  },
  {
    id: "requete-suspecte",
    title: "La requête suspecte",
    narrative:
      "Le pare-feu a bloqué une tentative de connexion avec ce nom d'utilisateur : " +
      "`' OR '1'='1' --`. Ce type d'attaque vise à manipuler une requête SQL pour contourner " +
      "l'authentification. Comment appelle-t-on cette catégorie d'attaque (en français) ?",
    question: "Nom de l'attaque ?",
    answers: ["injection sql", "injection sql (sqli)", "sqli", "injection sql"],
    hint: "Le nom contient le mot 'injection' suivi du langage de requête de bases de données relationnelles.",
  },
  {
    id: "salle-finale",
    title: "La salle finale",
    narrative:
      "Sur le mur, un panneau lumineux affiche : 'Pour générer un mot de passe robuste, combinez " +
      "au minimum quatre éléments parmi : majuscules, minuscules, chiffres, caractères spéciaux, " +
      "et une longueur suffisante.' La porte de sortie demande la longueur minimale recommandée " +
      "(en nombre de caractères) pour un mot de passe robuste selon les bonnes pratiques actuelles.",
    question: "Longueur minimale recommandée (en chiffres) ?",
    answers: ["12"],
    hint: "C'est plus que 8, généralement recommandé : 12 caractères ou plus.",
  },
];

export function checkAnswer(step: EscapeStep, value: string): boolean {
  const normalized = normalize(value);
  return step.answers.some((answer) => normalize(answer) === normalized);
}
