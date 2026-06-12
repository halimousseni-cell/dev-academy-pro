# Dev Academy Pro

Plateforme d'apprentissage du développement web — MVP "Security First".

## Documentation

Avant tout développement, consultez le dossier [`docs/`](./docs) :
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — architecture, arborescence, flux d'authentification
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) — schéma de la base de données
- [THREAT_MODEL.md](./docs/THREAT_MODEL.md) — analyse de risques (STRIDE)
- [SECURITY_CHECKLIST.md](./docs/SECURITY_CHECKLIST.md) — checklist de sécurité
- [ROADMAP.md](./docs/ROADMAP.md) — feuille de route complète

## Démarrage avec Docker (recommandé)

L'application est entièrement conteneurisée : frontend (Nginx), backend
(Express/Node) et base de données PostgreSQL, sur un réseau privé Docker.

```bash
# 1. Configurer les secrets (PostgreSQL, JWT) pour Docker Compose
cp .env.example .env    # éditer les valeurs, notamment les secrets JWT et POSTGRES_PASSWORD

# 2. Construire les images et démarrer la pile
docker compose up -d --build

# 3. Initialiser les données de démo (modules, examens, compte démo)
docker compose exec backend npx tsx prisma/seed.ts

# 4. Ouvrir l'application
# Frontend : http://localhost:8080  (l'API est proxiée sous /api par Nginx)
```

Les migrations Prisma (`prisma migrate deploy`) sont appliquées
automatiquement au démarrage du conteneur backend. Pour arrêter la pile :
`docker compose down` (ajouter `-v` pour supprimer aussi les données
PostgreSQL).

## Déploiement en production (HTTPS)

La surcouche `docker-compose.prod.yml` ajoute un reverse proxy Nginx qui
termine le TLS (certificat Let's Encrypt via Certbot, renouvellement
automatique) devant le frontend, qui n'est alors plus exposé directement.

```bash
# 1. Configurer .env : secrets habituels + DOMAIN, LETSENCRYPT_EMAIL,
#    FRONTEND_ORIGIN=https://<DOMAIN>, COOKIE_SECURE=true
cp .env.example .env

# 2. Pointer le DNS (A/AAAA) de <DOMAIN> vers ce serveur, puis obtenir le
#    premier certificat (à exécuter une seule fois)
./init-letsencrypt.sh

# 3. Démarrer la pile complète
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Le certificat est renouvelé automatiquement par le service `certbot` ; le
reverse proxy `nginx` recharge sa configuration toutes les 6 heures pour en
tenir compte.

## Démarrage rapide (développement local sans Docker)

Nécessite une instance PostgreSQL locale (ex. `docker compose up -d db`,
port 5432 publié).

### Backend (API Express + PostgreSQL)

```bash
cd backend
cp .env.example .env   # renseigner DATABASE_URL et générer des secrets JWT (voir commentaires dans le fichier)
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev             # http://localhost:4000
```

### Frontend (React + Vite)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Compte de démonstration

- Email : `demo@devacademy.pro`
- Mot de passe : `DemoUser#2026`

## Périmètre de ce MVP

- Authentification sécurisée (JWT + refresh token avec rotation, Argon2id,
  rate limiting, verrouillage de compte).
- Tableau de bord de progression (niveau, temps passé, objectif hebdo,
  badges).
- Module pédagogique complet : **HTML5 & CSS3 — Fondamentaux** (4 leçons,
  2 quiz notés).

Voir [ROADMAP.md](./docs/ROADMAP.md) pour les phases suivantes (laboratoires
interactifs, simulateurs, centre cybersécurité, IA pédagogique, etc.).
