# Dev Academy Pro — Feuille de route

## Phase 0 — Documentation (✅ terminée)
- Architecture, schéma BDD, threat model, checklist de sécurité.

## Phase 1 — MVP fondations (en cours, cette itération)
- Backend Express+TS+Prisma+SQLite : auth (JWT+refresh+Argon2id), rate
  limiting, headers de sécurité, audit log basique.
- Frontend React+Vite+TS+Tailwind : pages Login/Register, layout protégé,
  AuthContext avec refresh automatique.
- Dashboard de progression : niveau, temps passé, objectif hebdo,
  compétences, badges (au moins 1 badge fonctionnel).
- 1 module pédagogique complet : **HTML5 & CSS3 — Fondamentaux**
  (2-3 chapitres : théorie + quiz QCM/Vrai-Faux + suivi de progression).
- Seed de données (module + utilisateur de démo).

## Phase 2 — Extension du parcours pédagogique (✅ terminée)
- Modules suivants : JavaScript ✅, Git/GitHub ✅, Linux ✅, SQL ✅, React ✅,
  Node/Express ✅ — **tous ajoutés**.
  - **JavaScript — Fondamentaux** ajouté (2 chapitres, 4 leçons, 2 quiz),
    catégorie Front-end, badge de complétion dédié.
  - **Git & GitHub — Fondamentaux** ajouté (2 chapitres, 4 leçons, 2 quiz),
    catégorie Outils, badge de complétion dédié (`MODULE_COMPLETED_GIT`).
  - **Linux — Fondamentaux** ajouté (2 chapitres, 4 leçons, 2 quiz),
    catégorie Outils, badge de complétion dédié (`MODULE_COMPLETED_LINUX`).
  - **SQL — Fondamentaux** ajouté (2 chapitres, 4 leçons, 2 quiz),
    catégorie Données, badge de complétion dédié (`MODULE_COMPLETED_SQL`).
  - **React — Fondamentaux** ajouté (2 chapitres, 4 leçons, 2 quiz),
    catégorie Front-end, badge de complétion dédié (`MODULE_COMPLETED_REACT`).
  - **Node.js & Express — Fondamentaux** ajouté (2 chapitres, 4 leçons,
    2 quiz), catégorie Back-end, badge de complétion dédié
    (`MODULE_COMPLETED_NODE`).
- Système de quiz avancé : ✅ compléter le code (CODE_FILL — saisie libre,
  comparaison normalisée), ✅ glisser-déposer (DRAG_DROP — réordonnancement
  drag & drop + boutons monter/descendre, ordre correct calculé côté
  serveur, réponses mélangées avant envoi au client pour ne pas fuiter
  l'ordre), ✅ débogage (DEBUG — même grille de correction normalisée que
  CODE_FILL), ✅ questions chronométrées (`Quiz.timeLimitSeconds`,
  compte à rebours + soumission automatique à expiration).
- Système de badges étendu + statistiques détaillées dashboard.
  - ✅ Badges de complétion de module génériques
    (`Module.completionBadgeCode` + `checkAndAwardModuleCompletion`),
    attribués automatiquement quand toutes les leçons sont terminées et tous
    les quiz réussis. Premiers badges : `MODULE_COMPLETED_HTML_CSS`,
    `MODULE_COMPLETED_JAVASCRIPT`.
  - ✅ Statistiques détaillées dashboard : progression par module
    (leçons/quiz terminés, % de progression) et historique des 5 dernières
    tentatives de quiz (titre, module, score, réussite, date).

## Phase 3 — Laboratoires interactifs (✅ terminée)
- ✅ Laboratoire de code (sandbox HTML/CSS/JS) : page `/laboratoires/code`,
  éditeur à onglets HTML/CSS/JS, aperçu dans une `<iframe sandbox="allow-scripts">`
  (pas de `allow-same-origin`, isolation stricte de l'origine, aucun accès
  aux cookies/session/DOM parent), console captée via `postMessage` filtré
  par `event.source`. Page d'index `/laboratoires` listant les 5 labos.
- ✅ Simulateur Git : page `/laboratoires/git`, moteur pur TypeScript
  (`src/lib/gitSimulator.ts`) simulant un dépôt en mémoire (commits,
  branches, index, HEAD) — `git init/status/add/commit/branch/checkout
  [-b]/merge/log [--oneline]/diff`, plus `ls`/`cat`/`clear`/`help`. Terminal
  avec historique de commandes (flèches haut/bas), panneau branches et
  éditeur de fichiers du répertoire de travail. Aucune commande shell réelle
  n'est exécutée.
- ✅ Simulateur Linux : page `/laboratoires/linux`, moteur pur TypeScript
  (`src/lib/linuxSimulator.ts`) avec un système de fichiers virtuel en
  mémoire (arborescence `/home/etudiant`, `/etc`, `/var/log`...) —
  `pwd/ls [-a -l]/cd/cat/echo [> >>]/mkdir [-p]/touch/rm [-r]/rmdir/cp/mv/
  head/tail/grep/find/wc/whoami/hostname/date`, plus `clear`/`help`.
  Terminal avec historique de commandes (flèches haut/bas), prompt
  `etudiant@dev-academy:~$`. Aucune commande shell réelle n'est exécutée.
- ✅ Laboratoire SQL : page `/laboratoires/sql`, moteur SQLite WebAssembly
  (`sql.js`, fichier `sql-wasm.wasm` servi statiquement) exécuté entièrement
  dans le navigateur — base de données en mémoire (tables `etudiants`,
  `cours`, `inscriptions` pré-remplies), éditeur de requêtes SQL multi-lignes
  (Ctrl+Entrée pour exécuter), affichage des résultats sous forme de
  tableau(x), panneau schéma (tables/colonnes), historique des requêtes,
  requêtes d'exemple, bouton de réinitialisation. Aucune donnée n'est envoyée
  à un serveur.
- ✅ Laboratoire API : page `/laboratoires/api`, serveur REST simulé en
  mémoire (`src/lib/apiLab.ts`, aucun appel réseau réel) — endpoints
  `/api/auth/login`, `/api/auth/me`, `/api/articles` (CRUD avec règles
  d'auteur/admin), `/api/users` (admin uniquement). JWT pédagogique
  (header.payload.signature en base64url, signature par hachage simple —
  format illustratif, pas une cryptographie de production), expiration
  (`exp`), gestion des rôles `admin/author/user`. Interface façon client
  REST : sélecteur de méthode/URL, en-tête Authorization, corps JSON,
  affichage de la réponse (statut/JSON), token décodé (header/payload),
  comptes de démo, requêtes prêtes à l'emploi, historique.

## Phase 4 — Centre Cybersécurité & Jeux (✅ terminée)
- ✅ Page d'index `/securite` listant les modules OWASP Top 10 et les jeux
  pédagogiques (cartes, statut "Bientôt disponible" pour les éléments non
  démarrés). Navbar : nouveau lien "Sécurité".
- Modules OWASP Top 10 avec démonstrations contrôlées (XSS/CSRF/SQLi en
  environnement sandboxé dédié, jamais sur l'app réelle).
  - ✅ XSS (Cross-Site Scripting) : page `/securite/xss`, démonstration dans
    deux `<iframe sandbox="allow-scripts">` isolées (aucun `allow-same-origin`)
    comparant un rendu "vulnérable" (HTML injecté brut) et un rendu "protégé"
    (échappement des caractères spéciaux), capture de la console/`alert()`
    via `postMessage` filtré par `event.source` et `data.source ===
    "devacademy-lab"`, payloads d'exemple, explications des types de XSS et
    des mitigations (échappement, CSP, cookies HttpOnly).
  - ✅ Injection SQL : page `/securite/sqli`, base SQLite en mémoire (`sql.js`)
    pré-remplie avec une table `users` — formulaire de connexion comparant
    une requête vulnérable (concaténation de chaînes, ex. payload
    `' OR '1'='1`) et une requête protégée (requête paramétrée avec `?`),
    affichage de la requête SQL réellement exécutée et du résultat,
    payloads d'exemple, explications du problème et des mitigations
    (requêtes préparées, ORM, moindre privilège).
  - ✅ CSRF : page `/securite/csrf`, simulation en mémoire d'une application
    bancaire et d'un site piégé — bouton "Réclamer mon cadeau" déclenchant un
    virement caché vers le compte de l'attaquant. Bascule "Protection CSRF"
    : désactivée, le virement forgé réussit (cookie de session simulé envoyé
    automatiquement) ; activée, il est rejeté faute de jeton CSRF valide.
    Journal d'activité, explications du problème et des mitigations
    (jeton anti-CSRF, `SameSite`, vérification `Origin`/`Referer`,
    ré-authentification).
  - ✅ Contrôle d'accès défaillant : page `/securite/controle-acces`, API de
    documents (factures) simulée en mémoire (`src/lib/accessControlDemo.ts`)
    — sélecteur d'utilisateur (Alice/Bob/Admin), bascule "Vérification des
    autorisations", requête `GET /api/documents/:id` (IDOR : changer l'ID
    permet d'accéder aux documents d'un autre utilisateur si la protection
    est désactivée) et `GET /api/admin/users` (route admin accessible sans
    vérification de rôle si la protection est désactivée), historique des
    requêtes avec statuts HTTP, explications du problème et des mitigations
    (vérification d'autorisation côté serveur, deny by default, protection
    des routes d'administration, identifiants non devinables).
  - ✅ Mauvaise configuration de sécurité : page `/securite/configuration`,
    comparaisons statiques "mal configuré" / "durci" (`src/lib/
    securityMisconfigDemo.ts`) sur 4 thèmes — en-têtes de réponse HTTP
    (bannières de version vs en-têtes de sécurité CSP/HSTS/X-Frame-Options/
    X-Content-Type-Options), page d'erreur détaillée (pile d'appels et
    identifiants exposés vs message générique), listing de répertoire
    (autoindex exposant des sauvegardes vs 403), configuration CORS
    (origine `*` + cookies vs liste blanche d'origines). Explications du
    problème et des mitigations.
  - ✅ Authentification défaillante : page `/securite/authentification`,
    simulation en mémoire (`src/lib/authDemo.ts`) — formulaire de connexion
    avec compte de démo, bouton "Lancer une attaque par force brute" testant
    une liste de mots de passe courants, bascule "Protection" activant le
    verrouillage du compte après 5 tentatives échouées (rate limiting) et une
    politique de mot de passe (longueur, majuscule/minuscule/chiffre, refus
    des mots de passe courants) pour le formulaire de changement de mot de
    passe. Journal des tentatives, explications du problème et des
    mitigations (rate limiting, politique de mot de passe, MFA, gestion de
    session).
- Jeux pédagogiques :
  - ✅ Chasse aux bugs : page `/securite/jeux/chasse-aux-bugs`
    (`src/lib/games/bugHuntData.ts`) — 6 extraits de code (JS/SQL/Node)
    contenant chacun un bug ou une faille (off-by-one, injection SQL par
    concaténation, affectation au lieu de comparaison, XSS via `innerHTML`,
    mot de passe stocké en clair, clé secrète exposée côté client). Lignes de
    code cliquables, validation de la ligne sélectionnée, explication
    pédagogique, score sur l'ensemble des défis, rejouabilité.
  - ✅ Memory : page `/securite/jeux/memory` (`src/lib/games/memoryData.ts`)
    — jeu de paires terme/définition (XSS, CSRF, injection SQL, IDOR,
    hachage, JWT, CORS, MFA), grille de cartes mélangées, retournement de
    deux cartes, comptage des coups, détection de victoire, bouton
    recommencer.
  - ✅ Puzzle JS : page `/securite/jeux/puzzle-js`
    (`src/lib/games/puzzleData.ts`) — 5 extraits de code JavaScript dont les
    lignes sont mélangées, réordonnancement via boutons monter/descendre,
    vérification de l'ordre, bouton "voir la solution", score, puzzle
    suivant.
  - ✅ Escape Game : page `/securite/jeux/escape-game`
    (`src/lib/games/escapeGameData.ts`) — 4 énigmes séquentielles sur des
    thèmes de sécurité (hachage MD5 réversible, bug de comparaison,
    injection SQL, politique de mot de passe), chronomètre, indices
    optionnels (comptabilisés), barre de progression, écran de victoire avec
    temps total et indices utilisés, bouton recommencer.
  - ✅ Quiz Battle : page `/securite/jeux/quiz-battle`
    (`src/lib/games/quizBattleData.ts`) — 8 questions QCM (sécurité,
    JavaScript, Git, SQL) avec minuteur de 15 secondes par question,
    opposition simulée à un bot (réponse aléatoire avec probabilité de
    réussite et délai aléatoires), score basé sur la rapidité de réponse,
    écran de résultat final (victoire/défaite/égalité), rejouabilité.

## Phase 5 — IA pédagogique & génération de projets (✅ terminée)
- ✅ Page d'index `/ia` listant l'Assistant IA et le Générateur de projets.
  Navbar : nouveau lien "IA".
- ✅ Assistant IA : page `/ia/assistant` (`src/lib/ai/aiAssistant.ts`) — mode
  démonstration fonctionnant entièrement en local, sans appel à un service
  externe (bandeau d'avertissement explicite ; une vraie intégration
  OpenAI/Anthropic via clé API/secrets vault pourra être branchée plus tard
  derrière la même interface). Trois modes : "Expliquer du code" et "Corriger
  du code" (détection par expressions régulières de motifs courants —
  `==` vs `===`, affectation dans une condition, `innerHTML` non échappé,
  injection SQL par concaténation, `var`, mot de passe en clair, boucle
  off-by-one — avec explication et suggestion de correction dédiées, ou
  analyse générique sinon), et "Générer un exercice" (choix d'un thème :
  JavaScript, SQL, Git, Sécurité web, React — exercice tiré aléatoirement
  avec énoncé et indice). Historique des échanges affiché sous le formulaire.
- ✅ Générateur de projets : page `/ia/generateur-projets`
  (`src/lib/ai/projectGenerator.ts`) — choix d'un type de projet (Portfolio,
  Blog, E-commerce, Dashboard, PWA, API) avec stack technique et arborescence
  de fichiers associées, sélection d'options de sécurité (HTTPS/HSTS, JWT +
  rôles, validation des entrées, en-têtes de sécurité, rate limiting, secrets
  via variables d'environnement, journalisation), génération de commandes
  d'installation adaptées aux choix, et analyse OWASP ASVS simplifiée
  (8 critères répartis sur les catégories V2/V4/V5/V7/V9/V11/V14, statut
  "couvert"/"à renforcer" selon les options sélectionnées). Aucune génération
  de fichiers réelle ni appel réseau : tout est calculé et affiché côté
  client.

## Phase 6 — Certification & projet fil rouge (✅ terminée)
- Examens de fin de module, calcul de note, certificats numériques (PDF
  signés).
  - Backend : nouveaux modèles Prisma `Exam`/`ExamQuestion`/`ExamAnswer`
    (1 examen par module, questions MCQ/TRUE_FALSE/CODE_FILL/DEBUG/DRAG_DROP
    réutilisant les types de questions des quiz), `ExamAttempt` (historique
    des tentatives) et `Certificate` (1 certificat par couple
    utilisateur/module, contrainte d'unicité).
  - Module `certification` (`backend/src/modules/certification`) : routage
    `/api/exams` (`GET /module/:moduleId`, `POST /:id/submit`) et
    `/api/certificates` (`GET /`, `GET /:id`, `GET /:id/pdf`,
    `GET /verify/:serialNumber` public et non authentifié).
  - L'examen final n'est accessible et corrigible que si le module est
    entièrement terminé (toutes les leçons à `COMPLETED` et tous les quiz
    réussis), même logique de correction que les quiz existants.
  - À la réussite (score ≥ score de passage, 70% par défaut), un certificat
    est généré avec un numéro de série unique (`DAP-AAAA-XXXXXXXXXX`) et une
    signature HMAC-SHA256 (clé `JWT_ACCESS_SECRET`) calculée sur les données
    du certificat — signature "pédagogique", explicitement présentée comme
    telle (et non une signature électronique de production/PKI).
  - Génération de PDF signés via `pdfkit` (certificat A4 paysage avec nom du
    titulaire, module, score, date, numéro de série et empreinte de
    signature), téléchargeable depuis l'application.
  - Page publique de vérification (`/certificats/verifier/:serialNumber`,
    accessible sans connexion) : recalcule la signature et affiche
    authenticité, titulaire, module, score et date si elle correspond.
  - Frontend : `ExamPlayer` (mode QCM/Vrai-Faux chronométré, mirroring du
    `QuizPlayer`), page `/modules/:slug/examen` (accès conditionné à la
    complétion du module, lien vers le certificat existant), page
    `/certificats` (liste des certificats obtenus + téléchargement PDF), et
    bouton "Passer l'examen final" sur la page module une fois celui-ci
    terminé.
  - Données de seed : un examen de 5 questions (MCQ/Vrai-Faux) pour chacun
    des 7 modules publiés (`backend/prisma/seed-exams.ts`, intégré au script
    de seed principal).
- Projet fil rouge complet (cahier des charges → déploiement).
  - Page `/projet-fil-rouge` : guide de projet capstone en 5 étapes (cahier
    des charges, conception, développement, tests & sécurité, déploiement),
    chacune avec un objectif, une description et une checklist de tâches
    concrètes, ainsi que des liens vers les laboratoires, le centre de
    sécurité et les outils IA pertinents pour chaque étape.
  - La progression (cases cochées) est sauvegardée localement dans le
    navigateur (`localStorage`) et affichée sous forme de barre de
    progression globale et par étape.

## Phase 7 — Déploiement & sécurité production (en cours)
- ✅ Dockerisation : `backend/Dockerfile` et `frontend/Dockerfile` multi-stage
  (build puis image minimale `node:20-alpine` / `nginx:alpine`, utilisateur
  non-root pour le backend, `HEALTHCHECK`). `docker-compose.yml` à la racine
  avec 3 services sur un réseau privé (`internal`) : `db` (PostgreSQL 16,
  volume nommé `postgres_data`), `backend` (migrations Prisma appliquées
  automatiquement au démarrage via `docker-entrypoint.sh`), `frontend`
  (Nginx servant le build Vite, fallback SPA, proxy `/api/` vers le backend
  — même origine côté navigateur, pas de CORS). Variables sensibles dans un
  `.env` racine non commité (voir `.env.example`).
- ✅ Migration SQLite → PostgreSQL : `backend/prisma/schema.prisma` utilise
  désormais le provider `postgresql`, nouvelle migration initiale
  (`prisma/migrations/<timestamp>_init`). `COOKIE_SECURE` ajouté
  (`backend/src/config/env.ts`) pour découpler le flag `Secure` du cookie de
  refresh token de `NODE_ENV` (utile tant que le reverse proxy HTTPS n'est
  pas en place).
- ⬜ CI/CD GitHub Actions : lint, tests, SAST (Semgrep), scan de
  vulnérabilités (Trivy), build images, DAST (OWASP ZAP) sur environnement
  de staging.
- ⬜ Nginx reverse proxy dédié + HTTPS (Let's Encrypt), HSTS, `COOKIE_SECURE=true`.
- ✅ MFA (TOTP, RFC 6238) + dashboard de sécurité + détection d'anomalies :
  - `backend/src/utils/totp.ts` (base32, génération de secret, URI
    `otpauth://`, vérification HMAC-SHA1 avec tolérance ±1 pas de 30s) et
    `backend/src/utils/recoveryCodes.ts` (8 codes de récupération à usage
    unique au format `XXXX-XXXX`, hachés comme les refresh tokens).
  - Modèle `MfaRecoveryCode` (Prisma) et nouvelle migration
    `add_mfa_recovery_codes`.
  - Flux de connexion : `POST /api/auth/login` renvoie `{ mfaRequired, mfaToken }`
    si la 2FA est activée ; `POST /api/auth/mfa/login` valide le code TOTP ou
    un code de récupération et finalise la connexion.
  - Gestion de la 2FA (utilisateur authentifié) : `POST /api/auth/mfa/setup`,
    `POST /api/auth/mfa/verify` (active la 2FA + génère les codes de
    récupération), `POST /api/auth/mfa/disable` (mot de passe + code requis).
  - Dashboard sécurité `GET /api/users/security` (statut 2FA, sessions
    actives avec détection de la session courante, 10 dernières entrées du
    journal d'activité) et `DELETE /api/users/security/sessions/:id`
    (révocation d'une session).
  - Détection basique de nouvel appareil : comparaison IP/user-agent avec le
    dernier login réussi, journalisée comme `NEW_DEVICE_LOGIN`.
  - Frontend : page `/parametres/securite` (QR code via `qrcode.react`,
    activation/désactivation de la 2FA, codes de récupération, sessions,
    activité récente), étape de saisie du code 2FA dans `LoginPage`, lien
    dans la `Navbar`.
- ⬜ Sauvegardes chiffrées automatisées de la base PostgreSQL.

## Critères de sortie du MVP (Phase 1)
- Inscription/connexion/déconnexion/rafraîchissement de session fonctionnels
  et sécurisés.
- Dashboard affiche progression réelle basée sur les données utilisateur.
- Module "HTML5 & CSS3" entièrement parcourable avec quiz noté et badge
  obtenu à la réussite.
- Tous les éléments ✅ de [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
  vérifiés en local.
