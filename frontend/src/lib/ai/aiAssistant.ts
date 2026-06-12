export type AssistantMode = "expliquer" | "corriger" | "exercice";

export interface AssistantTopic {
  id: string;
  label: string;
}

export const ASSISTANT_TOPICS: AssistantTopic[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "sql", label: "SQL" },
  { id: "git", label: "Git" },
  { id: "securite", label: "Sécurité web" },
  { id: "react", label: "React" },
];

interface CodePattern {
  test: RegExp;
  explanation: string;
  fix: string;
}

const CODE_PATTERNS: CodePattern[] = [
  {
    test: /==[^=]/,
    explanation:
      "J'ai repéré un opérateur `==` (égalité faible). Il effectue une conversion de type implicite avant " +
      "de comparer, ce qui peut produire des résultats surprenants (ex : `0 == ''` est `true`).",
    fix: "Remplacez `==` par `===` (et `!=` par `!==`) pour comparer sans conversion de type.",
  },
  {
    test: /if\s*\([^()=!<>]+=[^=][^()]*\)/,
    explanation:
      "La condition contient un `=` simple, qui est une affectation et non une comparaison. La condition " +
      "sera donc toujours vraie (sauf si la valeur affectée est falsy).",
    fix: "Utilisez `===` (ou `==`) pour comparer deux valeurs au lieu de `=`.",
  },
  {
    test: /innerHTML\s*=/,
    explanation:
      "L'utilisation de `innerHTML` avec une valeur qui peut provenir d'un utilisateur expose votre page à " +
      "des attaques XSS (Cross-Site Scripting) : du HTML/JS arbitraire pourrait être injecté et exécuté.",
    fix: "Utilisez `textContent` pour du texte simple, ou échappez/assainissez le contenu avant de l'insérer en HTML.",
  },
  {
    test: /SELECT[\s\S]*\$\{|SELECT[\s\S]*['"]\s*\+/i,
    explanation:
      "Cette requête SQL est construite par concaténation de chaînes avec des données externes. C'est la " +
      "porte ouverte aux injections SQL : un attaquant peut modifier la requête en manipulant l'entrée.",
    fix: "Utilisez des requêtes paramétrées (placeholders `?` ou `$1`) et laissez le pilote/ORM échapper les valeurs.",
  },
  {
    test: /var\s+\w+/,
    explanation:
      "Le mot-clé `var` a une portée de fonction (et non de bloc) et autorise la redéclaration, ce qui peut " +
      "provoquer des bugs subtils liés au hoisting.",
    fix: "Préférez `let` (variable réassignable) ou `const` (variable non réassignable), qui ont une portée de bloc.",
  },
  {
    test: /password|motdepasse|mot_de_passe/i,
    explanation:
      "Ce code semble manipuler un mot de passe directement (probablement en clair), sans hachage.",
    fix: "Hachez le mot de passe avec un algorithme dédié (Argon2id, bcrypt) avant de le stocker — ne stockez jamais de mot de passe en clair.",
  },
  {
    test: /for\s*\([^;]*;\s*\w+\s*<=\s*\w*\.length/,
    explanation:
      "La condition de boucle utilise `<=` avec `.length`. Cela provoque un accès hors limites à la dernière " +
      "itération (off-by-one), retournant `undefined`.",
    fix: "Utilisez `<` au lieu de `<=` pour vous arrêter au dernier index valide (`length - 1`).",
  },
];

const GENERIC_EXPLANATION =
  "Je n'ai pas détecté de motif problématique connu dans cet extrait. De manière générale, vérifiez : " +
  "la gestion des erreurs, la validation des entrées utilisateur, la complexité (peut-on simplifier ?), " +
  "et les conventions de nommage. N'hésitez pas à ajouter des tests pour les cas limites.";

const GENERIC_FIX =
  "Aucune correction automatique évidente n'a été identifiée. Relisez la logique ligne par ligne et " +
  "comparez le comportement attendu avec le comportement réel sur quelques exemples concrets.";

export interface AssistantResponse {
  summary: string;
  details: string;
}

export function explainCode(code: string): AssistantResponse {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      summary: "Aucun code fourni.",
      details: "Collez un extrait de code dans la zone de texte pour obtenir une explication.",
    };
  }

  const match = CODE_PATTERNS.find((pattern) => pattern.test.test(trimmed));
  if (match) {
    return { summary: "Point d'attention détecté", details: match.explanation };
  }

  return { summary: "Analyse générale", details: GENERIC_EXPLANATION };
}

export function fixCode(code: string): AssistantResponse {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      summary: "Aucun code fourni.",
      details: "Collez un extrait de code dans la zone de texte pour obtenir une suggestion de correction.",
    };
  }

  const match = CODE_PATTERNS.find((pattern) => pattern.test.test(trimmed));
  if (match) {
    return { summary: "Suggestion de correction", details: match.fix };
  }

  return { summary: "Aucune correction automatique", details: GENERIC_FIX };
}

interface ExerciseTemplate {
  title: string;
  statement: string;
  hint: string;
}

const EXERCISES: Record<string, ExerciseTemplate[]> = {
  javascript: [
    {
      title: "Inverser une chaîne",
      statement: "Écrivez une fonction `inverser(chaine)` qui retourne la chaîne de caractères inversée.",
      hint: "Vous pouvez convertir la chaîne en tableau avec `split('')`, utiliser `reverse()`, puis `join('')`.",
    },
    {
      title: "Nombres premiers",
      statement: "Écrivez une fonction `estPremier(n)` qui retourne `true` si `n` est un nombre premier.",
      hint: "Testez la divisibilité de 2 jusqu'à la racine carrée de `n`.",
    },
  ],
  sql: [
    {
      title: "Top clients",
      statement:
        "Écrivez une requête SQL retournant les 3 clients ayant passé le plus de commandes, avec leur nombre de commandes.",
      hint: "Utilisez `GROUP BY`, `COUNT(*)`, `ORDER BY ... DESC` et `LIMIT 3`.",
    },
    {
      title: "Jointure incomplète",
      statement:
        "Écrivez une requête listant tous les produits, y compris ceux qui n'ont jamais été commandés.",
      hint: "Utilisez un `LEFT JOIN` entre `produits` et `commandes`.",
    },
  ],
  git: [
    {
      title: "Annuler un commit",
      statement: "Quelle commande permet d'annuler le dernier commit tout en conservant les modifications dans la zone de staging ?",
      hint: "Cherchez du côté de `git reset` avec une option qui conserve l'index.",
    },
  ],
  securite: [
    {
      title: "Corriger une faille XSS",
      statement:
        "Le code suivant affiche un commentaire utilisateur : `div.innerHTML = commentaire`. Réécrivez-le pour éviter une injection XSS.",
      hint: "Pensez à `textContent` ou à une fonction d'échappement HTML.",
    },
    {
      title: "Politique de mot de passe",
      statement:
        "Écrivez une fonction `motDePasseValide(motDePasse)` qui retourne `true` si le mot de passe fait au moins 12 caractères et contient une majuscule, une minuscule et un chiffre.",
      hint: "Utilisez des expressions régulières et la propriété `length`.",
    },
  ],
  react: [
    {
      title: "Compteur",
      statement:
        "Créez un composant `Compteur` avec un état `count` initialisé à 0 et deux boutons (+1 / -1).",
      hint: "Utilisez le hook `useState`.",
    },
    {
      title: "Liste filtrée",
      statement:
        "Créez un composant qui affiche une liste d'éléments et un champ de recherche filtrant la liste en temps réel.",
      hint: "Stockez le texte de recherche dans un état et filtrez le tableau avant de l'afficher.",
    },
  ],
};

export function generateExercise(topicId: string): AssistantResponse {
  const exercises = EXERCISES[topicId] ?? [];
  if (exercises.length === 0) {
    return {
      summary: "Aucun exercice disponible",
      details: "Choisissez un autre thème.",
    };
  }

  const exercise = exercises[Math.floor(Math.random() * exercises.length)];
  return {
    summary: exercise.title,
    details: `${exercise.statement}\n\nIndice : ${exercise.hint}`,
  };
}

export function askAssistant(mode: AssistantMode, input: string, topicId: string): AssistantResponse {
  switch (mode) {
    case "expliquer":
      return explainCode(input);
    case "corriger":
      return fixCode(input);
    case "exercice":
      return generateExercise(topicId);
  }
}
