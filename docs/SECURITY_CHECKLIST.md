# Dev Academy Pro — Checklist de sécurité

Légende : ✅ implémenté dans ce MVP · 🕒 prévu en roadmap (documenté, non
bloquant pour le MVP) · — non applicable au MVP.

## Architecture
- ✅ Séparation stricte frontend/backend/DB (processus distincts)
- ✅ Architecture en couches (routes → controllers → services → repositories)
- ✅ Principe du moindre privilège (rôles STUDENT/INSTRUCTOR/ADMIN, middleware par route)
- ✅ Isolation des services via Docker + réseau privé (`docker-compose.yml`)

## Authentification
- ✅ JWT access token (courte durée, 15 min)
- ✅ Refresh token avec rotation + détection de réutilisation
- ✅ Hash de mot de passe Argon2id
- ✅ Politique de mot de passe robuste (longueur min, complexité, validation Zod)
- ✅ Limitation des tentatives de connexion + verrouillage progressif
- ✅ Déconnexion globale (`logout-all`)
- ✅ MFA (TOTP, RFC 6238) avec codes de récupération à usage unique, dashboard
  de sécurité (sessions actives + révocation, journal d'activité, détection
  basique de nouvel appareil)
- 🕒 Vérification contre listes de mots de passe compromis (API HaveIBeenPwned)
- 🕒 Historique des mots de passe (empêcher réutilisation)

## Protection OWASP Top 10
- ✅ Injection SQL — Prisma + requêtes paramétrées exclusivement
- ✅ XSS — échappement React, CSP stricte, validation/sanitization des entrées
- ✅ CSRF — cookies `SameSite=Strict`, vérification Origin sur requêtes mutatives
- — SSRF — aucune fonctionnalité de fetch d'URL externe dans le MVP
- ✅ IDOR — accès aux ressources via `req.user.id`, jamais via ID client
- — XXE — pas de parsing XML dans le MVP
- — Command Injection — aucune exécution shell dans le MVP
- — Directory Traversal — aucun accès fichier basé sur input utilisateur
- ✅ Insecure deserialization — JSON only, validation stricte des schémas
- ✅ Open Redirect — pas de redirections basées sur input utilisateur

## Sécurité API
- ✅ Validation stricte de toutes les entrées (Zod, `.strict()`)
- ✅ Rate limiting global + spécifique auth
- 🕒 Throttling avancé par utilisateur (roadmap)
- 🕒 Versioning d'API (`/api/v1`) — préparé dans la structure de routes
- ✅ Logging des accès (requestLogger)
- 🕒 Signature des requêtes sensibles (roadmap)
- ✅ Contrôle des permissions par rôle (middleware `requireRole`)

## Chiffrement
- 🕒 HTTPS obligatoire (TLS) — à activer via Nginx au déploiement
- ✅ Hash des mots de passe et tokens (jamais en clair)
- 🕒 Chiffrement des sauvegardes (roadmap)
- 🕒 Rotation automatique des clés (roadmap)

## Gestion des secrets
- ✅ Aucun secret en dur dans le code source
- ✅ `.env` exclu du contrôle de version, `.env.example` fourni
- ✅ Validation des variables d'environnement au démarrage (Zod)
- 🕒 Coffre-fort de secrets (Vault/Doppler) — roadmap production

## Headers de sécurité (Helmet)
- ✅ Content-Security-Policy
- ✅ Strict-Transport-Security (actif si HTTPS)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: no-referrer
- ✅ Permissions-Policy restrictive

## Surveillance & Audit
- ✅ Table `AuditLog` (connexions, échecs, actions sensibles)
- 🕒 Dashboard de sécurité temps réel (roadmap)
- 🕒 Détection d'anomalies / alertes automatiques (roadmap)
- 🕒 Export de rapports d'audit (roadmap)

## Base de données
- ✅ Requêtes préparées (Prisma)
- ✅ Contrôle d'accès granulaire via couche service
- 🕒 Sauvegardes automatiques chiffrées (roadmap)
- 🕒 Chiffrement at-rest (PostgreSQL + pgcrypto, roadmap production)

## Déploiement
- 🕒 Images Docker minimales (node:alpine multi-stage)
- 🕒 Scan automatique de vulnérabilités (Trivy/Snyk en CI)
- 🕒 Pipeline CI/CD sécurisé (GitHub Actions, secrets chiffrés)
- 🕒 Analyse SAST (ESLint security plugins, Semgrep)
- 🕒 Analyse DAST (OWASP ZAP)
- 🕒 Tests de sécurité automatisés

## Pédagogie sécurisée (contenu de la plateforme)
- 🕒 Module OWASP Top 10 avec démonstrations pratiques
- 🕒 Module pentesting éthique
- 🕒 Analyse automatique des projets générés selon OWASP ASVS
