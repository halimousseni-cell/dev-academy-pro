import { PrismaClient } from "@prisma/client";

interface ExamAnswerSeed {
  label: string;
  isCorrect: boolean;
  order: number;
}

interface ExamQuestionSeed {
  order: number;
  type: "MCQ" | "TRUE_FALSE";
  prompt: string;
  explanation: string;
  answers: ExamAnswerSeed[];
}

interface ExamSeed {
  moduleSlug: string;
  title: string;
  passingScore: number;
  timeLimitSeconds: number;
  questions: ExamQuestionSeed[];
}

function tf(
  order: number,
  prompt: string,
  isTrue: boolean,
  explanation: string
): ExamQuestionSeed {
  return {
    order,
    type: "TRUE_FALSE",
    prompt,
    explanation,
    answers: [
      { label: "Vrai", isCorrect: isTrue, order: 0 },
      { label: "Faux", isCorrect: !isTrue, order: 1 },
    ],
  };
}

const EXAMS: ExamSeed[] = [
  {
    moduleSlug: "html-css-fondamentaux",
    title: "Examen final — HTML5 & CSS3 Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quelle balise HTML permet de définir le titre principal d'une page ?",
        explanation: "`<h1>` représente le titre de plus haut niveau d'une page ou d'une section.",
        answers: [
          { label: "<h1>", isCorrect: true, order: 0 },
          { label: "<title>", isCorrect: false, order: 1 },
          { label: "<head>", isCorrect: false, order: 2 },
          { label: "<header>", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "En Flexbox, la propriété `justify-content` contrôle l'alignement des éléments le long de l'axe principal.",
        true,
        "`justify-content` agit sur l'axe principal, tandis que `align-items` agit sur l'axe secondaire."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quelle propriété CSS permet de définir l'espace intérieur d'un élément, entre son contenu et sa bordure ?",
        explanation: "`padding` définit l'espace intérieur ; `margin` définit l'espace extérieur.",
        answers: [
          { label: "padding", isCorrect: true, order: 0 },
          { label: "margin", isCorrect: false, order: 1 },
          { label: "border", isCorrect: false, order: 2 },
          { label: "gap", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Quel attribut HTML permet de fournir un texte alternatif pour une image (accessibilité, SEO) ?",
        explanation: "L'attribut `alt` décrit l'image pour les lecteurs d'écran et s'affiche si l'image ne charge pas.",
        answers: [
          { label: "alt", isCorrect: true, order: 0 },
          { label: "title", isCorrect: false, order: 1 },
          { label: "src", isCorrect: false, order: 2 },
          { label: "label", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "Les sélecteurs CSS de classe commencent par un point (`.`) et les sélecteurs d'identifiant par un dièse (`#`).",
        true,
        "Exemple : `.carte { ... }` cible tous les éléments avec `class=\"carte\"`, `#header { ... }` cible l'élément avec `id=\"header\"`."
      ),
    ],
  },
  {
    moduleSlug: "javascript-fondamentaux",
    title: "Examen final — JavaScript Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quel mot-clé déclare une variable dont la référence ne peut pas être réassignée ?",
        explanation: "`const` empêche la réaffectation de la variable (le contenu d'un objet/tableau reste modifiable).",
        answers: [
          { label: "const", isCorrect: true, order: 0 },
          { label: "let", isCorrect: false, order: 1 },
          { label: "var", isCorrect: false, order: 2 },
          { label: "static", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "L'opérateur `===` compare la valeur et le type, sans conversion implicite.",
        true,
        "`===` est l'égalité stricte : `1 === '1'` vaut `false`, contrairement à `1 == '1'` qui vaut `true`."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quelle méthode de tableau permet de créer un nouveau tableau en transformant chaque élément ?",
        explanation: "`map()` retourne un nouveau tableau avec le résultat de la fonction appliquée à chaque élément.",
        answers: [
          { label: "map()", isCorrect: true, order: 0 },
          { label: "forEach()", isCorrect: false, order: 1 },
          { label: "reduce()", isCorrect: false, order: 2 },
          { label: "filter()", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Que retourne `typeof []` (un tableau vide) ?",
        explanation: "En JavaScript, les tableaux sont des objets : `typeof []` vaut `'object'` (utilisez `Array.isArray()` pour distinguer un tableau).",
        answers: [
          { label: "'object'", isCorrect: true, order: 0 },
          { label: "'array'", isCorrect: false, order: 1 },
          { label: "'undefined'", isCorrect: false, order: 2 },
          { label: "'list'", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "Une fonction déclarée avec `function` est \"hoistée\" (sa déclaration est remontée) et peut être appelée avant sa définition dans le code.",
        true,
        "Contrairement aux fonctions fléchées assignées à `const`/`let`, les déclarations `function` classiques sont hoistées entièrement."
      ),
    ],
  },
  {
    moduleSlug: "git-github-fondamentaux",
    title: "Examen final — Git & GitHub Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quelle commande enregistre les modifications indexées dans l'historique du dépôt ?",
        explanation: "`git commit` crée un nouveau commit à partir des fichiers présents dans la zone de staging (`git add`).",
        answers: [
          { label: "git commit", isCorrect: true, order: 0 },
          { label: "git push", isCorrect: false, order: 1 },
          { label: "git add", isCorrect: false, order: 2 },
          { label: "git fetch", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "`git pull` est équivalent à `git fetch` suivi de `git merge`.",
        true,
        "`git pull` récupère les changements distants (`fetch`) puis les fusionne dans la branche locale (`merge`)."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quelle commande crée une nouvelle branche et bascule dessus immédiatement ?",
        explanation: "`git checkout -b nom-branche` (ou `git switch -c nom-branche`) crée et change de branche en une seule commande.",
        answers: [
          { label: "git checkout -b nom-branche", isCorrect: true, order: 0 },
          { label: "git branch nom-branche", isCorrect: false, order: 1 },
          { label: "git merge nom-branche", isCorrect: false, order: 2 },
          { label: "git clone nom-branche", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Sur GitHub, quel mécanisme permet de proposer des modifications en vue de les fusionner dans une branche cible, avec discussion et revue de code ?",
        explanation: "Une Pull Request (ou Merge Request) permet de proposer, discuter et faire relire des changements avant de les fusionner.",
        answers: [
          { label: "Une Pull Request", isCorrect: true, order: 0 },
          { label: "Un Issue", isCorrect: false, order: 1 },
          { label: "Un Fork", isCorrect: false, order: 2 },
          { label: "Un Gist", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "Le fichier `.gitignore` permet d'indiquer à Git les fichiers et dossiers à ne pas suivre (ex : `node_modules/`, `.env`).",
        true,
        "Les motifs listés dans `.gitignore` sont ignorés par `git status` et `git add`, évitant de versionner des fichiers générés ou sensibles."
      ),
    ],
  },
  {
    moduleSlug: "linux-fondamentaux",
    title: "Examen final — Linux Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quelle commande affiche le répertoire de travail courant ?",
        explanation: "`pwd` (print working directory) affiche le chemin absolu du répertoire courant.",
        answers: [
          { label: "pwd", isCorrect: true, order: 0 },
          { label: "ls", isCorrect: false, order: 1 },
          { label: "cd", isCorrect: false, order: 2 },
          { label: "whoami", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "La commande `grep` permet de rechercher du texte correspondant à un motif dans des fichiers.",
        true,
        "`grep \"motif\" fichier` affiche les lignes du fichier contenant le motif recherché."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quelle commande supprime récursivement un dossier et son contenu ?",
        explanation: "`rm -r dossier` supprime un dossier et tout son contenu de manière récursive.",
        answers: [
          { label: "rm -r dossier", isCorrect: true, order: 0 },
          { label: "rmdir dossier", isCorrect: false, order: 1 },
          { label: "del dossier", isCorrect: false, order: 2 },
          { label: "mv dossier", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Que fait l'opérateur `>>` dans `echo \"texte\" >> fichier.txt` ?",
        explanation: "`>>` ajoute (append) le texte à la fin du fichier sans écraser son contenu existant, contrairement à `>` qui écrase le fichier.",
        answers: [
          { label: "Ajoute le texte à la fin du fichier", isCorrect: true, order: 0 },
          { label: "Écrase le fichier avec le texte", isCorrect: false, order: 1 },
          { label: "Affiche le contenu du fichier", isCorrect: false, order: 2 },
          { label: "Renomme le fichier", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "Sous Linux, les permissions d'un fichier peuvent être modifiées avec la commande `chmod`.",
        true,
        "`chmod` modifie les droits de lecture/écriture/exécution pour le propriétaire, le groupe et les autres utilisateurs."
      ),
    ],
  },
  {
    moduleSlug: "sql-fondamentaux",
    title: "Examen final — SQL Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quelle clause SQL permet de filtrer les lignes retournées par une requête ?",
        explanation: "`WHERE` filtre les lignes individuelles avant tout regroupement, contrairement à `HAVING` qui filtre après un `GROUP BY`.",
        answers: [
          { label: "WHERE", isCorrect: true, order: 0 },
          { label: "ORDER BY", isCorrect: false, order: 1 },
          { label: "GROUP BY", isCorrect: false, order: 2 },
          { label: "SELECT", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "Un `INNER JOIN` ne retourne que les lignes ayant une correspondance dans les deux tables jointes.",
        true,
        "Contrairement à `LEFT JOIN`, qui conserve toutes les lignes de la table de gauche même sans correspondance, `INNER JOIN` exclut les lignes sans correspondance."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quelle fonction SQL permet de compter le nombre de lignes d'un résultat ?",
        explanation: "`COUNT(*)` retourne le nombre de lignes correspondant à la requête.",
        answers: [
          { label: "COUNT()", isCorrect: true, order: 0 },
          { label: "SUM()", isCorrect: false, order: 1 },
          { label: "TOTAL()", isCorrect: false, order: 2 },
          { label: "LENGTH()", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Quelle instruction permet de modifier des lignes existantes dans une table ?",
        explanation: "`UPDATE table SET colonne = valeur WHERE condition` modifie les lignes correspondant à la condition.",
        answers: [
          { label: "UPDATE", isCorrect: true, order: 0 },
          { label: "INSERT", isCorrect: false, order: 1 },
          { label: "ALTER", isCorrect: false, order: 2 },
          { label: "CREATE", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "Utiliser des requêtes paramétrées (placeholders) protège contre les injections SQL.",
        true,
        "Les requêtes paramétrées séparent le code SQL des données fournies par l'utilisateur, empêchant l'injection de SQL malveillant."
      ),
    ],
  },
  {
    moduleSlug: "react-fondamentaux",
    title: "Examen final — React Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Quel hook React permet d'ajouter un état local à un composant fonction ?",
        explanation: "`useState` retourne une paire [valeur, fonction de mise à jour] pour gérer un état local.",
        answers: [
          { label: "useState", isCorrect: true, order: 0 },
          { label: "useEffect", isCorrect: false, order: 1 },
          { label: "useContext", isCorrect: false, order: 2 },
          { label: "useRef", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "Les props (propriétés) d'un composant React sont en lecture seule depuis ce composant.",
        true,
        "Un composant ne doit jamais modifier directement ses props ; pour des données mutables, on utilise l'état local (`useState`)."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quel hook permet d'exécuter du code en réaction au montage d'un composant ou au changement de certaines valeurs ?",
        explanation: "`useEffect(fn, deps)` exécute `fn` après le rendu, et à nouveau si une dépendance de `deps` change.",
        answers: [
          { label: "useEffect", isCorrect: true, order: 0 },
          { label: "useMemo", isCorrect: false, order: 1 },
          { label: "useCallback", isCorrect: false, order: 2 },
          { label: "useReducer", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Dans une liste rendue avec `.map()`, à quoi sert la prop spéciale `key` ?",
        explanation: "`key` aide React à identifier quels éléments ont changé, été ajoutés ou supprimés, pour optimiser le rendu.",
        answers: [
          { label: "Aider React à identifier les éléments de la liste", isCorrect: true, order: 0 },
          { label: "Définir le style CSS de l'élément", isCorrect: false, order: 1 },
          { label: "Trier automatiquement la liste", isCorrect: false, order: 2 },
          { label: "Déclencher un appel réseau", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "JSX permet d'écrire des éléments ressemblant à du HTML directement dans du code JavaScript.",
        true,
        "JSX est une extension de syntaxe compilée en appels à `React.createElement` (ou équivalent)."
      ),
    ],
  },
  {
    moduleSlug: "node-express-fondamentaux",
    title: "Examen final — Node.js & Express Fondamentaux",
    passingScore: 70,
    timeLimitSeconds: 600,
    questions: [
      {
        order: 1,
        type: "MCQ",
        prompt: "Dans Express, quelle méthode permet de définir une route répondant aux requêtes GET ?",
        explanation: "`app.get(chemin, handler)` enregistre une route pour les requêtes HTTP GET sur ce chemin.",
        answers: [
          { label: "app.get()", isCorrect: true, order: 0 },
          { label: "app.use()", isCorrect: false, order: 1 },
          { label: "app.listen()", isCorrect: false, order: 2 },
          { label: "app.set()", isCorrect: false, order: 3 },
        ],
      },
      tf(
        2,
        "Un middleware Express peut intercepter une requête, exécuter du code, puis appeler `next()` pour passer au middleware suivant.",
        true,
        "Les middlewares forment une chaîne : chacun reçoit `(req, res, next)` et décide de continuer (`next()`) ou de répondre directement."
      ),
      {
        order: 3,
        type: "MCQ",
        prompt: "Quel code de statut HTTP indique qu'une ressource a été créée avec succès ?",
        explanation: "`201 Created` est retourné après la création réussie d'une ressource (souvent en réponse à un POST).",
        answers: [
          { label: "201", isCorrect: true, order: 0 },
          { label: "200", isCorrect: false, order: 1 },
          { label: "204", isCorrect: false, order: 2 },
          { label: "301", isCorrect: false, order: 3 },
        ],
      },
      {
        order: 4,
        type: "MCQ",
        prompt: "Quel algorithme est recommandé pour le hachage de mots de passe avant stockage en base de données ?",
        explanation: "Argon2id (ou bcrypt) est conçu pour être lent et résistant aux attaques par force brute, contrairement à MD5 ou SHA-1.",
        answers: [
          { label: "Argon2id", isCorrect: true, order: 0 },
          { label: "MD5", isCorrect: false, order: 1 },
          { label: "Base64", isCorrect: false, order: 2 },
          { label: "SHA-1", isCorrect: false, order: 3 },
        ],
      },
      tf(
        5,
        "La limitation de débit (rate limiting) sur les routes d'authentification aide à se protéger contre les attaques par force brute.",
        true,
        "En limitant le nombre de tentatives par fenêtre de temps, on ralentit considérablement les attaques automatisées de devinette de mot de passe."
      ),
    ],
  },
];

export async function seedExams(prisma: PrismaClient) {
  for (const examSeed of EXAMS) {
    const module = await prisma.module.findUnique({ where: { slug: examSeed.moduleSlug } });
    if (!module) {
      console.warn(`Module introuvable pour l'examen : ${examSeed.moduleSlug}`);
      continue;
    }

    const existing = await prisma.exam.findUnique({ where: { moduleId: module.id } });
    if (existing) continue;

    await prisma.exam.create({
      data: {
        moduleId: module.id,
        title: examSeed.title,
        passingScore: examSeed.passingScore,
        timeLimitSeconds: examSeed.timeLimitSeconds,
        questions: {
          create: examSeed.questions.map((q) => ({
            order: q.order,
            type: q.type,
            prompt: q.prompt,
            explanation: q.explanation,
            answers: { create: q.answers },
          })),
        },
      },
    });
    console.log(`Examen créé pour le module : ${examSeed.moduleSlug}`);
  }
}
