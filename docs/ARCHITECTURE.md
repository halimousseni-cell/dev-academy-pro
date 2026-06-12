# Dev Academy Pro — Architecture

## 1. Vue d'ensemble

Dev Academy Pro est une plateforme d'apprentissage du développement web, conçue
selon une approche **Security First** et une **architecture multicouche**
stricte. Cette itération (MVP) pose les fondations : authentification
sécurisée, dashboard de progression, et un module pédagogique complet
(HTML5 & CSS3) avec cours, quiz et suivi de progression.

Les modules avancés (IDE en ligne, simulateurs Git/Linux/SQL, centre
cybersécurité, jeux, assistant IA, générateur de projets, CI/CD) sont décrits
dans la [ROADMAP](./ROADMAP.md) et seront ajoutés itérativement sur ces
fondations, sans rupture d'architecture.

## 2. Stack technique (MVP)

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS | SPA performante, typage strict, build rapide |
| Backend | Node.js + Express + TypeScript | Écosystème mature, middleware de sécurité riche |
| Base de données | SQLite (Prisma ORM) | Zéro install pour le MVP local ; migration vers PostgreSQL documentée (section 8) |
| Authentification | JWT (access + refresh) + Argon2id | Sessions stateless + rotation de tokens, hash de mot de passe résistant |
| Sécurité transverse | Helmet, CORS strict, express-rate-limit, Zod | Headers de sécurité, validation stricte des entrées |

> **Migration PostgreSQL** : le schéma Prisma est écrit pour être compatible
> SQLite ET PostgreSQL. Passer en production = changer `provider` dans
> `schema.prisma` + `DATABASE_URL`, sans changement de code applicatif.

## 3. Architecture multicouche (backend)

```
HTTP Request
   │
   ▼
┌─────────────────────────────┐
│ Middleware globaux           │  helmet, cors, rate-limit, body-parser,
│                               │  cookie-parser, request-logger
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ Routes (presentation layer)  │  validation des entrées (Zod), mapping HTTP
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ Controllers                  │  orchestration, gestion des erreurs HTTP
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ Services (business logic)    │  règles métier, sécurité applicative
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ Repositories (Prisma)        │  accès données, requêtes préparées
└─────────────────────────────┘
   │
   ▼
┌─────────────────────────────┐
│ Base de données (SQLite/PG)  │
└─────────────────────────────┘
```

Chaque couche ne connaît que la couche immédiatement inférieure. Les
contrôleurs ne touchent jamais Prisma directement ; les services ne
connaissent jamais `req`/`res`.

## 4. Arborescence du projet

```
dev-academy-pro/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── ROADMAP.md
│   ├── THREAT_MODEL.md
│   └── SECURITY_CHECKLIST.md
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts                  # validation des variables d'env (Zod)
│   │   ├── db/
│   │   │   └── client.ts               # PrismaClient singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts                 # vérification JWT + rôles
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiters.ts
│   │   │   ├── requestLogger.ts
│   │   │   └── validate.ts             # validation Zod générique
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schema.ts
│   │   │   ├── users/
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── courses/
│   │   │   │   ├── courses.routes.ts
│   │   │   │   ├── courses.controller.ts
│   │   │   │   └── courses.service.ts
│   │   │   ├── quizzes/
│   │   │   │   ├── quizzes.routes.ts
│   │   │   │   ├── quizzes.controller.ts
│   │   │   │   └── quizzes.service.ts
│   │   │   └── progress/
│   │   │       ├── progress.routes.ts
│   │   │       ├── progress.controller.ts
│   │   │       └── progress.service.ts
│   │   ├── utils/
│   │   │   ├── password.ts             # Argon2id
│   │   │   ├── tokens.ts               # JWT access/refresh
│   │   │   └── logger.ts
│   │   ├── app.ts                      # configuration Express (middlewares + routes)
│   │   └── server.ts                   # point d'entrée (listen)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts                # axios + intercepteur refresh token
    │   ├── components/
    │   │   ├── layout/ (Navbar, Sidebar, ProtectedRoute)
    │   │   ├── dashboard/ (StatCard, ProgressRing, BadgeList)
    │   │   └── learning/ (LessonViewer, QuizPlayer, ChapterNav)
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── auth/ (LoginPage, RegisterPage)
    │   │   ├── DashboardPage.tsx
    │   │   ├── courses/ (CourseListPage, ModulePage, ChapterPage)
    │   │   └── NotFoundPage.tsx
    │   ├── routes/
    │   │   └── AppRouter.tsx
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── tailwind.config.ts
    ├── vite.config.ts
    └── package.json
```

## 5. Flux d'authentification (JWT + refresh rotation)

1. `POST /api/auth/register` — création de compte (email + mot de passe,
   politique de robustesse appliquée, hash Argon2id).
2. `POST /api/auth/login` — vérifie les identifiants, limite les tentatives
   (rate limiting + verrouillage progressif), émet :
   - **Access Token** (JWT, 15 min, signé HS256, contient `sub`, `role`, `jti`)
   - **Refresh Token** (opaque, stocké hashé en base, cookie `httpOnly`,
     `Secure`, `SameSite=Strict`, 7 jours)
3. Chaque requête API protégée envoie l'access token en `Authorization: Bearer`.
4. `POST /api/auth/refresh` — vérifie le refresh token (cookie), le **révoque**
   et en émet un nouveau (rotation), détecte le rejeu (réutilisation d'un
   refresh token déjà révoqué = compromission présumée → révocation globale
   de toutes les sessions de l'utilisateur).
5. `POST /api/auth/logout` — révoque le refresh token courant.
6. `POST /api/auth/logout-all` — révoque tous les refresh tokens de
   l'utilisateur (déconnexion globale).

> MFA (TOTP) est prévu dans la roadmap (table `User.mfaSecret` déjà présente
> dans le schéma pour ne pas casser la compatibilité plus tard).

## 6. Modèle de rôles

- `STUDENT` — accès au parcours pédagogique, dashboard personnel.
- `INSTRUCTOR` — gestion de contenu (modules/chapitres/quiz).
- `ADMIN` — gestion des utilisateurs, accès aux logs d'audit.

Le contrôle d'accès est appliqué **à chaque endpoint** via le middleware
`requireRole(...)`, jamais uniquement côté frontend.

## 7. Sécurité transverse appliquée dès le MVP

- **Helmet** : CSP stricte, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer`, `Strict-Transport-Security` (en prod HTTPS).
- **CORS** : whitelist stricte de l'origine frontend, `credentials: true`.
- **Rate limiting** : global (100 req/15min/IP) + spécifique sur
  `/api/auth/login` et `/api/auth/register` (5 req/15min/IP) avec
  verrouillage de compte progressif après échecs répétés.
- **Validation** : tous les payloads sont validés avec Zod avant d'atteindre
  les contrôleurs (protection contre injection, payloads malformés).
- **Requêtes préparées** : Prisma uniquement, aucune requête SQL brute non
  paramétrée.
- **Logs d'audit** : table `AuditLog` — connexions, échecs, changements de
  rôle, suppression de compte.

Voir [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) pour le détail complet.

## 8. Migration SQLite → PostgreSQL

1. Provisionner une base PostgreSQL (Docker recommandé en production : voir
   roadmap section "Déploiement").
2. Modifier `backend/prisma/schema.prisma` :
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
3. Définir `DATABASE_URL=postgresql://user:pass@host:5432/devacademy`.
4. `npx prisma migrate deploy`.

Aucun changement de code applicatif requis : Prisma abstrait le dialecte SQL.
