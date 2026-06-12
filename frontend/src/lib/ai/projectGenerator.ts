export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  stack: string[];
  fileTree: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Site vitrine personnel avec présentation, projets et contact.",
    stack: ["React + Vite", "Tailwind CSS", "Formulaire de contact (API)"] ,
    fileTree: [
      "src/",
      "  pages/",
      "    HomePage.tsx",
      "    ProjectsPage.tsx",
      "    ContactPage.tsx",
      "  components/",
      "    Navbar.tsx",
      "    ProjectCard.tsx",
      "  App.tsx",
      "public/",
      "  favicon.svg",
    ],
  },
  {
    id: "blog",
    name: "Blog",
    description: "Blog avec articles, catégories et page d'administration.",
    stack: ["React + Vite", "Express + Prisma", "SQLite/PostgreSQL"],
    fileTree: [
      "frontend/src/pages/",
      "  ArticleListPage.tsx",
      "  ArticlePage.tsx",
      "  AdminArticlesPage.tsx",
      "backend/src/modules/articles/",
      "  articles.controller.ts",
      "  articles.service.ts",
      "  articles.routes.ts",
      "prisma/schema.prisma",
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Boutique en ligne avec catalogue, panier et paiement.",
    stack: ["React + Vite", "Express + Prisma", "PostgreSQL", "Stripe (paiement)"],
    fileTree: [
      "frontend/src/pages/",
      "  CatalogPage.tsx",
      "  ProductPage.tsx",
      "  CartPage.tsx",
      "  CheckoutPage.tsx",
      "backend/src/modules/",
      "  products/",
      "  orders/",
      "  payments/",
      "prisma/schema.prisma",
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Tableau de bord d'administration avec graphiques et gestion des utilisateurs.",
    stack: ["React + Vite", "Tailwind CSS", "Express + Prisma", "Recharts"],
    fileTree: [
      "frontend/src/pages/",
      "  DashboardHomePage.tsx",
      "  UsersPage.tsx",
      "  ReportsPage.tsx",
      "backend/src/modules/",
      "  users/",
      "  reports/",
      "prisma/schema.prisma",
    ],
  },
  {
    id: "pwa",
    name: "PWA",
    description: "Application web progressive installable, fonctionnant hors-ligne.",
    stack: ["React + Vite", "Service Worker", "Workbox", "IndexedDB"],
    fileTree: [
      "src/",
      "  pages/",
      "    HomePage.tsx",
      "    OfflinePage.tsx",
      "  serviceWorker.ts",
      "  manifest.webmanifest",
      "public/",
      "  icons/",
    ],
  },
  {
    id: "api",
    name: "API",
    description: "API REST autonome avec authentification et documentation.",
    stack: ["Express + TypeScript", "Prisma", "PostgreSQL", "Documentation OpenAPI"],
    fileTree: [
      "src/",
      "  modules/",
      "    auth/",
      "    resources/",
      "  middleware/",
      "    auth.ts",
      "    rateLimiters.ts",
      "  app.ts",
      "  server.ts",
      "openapi.yaml",
    ],
  },
];

export interface SecurityOption {
  id: string;
  label: string;
  description: string;
}

export const SECURITY_OPTIONS: SecurityOption[] = [
  {
    id: "https",
    label: "HTTPS forcé + HSTS",
    description: "Redirection automatique vers HTTPS et en-tête Strict-Transport-Security.",
  },
  {
    id: "auth",
    label: "Authentification JWT + rôles",
    description: "Connexion sécurisée avec jetons et contrôle d'accès basé sur les rôles.",
  },
  {
    id: "validation",
    label: "Validation des entrées",
    description: "Validation systématique des données entrantes (schémas, types, longueurs).",
  },
  {
    id: "headers",
    label: "En-têtes de sécurité (CSP, X-Frame-Options...)",
    description: "Ajout d'en-têtes HTTP de sécurité sur toutes les réponses.",
  },
  {
    id: "rateLimiting",
    label: "Limitation de débit (rate limiting)",
    description: "Limitation du nombre de requêtes par IP/utilisateur pour limiter les abus.",
  },
  {
    id: "secrets",
    label: "Secrets via variables d'environnement",
    description: "Aucune clé/API secrète en dur dans le code, gestion via fichier .env non commité.",
  },
  {
    id: "logging",
    label: "Journalisation et messages d'erreur génériques",
    description: "Erreurs détaillées journalisées côté serveur, messages génériques côté client.",
  },
];

export interface AsvsCriterion {
  category: string;
  requirement: string;
  optionId: string;
}

export const ASVS_CRITERIA: AsvsCriterion[] = [
  {
    category: "V2 — Authentification",
    requirement: "Les identifiants sont vérifiés via un mécanisme d'authentification robuste (JWT, sessions sécurisées).",
    optionId: "auth",
  },
  {
    category: "V4 — Contrôle d'accès",
    requirement: "Les accès aux ressources sont vérifiés en fonction du rôle de l'utilisateur.",
    optionId: "auth",
  },
  {
    category: "V5 — Validation, encodage et injection",
    requirement: "Toutes les entrées utilisateur sont validées avant traitement.",
    optionId: "validation",
  },
  {
    category: "V7 — Gestion des erreurs et journalisation",
    requirement: "Les erreurs détaillées ne sont pas exposées aux utilisateurs ; elles sont journalisées côté serveur.",
    optionId: "logging",
  },
  {
    category: "V9 — Communications",
    requirement: "Toutes les communications transitent en HTTPS avec HSTS activé.",
    optionId: "https",
  },
  {
    category: "V11 — Logique métier",
    requirement: "Les actions sensibles sont protégées contre les abus par limitation de débit.",
    optionId: "rateLimiting",
  },
  {
    category: "V14 — Configuration",
    requirement: "Les en-têtes de sécurité sont configurés et aucun secret n'est codé en dur.",
    optionId: "headers",
  },
  {
    category: "V14 — Configuration",
    requirement: "Les secrets (clés API, identifiants) sont fournis via des variables d'environnement.",
    optionId: "secrets",
  },
];

export interface AsvsResult extends AsvsCriterion {
  status: "ok" | "warning";
}

export function analyzeAsvs(selectedOptions: Set<string>): AsvsResult[] {
  return ASVS_CRITERIA.map((criterion) => ({
    ...criterion,
    status: selectedOptions.has(criterion.optionId) ? "ok" : "warning",
  }));
}

export function buildSetupCommands(template: ProjectTemplate, selectedOptions: Set<string>): string[] {
  const commands = [
    `mkdir mon-projet-${template.id}`,
    `cd mon-projet-${template.id}`,
    "npm create vite@latest frontend -- --template react-ts",
  ];

  if (template.id !== "portfolio" && template.id !== "pwa") {
    commands.push("mkdir backend && cd backend && npm init -y && cd ..");
    commands.push("npm install --prefix backend express prisma @prisma/client");
  }

  if (selectedOptions.has("auth")) {
    commands.push("npm install --prefix backend jsonwebtoken argon2");
  }
  if (selectedOptions.has("validation")) {
    commands.push("npm install --prefix backend zod");
  }
  if (selectedOptions.has("headers")) {
    commands.push("npm install --prefix backend helmet");
  }
  if (selectedOptions.has("rateLimiting")) {
    commands.push("npm install --prefix backend express-rate-limit");
  }
  if (selectedOptions.has("secrets")) {
    commands.push("touch backend/.env && echo '.env' >> backend/.gitignore");
  }

  return commands;
}
