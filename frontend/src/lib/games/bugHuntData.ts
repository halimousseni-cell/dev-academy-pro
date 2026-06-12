export interface BugHuntChallenge {
  id: string;
  title: string;
  language: string;
  lines: string[];
  buggyLineIndex: number;
  explanation: string;
}

export const BUG_HUNT_CHALLENGES: BugHuntChallenge[] = [
  {
    id: "off-by-one",
    title: "Boucle sur un tableau",
    language: "JavaScript",
    lines: [
      "function afficherTous(items) {",
      "  for (let i = 0; i <= items.length; i++) {",
      "    console.log(items[i]);",
      "  }",
      "}",
    ],
    buggyLineIndex: 1,
    explanation: "La condition devrait être `i < items.length` : avec `<=`, la boucle accède à `items[items.length]`, qui est `undefined` (erreur d'off-by-one).",
  },
  {
    id: "sql-concat",
    title: "Requête de connexion",
    language: "SQL / Node.js",
    lines: [
      "function login(username, password) {",
      "  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;",
      "  return db.exec(sql);",
      "}",
    ],
    buggyLineIndex: 1,
    explanation: "La requête est construite par concaténation : un attaquant peut injecter du SQL (ex : `' OR '1'='1`). Il faut utiliser une requête paramétrée.",
  },
  {
    id: "comparaison-affectation",
    title: "Vérification de rôle",
    language: "JavaScript",
    lines: [
      "function peutSupprimer(utilisateur) {",
      "  if (utilisateur.role = 'admin') {",
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
    buggyLineIndex: 1,
    explanation: "`=` est une affectation, pas une comparaison ! Il faut `===`. Avec `=`, la condition devient toujours vraie et tout le monde devient admin.",
  },
  {
    id: "xss-innerhtml",
    title: "Affichage d'un commentaire",
    language: "JavaScript",
    lines: [
      "function afficherCommentaire(commentaire) {",
      "  const div = document.createElement('div');",
      "  div.innerHTML = commentaire;",
      "  document.body.appendChild(div);",
      "}",
    ],
    buggyLineIndex: 2,
    explanation: "Utiliser `innerHTML` avec une entrée utilisateur permet l'injection de HTML/JS (XSS). Il faut utiliser `textContent` ou échapper le contenu.",
  },
  {
    id: "mot-de-passe-clair",
    title: "Création de compte",
    language: "Node.js",
    lines: [
      "async function creerCompte(email, motDePasse) {",
      "  const utilisateur = await db.user.create({",
      "    data: { email, motDePasse },",
      "  });",
      "  return utilisateur;",
      "}",
    ],
    buggyLineIndex: 2,
    explanation: "Le mot de passe est stocké en clair. Il faut le hacher (ex : Argon2id, bcrypt) avant de l'enregistrer.",
  },
  {
    id: "fuite-cle-api",
    title: "Configuration côté client",
    language: "JavaScript",
    lines: [
      "const API_URL = 'https://api.exemple.com';",
      stripe_key: process.env.VITE_STRIPE_KEY||'',
      "export function configurerPaiement() {",
      "  return { url: API_URL, key: STRIPE_SECRET_KEY };",
      "}",
    ],
    buggyLineIndex: 1,
    explanation: "Une clé secrète d'API ne doit jamais être incluse dans du code envoyé au navigateur : elle serait visible par tous. Les clés secrètes restent côté serveur.",
  },
];
