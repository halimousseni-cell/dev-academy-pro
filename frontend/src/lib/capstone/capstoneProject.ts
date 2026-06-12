export interface CapstoneTask {
  id: string;
  label: string;
}

export interface CapstoneLink {
  label: string;
  to: string;
}

export interface CapstoneStage {
  id: string;
  title: string;
  goal: string;
  description: string;
  tasks: CapstoneTask[];
  links: CapstoneLink[];
}

export const CAPSTONE_STAGES: CapstoneStage[] = [
  {
    id: "cahier-des-charges",
    title: "1. Cahier des charges",
    goal: "Définir précisément ce que vous allez construire et pour qui.",
    description:
      "Avant d'écrire la moindre ligne de code, rédigez un document court qui décrit le projet : son objectif, " +
      "ses utilisateurs, ses fonctionnalités principales (et celles que vous repoussez à plus tard), et les " +
      "contraintes techniques (stack, hébergement, budget temps).",
    tasks: [
      { id: "objectif", label: "Décrire en 2-3 phrases l'objectif du projet et le problème qu'il résout." },
      { id: "utilisateurs", label: "Lister les types d'utilisateurs (ex : visiteur, utilisateur connecté, administrateur)." },
      { id: "fonctionnalites-mvp", label: "Lister les fonctionnalités indispensables pour une première version (MVP)." },
      { id: "fonctionnalites-bonus", label: "Lister les fonctionnalités « bonus » à ajouter si le temps le permet." },
      { id: "stack", label: "Choisir la stack technique (frontend, backend, base de données)." },
    ],
    links: [{ label: "Utiliser le générateur de projets pour s'inspirer d'une structure", to: "/ia/generateur-projets" }],
  },
  {
    id: "conception",
    title: "2. Conception",
    goal: "Concevoir le modèle de données et l'architecture avant de développer.",
    description:
      "Schématisez les entités principales de votre application (utilisateurs, ressources métier, relations) et " +
      "définissez les routes/API nécessaires pour les manipuler. Réfléchissez aussi à l'organisation des dossiers " +
      "(frontend / backend / base de données) et aux choix de sécurité dès cette étape.",
    tasks: [
      { id: "modele-donnees", label: "Schématiser le modèle de données (entités, champs, relations)." },
      { id: "routes-api", label: "Lister les routes/API nécessaires (CRUD pour chaque entité)." },
      { id: "wireframes", label: "Esquisser les principaux écrans (papier, ou outil de maquettage)." },
      { id: "securite-conception", label: "Identifier dès la conception les points sensibles : authentification, données personnelles, permissions." },
    ],
    links: [{ label: "Demander de l'aide à l'assistant IA pour expliquer un concept", to: "/ia/assistant" }],
  },
  {
    id: "developpement",
    title: "3. Développement",
    goal: "Implémenter le projet de façon itérative, en testant au fur et à mesure.",
    description:
      "Développez d'abord le « chemin heureux » du MVP (l'enchaînement principal sans erreurs), puis ajoutez la " +
      "gestion des cas d'erreur et les fonctionnalités bonus. Utilisez les laboratoires pour vous entraîner sur les " +
      "briques techniques (Git, requêtes SQL, API) avant de les intégrer à votre projet.",
    tasks: [
      { id: "init-repo", label: "Initialiser le dépôt Git et faire un premier commit (structure de base)." },
      { id: "backend-base", label: "Mettre en place le backend : serveur, connexion à la base de données, première route." },
      { id: "frontend-base", label: "Mettre en place le frontend : structure des pages et navigation." },
      { id: "crud-principal", label: "Implémenter le CRUD de l'entité principale du projet." },
      { id: "auth", label: "Implémenter l'authentification si le projet en a besoin." },
      { id: "fonctionnalites-mvp-dev", label: "Terminer toutes les fonctionnalités du MVP définies dans le cahier des charges." },
    ],
    links: [
      { label: "S'entraîner sur Git & GitHub", to: "/laboratoires/git" },
      { label: "S'entraîner sur les requêtes SQL", to: "/laboratoires/sql" },
      { label: "S'entraîner sur les appels API", to: "/laboratoires/api" },
    ],
  },
  {
    id: "tests-securite",
    title: "4. Tests & sécurité",
    goal: "Vérifier que le projet fonctionne correctement et qu'il respecte les bonnes pratiques de sécurité de base.",
    description:
      "Reprenez les vulnérabilités étudiées dans le centre de sécurité et vérifiez que votre projet n'y est pas " +
      "exposé : validation des entrées, requêtes paramétrées, gestion des sessions, contrôle d'accès, en-têtes " +
      "HTTP de sécurité, et gestion des erreurs/secrets.",
    tasks: [
      { id: "test-parcours", label: "Tester manuellement le parcours principal de bout en bout (cas normal)." },
      { id: "test-erreurs", label: "Tester les cas d'erreur (champs vides, données invalides, accès non autorisé)." },
      { id: "verif-injection", label: "Vérifier l'absence d'injection SQL (requêtes paramétrées) et de XSS (échappement des sorties)." },
      { id: "verif-auth", label: "Vérifier que les routes protégées renvoient bien une erreur si l'utilisateur n'est pas authentifié/autorisé." },
      { id: "verif-secrets", label: "Vérifier qu'aucun secret (mot de passe, clé API) n'est codé en dur ou commité dans le dépôt." },
    ],
    links: [
      { label: "Revoir les démonstrations du centre de sécurité", to: "/securite" },
      { label: "Vérifier la couverture OWASP ASVS via le générateur de projets", to: "/ia/generateur-projets" },
    ],
  },
  {
    id: "deploiement",
    title: "5. Déploiement",
    goal: "Rendre le projet accessible et présentable.",
    description:
      "Préparez le projet pour qu'il puisse tourner en dehors de votre machine : variables d'environnement, " +
      "build de production, et documentation minimale pour qu'une autre personne puisse l'installer et le lancer.",
    tasks: [
      { id: "env-vars", label: "Externaliser la configuration sensible dans des variables d'environnement (fichier .env non commité)." },
      { id: "build-prod", label: "Vérifier que le build de production fonctionne sans erreur (frontend et backend)." },
      { id: "readme", label: "Rédiger un README : description du projet, installation, lancement, captures d'écran." },
      { id: "hebergement", label: "Choisir une solution d'hébergement (ou documenter comment le lancer en local) et la tester." },
    ],
    links: [],
  },
];
