export interface PuzzleChallenge {
  id: string;
  title: string;
  description: string;
  lines: string[];
}

export const PUZZLE_CHALLENGES: PuzzleChallenge[] = [
  {
    id: "fonction-somme",
    title: "Somme d'un tableau",
    description: "Reconstituez une fonction qui calcule la somme des éléments d'un tableau.",
    lines: [
      "function somme(nombres) {",
      "  let total = 0;",
      "  for (const n of nombres) {",
      "    total += n;",
      "  }",
      "  return total;",
      "}",
    ],
  },
  {
    id: "fetch-async",
    title: "Récupération de données",
    description: "Reconstituez une fonction asynchrone qui récupère des données JSON.",
    lines: [
      "async function getUser(id) {",
      "  const response = await fetch(`/api/users/${id}`);",
      "  if (!response.ok) {",
      "    throw new Error('Utilisateur introuvable');",
      "  }",
      "  return response.json();",
      "}",
    ],
  },
  {
    id: "filtre-pairs",
    title: "Filtrer les nombres pairs",
    description: "Reconstituez une fonction qui retourne uniquement les nombres pairs.",
    lines: [
      "function nombresPairs(liste) {",
      "  return liste.filter((n) => {",
      "    return n % 2 === 0;",
      "  });",
      "}",
    ],
  },
  {
    id: "classe-compte",
    title: "Classe CompteBancaire",
    description: "Reconstituez une classe simple représentant un compte bancaire.",
    lines: [
      "class CompteBancaire {",
      "  constructor(solde) {",
      "    this.solde = solde;",
      "  }",
      "  deposer(montant) {",
      "    this.solde += montant;",
      "  }",
      "}",
    ],
  },
  {
    id: "debounce",
    title: "Fonction debounce",
    description: "Reconstituez une fonction utilitaire `debounce` classique.",
    lines: [
      "function debounce(fn, delay) {",
      "  let timer;",
      "  return (...args) => {",
      "    clearTimeout(timer);",
      "    timer = setTimeout(() => fn(...args), delay);",
      "  };",
      "}",
    ],
  },
];
