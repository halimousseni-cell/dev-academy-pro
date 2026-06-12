# Dev Academy Pro — Threat Model (STRIDE)

Analyse de risques réalisée avant toute écriture de code, conformément aux
exigences de sécurité maximale du projet.

## 1. Actifs à protéger
- Identifiants et mots de passe des utilisateurs (hash Argon2id).
- Tokens de session (access/refresh JWT).
- Données de progression pédagogique (vie privée, intégrité des notes/badges).
- Contenu pédagogique (intégrité — éviter modification non autorisée des
  cours/quiz).
- Disponibilité de l'API (anti brute-force, anti DoS basique).

## 2. Acteurs / Surfaces d'attaque
- Utilisateur non authentifié (endpoints publics : register, login, refresh).
- Utilisateur authentifié STUDENT (peut tenter une élévation de privilèges,
  IDOR sur les ressources d'autres utilisateurs).
- INSTRUCTOR/ADMIN (comptes à privilèges élevés — cible prioritaire).
- Réseau (MITM si TLS absent/mal configuré).
- Stockage (fichier SQLite, variables d'environnement, secrets).

## 3. Analyse STRIDE par composant

### Authentification (`/api/auth/*`)
| Menace | Description | Mitigation |
|---|---|---|
| Spoofing | Usurpation d'identité via vol de credentials | Argon2id, politique de mot de passe robuste, MFA (roadmap) |
| Tampering | Falsification d'un JWT | Signature HS256 avec secret fort (≥32 bytes), vérification systématique |
| Repudiation | Utilisateur nie une action (login, changement de mdp) | AuditLog horodaté, IP + user-agent enregistrés |
| Information Disclosure | Fuite d'identifiants via messages d'erreur trop précis | Messages génériques ("identifiants invalides"), pas de distinction email inexistant / mdp incorrect |
| Denial of Service | Brute-force sur /login, /register | express-rate-limit (5 req/15min), verrouillage progressif de compte (`failedLoginCount`, `lockedUntil`) |
| Elevation of Privilege | Modification du `role` via payload JWT falsifié ou via endpoint update profile | `role` jamais accepté depuis le client ; vérifié côté serveur uniquement, middleware `requireRole` sur chaque route sensible |

### Refresh Tokens
| Menace | Description | Mitigation |
|---|---|---|
| Token theft (XSS) | Vol du refresh token via script malveillant | Cookie `httpOnly`, `Secure`, `SameSite=Strict` — inaccessible en JS |
| Token replay | Réutilisation d'un refresh token déjà utilisé/révoqué | Détection de réutilisation → révocation globale de toutes les sessions de l'utilisateur + alerte AuditLog |
| Token theft (DB leak) | Fuite de la base de données | Tokens stockés **hashés** (SHA-256), jamais en clair |

### API REST (`/api/*`)
| Menace | Description | Mitigation |
|---|---|---|
| Injection SQL | Requêtes non paramétrées | Prisma exclusivement (requêtes préparées) |
| XSS | Injection de script via contenu utilisateur (ex: futurs commentaires) | Échappement automatique React, CSP stricte (`script-src 'self'`), sanitization des entrées |
| CSRF | Requête forgée depuis un site tiers | `SameSite=Strict` sur cookies, vérification `Origin`/`Referer` sur requêtes mutatives |
| IDOR | Accès aux ressources d'un autre utilisateur (ex: `GET /api/progress/:userId`) | Toute requête utilise `req.user.id` du token, jamais un ID fourni par le client pour les ressources personnelles |
| SSRF | Requête serveur vers une URL contrôlée par l'attaquant | Aucun fetch d'URL utilisateur dans le MVP ; si ajouté plus tard, whitelist stricte |
| Mass assignment | Client envoie des champs non prévus (ex: `role: ADMIN` au register) | Validation Zod avec schémas stricts (`.strict()`), whitelisting explicite des champs |
| Command/Path Injection | N/A dans le MVP (pas d'exécution shell/fichiers utilisateur) | À réévaluer lors de l'ajout du Lab Code (sandbox obligatoire, roadmap) |

### Base de données
| Menace | Description | Mitigation |
|---|---|---|
| Information Disclosure | Accès direct au fichier `dev.db` | Fichier hors du dossier servi statiquement, permissions restreintes, exclu de git (`.gitignore`) |
| Tampering | Modification directe non auditée | Toutes les écritures passent par les services applicatifs (logs d'audit) |

### Déploiement / Secrets
| Menace | Description | Mitigation |
|---|---|---|
| Secrets en clair dans le code | Fuite via repo git | `.env` exclu de git, `.env.example` fourni sans valeurs réelles, validation au démarrage (Zod) |
| Headers manquants | Absence de protections navigateur | Helmet configuré (CSP, HSTS, X-Frame-Options, etc.) |
| CORS trop permissif | `*` autorise tout site à appeler l'API | Whitelist stricte de l'origine frontend |

## 4. Risques résiduels (MVP) à traiter en itérations futures
- MFA non actif par défaut (champ préparé en base, activation prévue roadmap).
- Pas encore de détection d'anomalies en temps réel / dashboard de sécurité
  (nécessite volume de données + infra de monitoring).
- Pas de scan automatique de vulnérabilités (SAST/DAST) en CI — prévu lors de
  la mise en place du pipeline CI/CD (roadmap).
- HTTPS non actif en local (dev) — obligatoire dès le déploiement (Nginx +
  certificats, roadmap).
