import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { seedExams } from "./seed-exams";

const prisma = new PrismaClient();

async function main() {
  await prisma.badge.upsert({
    where: { code: "FIRST_LESSON_COMPLETED" },
    create: {
      code: "FIRST_LESSON_COMPLETED",
      title: "Premier pas",
      description: "Vous avez terminé votre première leçon.",
      icon: "footprints",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "FIRST_QUIZ_PASSED" },
    create: {
      code: "FIRST_QUIZ_PASSED",
      title: "Quiz réussi",
      description: "Vous avez réussi votre premier quiz.",
      icon: "trophy",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_HTML_CSS" },
    create: {
      code: "MODULE_COMPLETED_HTML_CSS",
      title: "Bases du Web maîtrisées",
      description: "Vous avez terminé le module HTML5 & CSS3 — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_JAVASCRIPT" },
    create: {
      code: "MODULE_COMPLETED_JAVASCRIPT",
      title: "Développeur JavaScript",
      description: "Vous avez terminé le module JavaScript — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_GIT" },
    create: {
      code: "MODULE_COMPLETED_GIT",
      title: "Maître du versioning",
      description: "Vous avez terminé le module Git & GitHub — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_LINUX" },
    create: {
      code: "MODULE_COMPLETED_LINUX",
      title: "Pro du terminal",
      description: "Vous avez terminé le module Linux — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_SQL" },
    create: {
      code: "MODULE_COMPLETED_SQL",
      title: "Expert des bases de données",
      description: "Vous avez terminé le module SQL — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_REACT" },
    create: {
      code: "MODULE_COMPLETED_REACT",
      title: "Développeur React",
      description: "Vous avez terminé le module React — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  await prisma.badge.upsert({
    where: { code: "MODULE_COMPLETED_NODE" },
    create: {
      code: "MODULE_COMPLETED_NODE",
      title: "Développeur backend",
      description: "Vous avez terminé le module Node.js & Express — Fondamentaux.",
      icon: "award",
    },
    update: {},
  });

  const existingModule = await prisma.module.findUnique({ where: { slug: "html-css-fondamentaux" } });
  if (!existingModule) {
    await prisma.module.create({
      data: {
        slug: "html-css-fondamentaux",
        title: "HTML5 & CSS3 — Fondamentaux",
        description:
          "Apprenez à structurer une page web avec HTML5 sémantique et à la styliser avec CSS3 : sélecteurs, boîte de modèle, Flexbox et responsive design.",
        category: "Front-end",
        order: 1,
        estimatedMinutes: 180,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_HTML_CSS",
        chapters: {
          create: [
            {
              slug: "structure-html",
              title: "Structurer une page avec HTML5",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Le squelette d'un document HTML",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Le squelette d'un document HTML

Tout document HTML5 commence par une structure de base :

\`\`\`html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ma page</title>
  </head>
  <body>
    <h1>Bonjour le monde</h1>
  </body>
</html>
\`\`\`

## Points clés
- \`<!DOCTYPE html>\` indique au navigateur d'utiliser le mode HTML5.
- \`lang="fr"\` améliore l'accessibilité (lecteurs d'écran) et le SEO.
- La balise \`<meta viewport>\` est indispensable pour un site responsive.
- Tout le contenu visible se trouve dans \`<body>\`.

## Bonnes pratiques de sécurité
- Toujours déclarer \`<meta charset="UTF-8" />\` en premier pour éviter les
  failles liées à l'encodage (certaines attaques XSS exploitent un
  encodage mal détecté).
- Ne jamais faire confiance à un contenu HTML généré dynamiquement sans
  l'échapper (voir le module Cybersécurité).
`,
                  },
                  {
                    title: "Les balises sémantiques",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Les balises sémantiques HTML5

HTML5 introduit des balises qui décrivent le **rôle** du contenu, pas
seulement son apparence.

| Balise | Rôle |
|---|---|
| \`<header>\` | en-tête de page ou de section |
| \`<nav>\` | bloc de navigation |
| \`<main>\` | contenu principal (un seul par page) |
| \`<article>\` | contenu autonome (article de blog, carte produit) |
| \`<section>\` | regroupement thématique |
| \`<aside>\` | contenu complémentaire (barre latérale) |
| \`<footer>\` | pied de page |

## Pourquoi c'est important
- **Accessibilité** : les lecteurs d'écran utilisent ces balises pour
  naviguer rapidement.
- **SEO** : les moteurs de recherche comprennent mieux la structure.
- **Maintenabilité** : le code est plus lisible que des \`<div>\` partout.

## Exemple

\`\`\`html
<body>
  <header>
    <h1>Mon Blog</h1>
    <nav>...</nav>
  </header>
  <main>
    <article>
      <h2>Mon premier article</h2>
      <p>Contenu...</p>
    </article>
  </main>
  <footer>© 2026</footer>
</body>
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Structure HTML",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle balise doit obligatoirement être unique dans le <body> d'une page HTML5 ?",
                          explanation:
                            "<main> représente le contenu principal de la page et ne doit apparaître qu'une seule fois, contrairement à <section> ou <article> qui peuvent se répéter.",
                          answers: {
                            create: [
                              { label: "<main>", isCorrect: true, order: 1 },
                              { label: "<section>", isCorrect: false, order: 2 },
                              { label: "<article>", isCorrect: false, order: 3 },
                              { label: "<div>", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "La balise <meta charset=\"UTF-8\" /> doit être placée en tout premier dans <head>.",
                          explanation:
                            "C'est une bonne pratique recommandée par les standards HTML5 : la déclaration de l'encodage doit apparaître le plus tôt possible pour que le navigateur interprète correctement le reste du document.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "MCQ",
                          prompt: "Quelle balise utiliser pour un bloc de navigation principal ?",
                          explanation:
                            "<nav> est la balise sémantique dédiée aux blocs de liens de navigation (menu principal, fil d'Ariane, etc.).",
                          answers: {
                            create: [
                              { label: "<navigation>", isCorrect: false, order: 1 },
                              { label: "<nav>", isCorrect: true, order: 2 },
                              { label: "<menu-bar>", isCorrect: false, order: 3 },
                              { label: "<aside>", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "css-bases-flexbox",
              title: "CSS3 : sélecteurs, boîte de modèle et Flexbox",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Le modèle de boîte (Box Model)",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Le modèle de boîte CSS

Chaque élément HTML est représenté comme une boîte rectangulaire composée de
quatre couches, de l'intérieur vers l'extérieur :

1. **content** — le contenu (texte, image...)
2. **padding** — l'espace intérieur entre le contenu et la bordure
3. **border** — la bordure de l'élément
4. **margin** — l'espace extérieur entre cet élément et les autres

\`\`\`css
.carte {
  width: 300px;
  padding: 16px;
  border: 1px solid #ccc;
  margin: 24px;
  box-sizing: border-box;
}
\`\`\`

## \`box-sizing: border-box\`
Par défaut, \`width\`/\`height\` ne s'appliquent qu'au contenu : le padding et
la bordure s'ajoutent par-dessus, ce qui complique les calculs. En mettant
\`box-sizing: border-box\`, la largeur totale (contenu + padding + bordure)
correspond exactement à la valeur de \`width\`. C'est pourquoi la plupart des
projets appliquent :

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`
`,
                  },
                  {
                    title: "Mise en page avec Flexbox",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Flexbox

Flexbox est un système de mise en page unidimensionnel (ligne OU colonne)
très utilisé pour aligner et répartir des éléments.

\`\`\`css
.conteneur {
  display: flex;
  justify-content: space-between; /* axe principal */
  align-items: center;            /* axe secondaire */
  gap: 16px;
}
\`\`\`

## Propriétés essentielles
- \`flex-direction\` : \`row\` (par défaut) ou \`column\`
- \`justify-content\` : alignement sur l'axe principal
  (\`flex-start\`, \`center\`, \`space-between\`, \`space-around\`)
- \`align-items\` : alignement sur l'axe secondaire
  (\`stretch\`, \`center\`, \`flex-start\`, \`flex-end\`)
- \`flex-wrap: wrap\` : permet aux éléments de passer à la ligne

## Exemple : barre de navigation responsive

\`\`\`css
nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}
\`\`\`

Flexbox est la base de la plupart des mises en page modernes avant
d'introduire CSS Grid pour des structures bidimensionnelles plus complexes.
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — CSS & Flexbox",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Avec box-sizing: border-box, que comprend la propriété width ?",
                          explanation:
                            "border-box inclut le padding et la bordure dans la largeur définie : width = contenu + padding + bordure.",
                          answers: {
                            create: [
                              { label: "Uniquement le contenu", isCorrect: false, order: 1 },
                              { label: "Le contenu et le padding uniquement", isCorrect: false, order: 2 },
                              { label: "Le contenu, le padding et la bordure", isCorrect: true, order: 3 },
                              { label: "Le contenu, le padding, la bordure et la marge", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "MCQ",
                          prompt: "Quelle propriété CSS active Flexbox sur un conteneur ?",
                          explanation: "display: flex; transforme l'élément en conteneur flex pour ses enfants directs.",
                          answers: {
                            create: [
                              { label: "display: flex;", isCorrect: true, order: 1 },
                              { label: "position: flex;", isCorrect: false, order: 2 },
                              { label: "flex: container;", isCorrect: false, order: 3 },
                              { label: "layout: flex;", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "TRUE_FALSE",
                          prompt: "justify-content contrôle toujours l'alignement vertical, quel que soit flex-direction.",
                          explanation:
                            "Faux : justify-content agit sur l'axe principal, qui dépend de flex-direction (horizontal pour 'row', vertical pour 'column'). align-items agit sur l'axe secondaire.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  } else if (!existingModule.completionBadgeCode) {
    await prisma.module.update({
      where: { id: existingModule.id },
      data: { completionBadgeCode: "MODULE_COMPLETED_HTML_CSS" },
    });
  }

  const existingJsModule = await prisma.module.findUnique({ where: { slug: "javascript-fondamentaux" } });
  if (!existingJsModule) {
    await prisma.module.create({
      data: {
        slug: "javascript-fondamentaux",
        title: "JavaScript — Fondamentaux",
        description:
          "Maîtrisez les bases de JavaScript : variables, types, opérateurs, fonctions, conditions et boucles, pour donner vie à vos pages web.",
        category: "Front-end",
        order: 2,
        estimatedMinutes: 240,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_JAVASCRIPT",
        chapters: {
          create: [
            {
              slug: "variables-types-operateurs",
              title: "Variables, types et opérateurs",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Déclarer des variables avec let et const",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Déclarer des variables

JavaScript moderne propose deux mots-clés pour déclarer des variables :
\`let\` et \`const\`. L'ancien mot-clé \`var\` est aujourd'hui déconseillé.

\`\`\`js
let score = 10;
score = 15; // OK : let permet la réassignation

const PI = 3.14;
PI = 3.15; // Erreur : impossible de réassigner une const
\`\`\`

## Quand utiliser quoi ?
- **\`const\`** par défaut : la variable ne sera jamais réassignée. Cela rend
  le code plus prévisible et évite des bugs.
- **\`let\`** uniquement si la valeur doit changer (compteur, accumulateur...).
- **\`var\`** : à éviter — sa portée de fonction (et non de bloc) est source
  de bugs subtils.

## Portée de bloc
\`let\` et \`const\` sont limités au bloc \`{ ... }\` dans lequel ils sont
déclarés :

\`\`\`js
if (true) {
  let message = "bonjour";
}
console.log(message); // ReferenceError : message n'existe pas ici
\`\`\`
`,
                  },
                  {
                    title: "Types de données et opérateurs",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Types de données et opérateurs

## Types primitifs
- \`number\` : \`42\`, \`3.14\`
- \`string\` : \`"bonjour"\`, \`'salut'\`
- \`boolean\` : \`true\`, \`false\`
- \`undefined\` : variable déclarée sans valeur
- \`null\` : absence volontaire de valeur
- \`object\` : tableaux, objets, fonctions...

## Opérateurs de comparaison

\`\`\`js
5 == "5"   // true  (compare après conversion de type)
5 === "5"  // false (compare aussi le type)
5 !== "5"  // true
\`\`\`

## Bonne pratique de sécurité et de fiabilité
Toujours utiliser \`===\` et \`!==\` (égalité stricte). L'égalité non stricte
\`==\` effectue des conversions de type implicites qui peuvent provoquer des
bugs difficiles à détecter (et parfois des failles de logique métier).

## Opérateurs logiques
- \`&&\` (ET), \`||\` (OU), \`!\` (NON)

\`\`\`js
const estMajeur = age >= 18 && possedeCarteIdentite;
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Variables et types",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quel mot-clé utiliser par défaut pour déclarer une variable qui ne sera jamais réassignée ?",
                          explanation:
                            "const indique clairement l'intention que la variable ne sera pas réassignée, ce qui rend le code plus sûr et plus lisible.",
                          answers: {
                            create: [
                              { label: "var", isCorrect: false, order: 1 },
                              { label: "let", isCorrect: false, order: 2 },
                              { label: "const", isCorrect: true, order: 3 },
                              { label: "static", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "L'opérateur === compare la valeur ET le type, sans conversion implicite.",
                          explanation:
                            "Vrai : === (égalité stricte) ne convertit pas les types avant de comparer, contrairement à ==.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez le code pour déclarer une constante PI valant 3.14 :\n\n```js\n___ PI = 3.14;\n```",
                          explanation: "On utilise const pour une valeur qui ne sera jamais réassignée.",
                          answers: {
                            create: [{ label: "const", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "fonctions-et-controle",
              title: "Fonctions et structures de contrôle",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Déclarer et utiliser des fonctions",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Fonctions

Une fonction regroupe un bloc de code réutilisable.

\`\`\`js
function additionner(a, b) {
  return a + b;
}

// Fonction fléchée (arrow function)
const multiplier = (a, b) => a * b;

console.log(additionner(2, 3)); // 5
console.log(multiplier(2, 3));  // 6
\`\`\`

## Fonctions fléchées vs fonctions classiques
- Les fonctions fléchées n'ont **pas leur propre \`this\`** : elles héritent
  du \`this\` du contexte englobant. Elles sont idéales pour les callbacks
  courts.
- Les fonctions classiques (\`function\`) définissent leur propre \`this\`,
  utile pour les méthodes d'objet.

## Paramètres par défaut

\`\`\`js
function saluer(nom = "visiteur") {
  return \`Bonjour \${nom} !\`;
}
saluer();        // "Bonjour visiteur !"
saluer("Alice"); // "Bonjour Alice !"
\`\`\`
`,
                  },
                  {
                    title: "Conditions et boucles",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Conditions et boucles

## Conditions

\`\`\`js
if (note >= 10) {
  console.log("Admis");
} else if (note >= 8) {
  console.log("Rattrapage");
} else {
  console.log("Recalé");
}
\`\`\`

## Boucle for

\`\`\`js
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

## Boucle while

\`\`\`js
let energie = 100;
while (energie > 0) {
  energie -= 10;
}
\`\`\`

## Boucle for...of (parcourir un tableau)

\`\`\`js
const fruits = ["pomme", "banane", "kiwi"];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## Bonne pratique
Préférez \`for...of\` ou les méthodes de tableau (\`map\`, \`filter\`,
\`forEach\`) à la boucle \`for\` classique pour parcourir des collections :
le code est plus lisible et moins sujet aux erreurs d'index.
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Fonctions et contrôle de flux",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle structure exécute un bloc de code tant qu'une condition reste vraie ?",
                          explanation:
                            "while (condition) { ... } répète le bloc tant que la condition est évaluée à true.",
                          answers: {
                            create: [
                              { label: "if", isCorrect: false, order: 1 },
                              { label: "while", isCorrect: true, order: 2 },
                              { label: "switch", isCorrect: false, order: 3 },
                              { label: "function", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Une fonction fléchée (arrow function) possède son propre this.",
                          explanation:
                            "Faux : une fonction fléchée hérite du this du contexte englobant, elle n'a pas son propre this.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la condition pour vérifier l'égalité stricte entre a et b :\n\n```js\nif (a ___ b) {\n  console.log('égaux');\n}\n```",
                          explanation: "=== est l'opérateur d'égalité stricte (valeur et type).",
                          answers: {
                            create: [{ label: "===", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingGitModule = await prisma.module.findUnique({ where: { slug: "git-github-fondamentaux" } });
  if (!existingGitModule) {
    await prisma.module.create({
      data: {
        slug: "git-github-fondamentaux",
        title: "Git & GitHub — Fondamentaux",
        description:
          "Apprenez à versionner votre code avec Git et à collaborer efficacement sur GitHub : commits, branches, fusions et pull requests.",
        category: "Outils",
        order: 3,
        estimatedMinutes: 180,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_GIT",
        chapters: {
          create: [
            {
              slug: "bases-de-git",
              title: "Bases de Git",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Initialiser un dépôt et faire des commits",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Initialiser un dépôt et faire des commits

Git est un système de contrôle de version : il enregistre l'historique des
modifications de votre code sous forme de **commits**.

## Initialiser un dépôt

\`\`\`bash
git init
\`\`\`

Cette commande crée un dossier caché \`.git\` qui contiendra tout
l'historique du projet.

## Le cycle de base

\`\`\`bash
git status          # voir l'état des fichiers
git add fichier.js  # préparer un fichier (staging)
git commit -m "Ajoute la fonction de connexion"
\`\`\`

## Bonnes pratiques de messages de commit
- Un commit = un changement logique cohérent.
- Message court à l'impératif : "Corrige le bug X", "Ajoute la page Y".
- Évite les commits du type "wip" ou "fix" sans contexte.

## Ne jamais committer de secrets
Ne committez jamais de mots de passe, clés API ou fichiers \`.env\` —
utilisez un fichier \`.gitignore\` pour les exclure du suivi.
`,
                  },
                  {
                    title: "Comprendre l'arbre Git (working directory, staging, repo)",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Working directory, staging area et dépôt

Git organise vos fichiers en trois zones :

1. **Working directory** : vos fichiers tels que vous les modifiez.
2. **Staging area (index)** : les modifications préparées avec
   \`git add\`, prêtes à être committées.
3. **Repository (.git)** : l'historique des commits enregistrés.

\`\`\`
working directory  --git add-->  staging area  --git commit-->  repo
\`\`\`

## Commandes utiles

\`\`\`bash
git diff           # différences non indexées
git diff --staged  # différences indexées (prêtes pour le commit)
git log            # historique des commits
git log --oneline  # historique condensé
\`\`\`

## Annuler des modifications

\`\`\`bash
git restore fichier.js          # annule les modifs non indexées
git restore --staged fichier.js # retire un fichier du staging
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Bases de Git",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle commande prépare un fichier pour le prochain commit (staging) ?",
                          explanation: "git add ajoute les modifications d'un fichier à la staging area.",
                          answers: {
                            create: [
                              { label: "git commit", isCorrect: false, order: 1 },
                              { label: "git add", isCorrect: true, order: 2 },
                              { label: "git push", isCorrect: false, order: 3 },
                              { label: "git init", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Il est recommandé de committer ses fichiers .env contenant des secrets pour ne pas les perdre.",
                          explanation:
                            "Faux : les secrets ne doivent jamais être committés. Utilisez .gitignore et un gestionnaire de secrets dédié.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la commande pour enregistrer les modifications indexées avec un message :\n\n```bash\ngit ___ -m \"Ajoute la page de profil\"\n```",
                          explanation: "git commit -m \"...\" enregistre un nouveau commit avec le message fourni.",
                          answers: {
                            create: [{ label: "commit", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "travailler-avec-github",
              title: "Travailler avec GitHub",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Branches et fusion (merge)",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Branches et fusion

Une **branche** permet de développer une fonctionnalité sans perturber le
code principal (souvent appelé \`main\`).

## Créer et changer de branche

\`\`\`bash
git branch feature/login        # créer une branche
git checkout feature/login       # basculer dessus
# ou en une seule commande :
git checkout -b feature/login
\`\`\`

## Fusionner une branche

\`\`\`bash
git checkout main
git merge feature/login
\`\`\`

## Conflits de fusion
Un conflit survient quand deux branches modifient la même ligne d'un
fichier. Git marque les zones en conflit avec \`<<<<<<<\`, \`=======\`,
\`>>>>>>>\` : il faut les résoudre manuellement, puis committer.

## Bonne pratique
Travaillez toujours sur une branche dédiée par fonctionnalité ou correctif,
jamais directement sur \`main\` dans un projet collaboratif.
`,
                  },
                  {
                    title: "Pull requests et collaboration",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Pull requests et collaboration sur GitHub

## Pousser une branche vers GitHub

\`\`\`bash
git push origin feature/login
\`\`\`

## Ouvrir une Pull Request (PR)
Une PR propose de fusionner votre branche dans \`main\`. Elle permet :
- la **revue de code** par d'autres développeurs ;
- l'exécution automatique des tests (CI) ;
- une discussion sur les changements avant fusion.

## Synchroniser son dépôt local

\`\`\`bash
git pull origin main   # récupère et fusionne les derniers changements
git fetch origin        # récupère sans fusionner
\`\`\`

## Bonnes pratiques de collaboration
- Garder les PR petites et focalisées sur un seul sujet.
- Décrire clairement le **pourquoi** du changement, pas seulement le quoi.
- Ne jamais forcer un push (\`git push --force\`) sur une branche partagée
  sans prévenir l'équipe : cela peut écraser le travail des autres.
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — GitHub et collaboration",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle commande envoie vos commits locaux vers une branche distante sur GitHub ?",
                          explanation: "git push origin <branche> envoie les commits locaux vers le dépôt distant.",
                          answers: {
                            create: [
                              { label: "git pull", isCorrect: false, order: 1 },
                              { label: "git fetch", isCorrect: false, order: 2 },
                              { label: "git push", isCorrect: true, order: 3 },
                              { label: "git clone", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Une Pull Request permet de faire relire son code avant de le fusionner dans la branche principale.",
                          explanation: "Vrai : c'est l'un des principaux objectifs des PR, avec l'exécution de la CI.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la commande pour créer une nouvelle branche nommée feature/login et basculer dessus en une seule commande :\n\n```bash\ngit checkout ___ feature/login\n```",
                          explanation: "L'option -b crée la branche puis bascule directement dessus.",
                          answers: {
                            create: [{ label: "-b", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingLinuxModule = await prisma.module.findUnique({ where: { slug: "linux-fondamentaux" } });
  if (!existingLinuxModule) {
    await prisma.module.create({
      data: {
        slug: "linux-fondamentaux",
        title: "Linux — Fondamentaux",
        description:
          "Apprenez à utiliser le terminal Linux : navigation, gestion des fichiers, permissions et processus, des compétences indispensables pour tout développeur.",
        category: "Outils",
        order: 4,
        estimatedMinutes: 180,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_LINUX",
        chapters: {
          create: [
            {
              slug: "navigation-et-fichiers",
              title: "Navigation et fichiers",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Naviguer dans l'arborescence (cd, ls, pwd)",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Naviguer dans l'arborescence

Le terminal permet d'explorer et de manipuler le système de fichiers via
des commandes textuelles.

## Commandes de base

\`\`\`bash
pwd          # affiche le dossier courant (print working directory)
ls           # liste le contenu du dossier courant
ls -la       # liste détaillée, y compris les fichiers cachés
cd dossier   # se déplacer dans "dossier"
cd ..        # remonter d'un niveau
cd ~         # revenir au dossier personnel (home)
\`\`\`

## Chemins absolus et relatifs
- Un chemin **absolu** commence par \`/\` (ex : \`/home/alice/projets\`).
- Un chemin **relatif** part du dossier courant (ex : \`./projets\` ou
  \`../autre-dossier\`).

## Astuce
La touche **Tab** complète automatiquement les noms de fichiers et
dossiers — un réflexe à prendre pour éviter les fautes de frappe.
`,
                  },
                  {
                    title: "Manipuler fichiers et dossiers (cp, mv, rm, mkdir)",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Manipuler fichiers et dossiers

\`\`\`bash
mkdir projet          # créer un dossier
touch index.js         # créer un fichier vide
cp source.txt copie.txt        # copier un fichier
mv ancien.txt nouveau.txt       # renommer / déplacer
rm fichier.txt          # supprimer un fichier
rm -r dossier/           # supprimer un dossier et son contenu
\`\`\`

## Attention avec rm -r
\`rm -r\` supprime **définitivement** un dossier et tout son contenu, sans
corbeille. Vérifiez toujours le chemin avant d'exécuter cette commande,
surtout avec \`sudo\` ou des chemins génériques comme \`*\`.

## Afficher le contenu d'un fichier

\`\`\`bash
cat fichier.txt    # afficher tout le contenu
head fichier.txt   # afficher les premières lignes
tail -f log.txt    # suivre un fichier en temps réel (logs)
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Navigation et fichiers",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle commande affiche le chemin du dossier courant ?",
                          explanation: "pwd (print working directory) affiche le chemin absolu du dossier courant.",
                          answers: {
                            create: [
                              { label: "ls", isCorrect: false, order: 1 },
                              { label: "cd", isCorrect: false, order: 2 },
                              { label: "pwd", isCorrect: true, order: 3 },
                              { label: "whoami", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "La commande rm -r supprime un dossier et son contenu vers une corbeille récupérable.",
                          explanation:
                            "Faux : rm -r supprime définitivement, sans corbeille. Il n'y a pas de récupération possible.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la commande pour créer un nouveau dossier nommé projet :\n\n```bash\n___ projet\n```",
                          explanation: "mkdir (make directory) crée un nouveau dossier.",
                          answers: {
                            create: [{ label: "mkdir", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "permissions-et-processus",
              title: "Permissions et processus",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Permissions et propriétaires (chmod, chown)",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Permissions et propriétaires

Chaque fichier Linux a un propriétaire, un groupe, et des permissions de
lecture (r), écriture (w) et exécution (x) pour trois catégories
d'utilisateurs : propriétaire, groupe, autres.

## Lire les permissions

\`\`\`bash
ls -l fichier.sh
# -rwxr-xr-- 1 alice devs 220 ... fichier.sh
\`\`\`
Ici : le propriétaire (alice) peut lire/écrire/exécuter, le groupe (devs)
peut lire/exécuter, les autres peuvent seulement lire.

## Modifier les permissions

\`\`\`bash
chmod +x script.sh      # rendre un fichier exécutable
chmod 644 fichier.txt   # rw- r-- r--
chmod 755 script.sh     # rwx r-x r-x
\`\`\`

## Changer le propriétaire

\`\`\`bash
chown alice:devs fichier.txt
\`\`\`

## Bonne pratique de sécurité
Évitez \`chmod 777\` (tous les droits pour tout le monde) : cela permet à
n'importe quel utilisateur du système de modifier ou exécuter le fichier,
ce qui est une faille de sécurité courante.
`,
                  },
                  {
                    title: "Processus et redirections (ps, grep, pipes)",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Processus et redirections

## Voir les processus en cours

\`\`\`bash
ps aux          # liste tous les processus
ps aux | grep node   # filtrer les processus contenant "node"
kill 1234        # arrêter le processus d'identifiant (PID) 1234
\`\`\`

## Le pipe |
Le symbole \`|\` envoie la sortie d'une commande comme entrée de la
suivante, permettant de chaîner des outils simples pour faire des
traitements complexes.

\`\`\`bash
cat access.log | grep "ERROR" | wc -l
# compte le nombre de lignes contenant "ERROR"
\`\`\`

## Redirections

\`\`\`bash
echo "log" > fichier.txt    # écrase le fichier avec "log"
echo "log2" >> fichier.txt   # ajoute "log2" à la fin du fichier
commande 2> erreurs.log       # redirige les erreurs (stderr) vers un fichier
\`\`\`

## grep
\`grep\` recherche un motif dans du texte :

\`\`\`bash
grep -i "erreur" fichier.log   # recherche insensible à la casse
grep -r "TODO" src/             # recherche récursive dans un dossier
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Permissions et processus",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle commande rend un fichier script.sh exécutable ?",
                          explanation: "chmod +x ajoute le droit d'exécution au fichier.",
                          answers: {
                            create: [
                              { label: "chown +x script.sh", isCorrect: false, order: 1 },
                              { label: "chmod +x script.sh", isCorrect: true, order: 2 },
                              { label: "exec script.sh", isCorrect: false, order: 3 },
                              { label: "run script.sh", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "chmod 777 sur un fichier est une bonne pratique de sécurité car cela évite les erreurs de permissions.",
                          explanation:
                            "Faux : chmod 777 donne tous les droits à tous les utilisateurs, ce qui est une mauvaise pratique de sécurité.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la commande pour compter le nombre de lignes contenant \"ERROR\" dans access.log :\n\n```bash\ncat access.log | grep \"ERROR\" | ___\n```",
                          explanation: "wc -l compte le nombre de lignes reçues en entrée.",
                          answers: {
                            create: [{ label: "wc -l", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingSqlModule = await prisma.module.findUnique({ where: { slug: "sql-fondamentaux" } });
  if (!existingSqlModule) {
    await prisma.module.create({
      data: {
        slug: "sql-fondamentaux",
        title: "SQL — Fondamentaux",
        description:
          "Apprenez à interroger des bases de données relationnelles : sélection, filtrage, tri, jointures et agrégations avec SQL.",
        category: "Données",
        order: 5,
        estimatedMinutes: 200,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_SQL",
        chapters: {
          create: [
            {
              slug: "requetes-de-base",
              title: "Requêtes de base",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Sélectionner des données avec SELECT",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Sélectionner des données avec SELECT

SQL (Structured Query Language) permet d'interroger des bases de données
relationnelles, organisées en tables (lignes et colonnes).

## La requête SELECT

\`\`\`sql
SELECT * FROM utilisateurs;
-- Sélectionne toutes les colonnes de la table utilisateurs

SELECT nom, email FROM utilisateurs;
-- Sélectionne uniquement les colonnes nom et email
\`\`\`

## Alias de colonnes

\`\`\`sql
SELECT nom AS nom_complet, email AS adresse_mail FROM utilisateurs;
\`\`\`

## DISTINCT
Pour éliminer les doublons :

\`\`\`sql
SELECT DISTINCT pays FROM utilisateurs;
\`\`\`

## Bonne pratique
Évitez \`SELECT *\` en production : précisez les colonnes nécessaires pour
limiter le volume de données transférées et clarifier l'intention de la
requête.
`,
                  },
                  {
                    title: "Filtrer et trier avec WHERE et ORDER BY",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Filtrer et trier

## WHERE : filtrer les lignes

\`\`\`sql
SELECT * FROM produits WHERE prix > 50;

SELECT * FROM produits WHERE categorie = 'Électronique' AND prix < 100;

SELECT * FROM utilisateurs WHERE email LIKE '%@gmail.com';
\`\`\`

## ORDER BY : trier les résultats

\`\`\`sql
SELECT * FROM produits ORDER BY prix ASC;   -- du moins cher au plus cher
SELECT * FROM produits ORDER BY prix DESC;  -- du plus cher au moins cher
\`\`\`

## LIMIT : limiter le nombre de résultats

\`\`\`sql
SELECT * FROM produits ORDER BY prix DESC LIMIT 5;  -- les 5 plus chers
\`\`\`

## Sécurité : injection SQL
N'insérez **jamais** des valeurs utilisateur directement dans une chaîne
SQL (\`"WHERE nom = '" + input + "'"\`). Utilisez toujours des **requêtes
paramétrées** (placeholders) pour éviter les injections SQL, l'une des
failles les plus critiques (OWASP Top 10).
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Requêtes de base",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle clause permet de filtrer les lignes retournées par une requête SELECT ?",
                          explanation: "WHERE filtre les lignes selon une condition.",
                          answers: {
                            create: [
                              { label: "ORDER BY", isCorrect: false, order: 1 },
                              { label: "WHERE", isCorrect: true, order: 2 },
                              { label: "GROUP BY", isCorrect: false, order: 3 },
                              { label: "LIMIT", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Insérer directement une valeur saisie par l'utilisateur dans une requête SQL est une bonne pratique de sécurité.",
                          explanation:
                            "Faux : cela expose à l'injection SQL. Il faut utiliser des requêtes paramétrées.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la requête pour récupérer les 5 produits les plus chers :\n\n```sql\nSELECT * FROM produits ORDER BY prix DESC ___ 5;\n```",
                          explanation: "LIMIT restreint le nombre de lignes retournées par la requête.",
                          answers: {
                            create: [{ label: "LIMIT", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "jointures-et-agregations",
              title: "Jointures et agrégations",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Jointures entre tables (JOIN)",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Jointures entre tables

Les bases relationnelles répartissent les données entre plusieurs tables
liées par des clés étrangères. Les jointures permettent de combiner ces
tables dans une même requête.

## INNER JOIN
Retourne uniquement les lignes ayant une correspondance dans les deux
tables.

\`\`\`sql
SELECT commandes.id, utilisateurs.nom
FROM commandes
INNER JOIN utilisateurs ON commandes.utilisateur_id = utilisateurs.id;
\`\`\`

## LEFT JOIN
Retourne toutes les lignes de la table de gauche, même sans correspondance
(valeurs NULL pour la table de droite).

\`\`\`sql
SELECT utilisateurs.nom, commandes.id
FROM utilisateurs
LEFT JOIN commandes ON commandes.utilisateur_id = utilisateurs.id;
-- Inclut les utilisateurs sans aucune commande
\`\`\`

## Clés primaires et étrangères
- La **clé primaire** identifie de manière unique chaque ligne d'une table.
- La **clé étrangère** référence la clé primaire d'une autre table, créant
  le lien entre les deux.
`,
                  },
                  {
                    title: "Fonctions d'agrégation et GROUP BY",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Fonctions d'agrégation et GROUP BY

## Fonctions d'agrégation

\`\`\`sql
SELECT COUNT(*) FROM commandes;          -- nombre de lignes
SELECT SUM(montant) FROM commandes;      -- somme des montants
SELECT AVG(prix) FROM produits;          -- moyenne
SELECT MIN(prix), MAX(prix) FROM produits;
\`\`\`

## GROUP BY
Regroupe les lignes ayant la même valeur dans une colonne pour appliquer
une agrégation par groupe.

\`\`\`sql
SELECT utilisateur_id, COUNT(*) AS nb_commandes
FROM commandes
GROUP BY utilisateur_id;
\`\`\`

## HAVING
Filtre les groupes après agrégation (alors que WHERE filtre avant) :

\`\`\`sql
SELECT utilisateur_id, COUNT(*) AS nb_commandes
FROM commandes
GROUP BY utilisateur_id
HAVING COUNT(*) > 5;
-- Ne garde que les utilisateurs ayant plus de 5 commandes
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Jointures et agrégations",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quel type de jointure retourne toutes les lignes de la table de gauche, même sans correspondance ?",
                          explanation: "LEFT JOIN conserve toutes les lignes de la table de gauche, avec NULL pour les colonnes sans correspondance.",
                          answers: {
                            create: [
                              { label: "INNER JOIN", isCorrect: false, order: 1 },
                              { label: "LEFT JOIN", isCorrect: true, order: 2 },
                              { label: "GROUP BY", isCorrect: false, order: 3 },
                              { label: "DISTINCT", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "HAVING permet de filtrer les groupes après une agrégation, contrairement à WHERE qui filtre avant.",
                          explanation: "Vrai : WHERE filtre les lignes avant le GROUP BY, HAVING filtre les groupes résultants.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez la requête pour compter le nombre de commandes par utilisateur :\n\n```sql\nSELECT utilisateur_id, COUNT(*) AS nb_commandes\nFROM commandes\n___ utilisateur_id;\n```",
                          explanation: "GROUP BY regroupe les lignes par valeur de colonne pour appliquer l'agrégation.",
                          answers: {
                            create: [{ label: "GROUP BY", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingReactModule = await prisma.module.findUnique({ where: { slug: "react-fondamentaux" } });
  if (!existingReactModule) {
    await prisma.module.create({
      data: {
        slug: "react-fondamentaux",
        title: "React — Fondamentaux",
        description:
          "Construisez des interfaces utilisateur modernes avec React : composants, JSX, props, état et hooks.",
        category: "Front-end",
        order: 6,
        estimatedMinutes: 240,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_REACT",
        chapters: {
          create: [
            {
              slug: "composants-et-jsx",
              title: "Composants et JSX",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Créer des composants avec JSX",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Créer des composants avec JSX

React permet de construire des interfaces en assemblant des
**composants** : des fonctions JavaScript qui retournent du JSX (une
syntaxe proche du HTML).

## Un composant simple

\`\`\`jsx
function Bonjour() {
  return <h1>Bonjour le monde !</h1>;
}
\`\`\`

## JSX : du HTML dans du JavaScript

\`\`\`jsx
function Carte() {
  const nom = "Alice";
  return (
    <div className="carte">
      <h2>{nom}</h2>
      <p>Bienvenue, {nom} !</p>
    </div>
  );
}
\`\`\`

## Règles importantes du JSX
- On utilise \`className\` au lieu de \`class\` (mot réservé en JS).
- Un composant doit retourner un **seul élément racine** (ou un fragment
  \`<>...</>\`).
- Les expressions JavaScript s'insèrent entre accolades \`{ }\`.

## Composition
Un composant peut en utiliser un autre :

\`\`\`jsx
function App() {
  return (
    <div>
      <Carte />
      <Carte />
    </div>
  );
}
\`\`\`
`,
                  },
                  {
                    title: "Props et composition de composants",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Props et composition de composants

Les **props** (propriétés) permettent de passer des données d'un
composant parent à un composant enfant.

\`\`\`jsx
function Carte({ nom, role }) {
  return (
    <div className="carte">
      <h2>{nom}</h2>
      <p>{role}</p>
    </div>
  );
}

function App() {
  return (
    <div>
      <Carte nom="Alice" role="Développeuse" />
      <Carte nom="Bob" role="Designer" />
    </div>
  );
}
\`\`\`

## Props en lecture seule
Les props sont **immuables** : un composant enfant ne doit jamais modifier
directement les props qu'il reçoit. Si une donnée doit changer, elle doit
être gérée via l'**état** (state) du composant qui la possède.

## La prop children

\`\`\`jsx
function Panneau({ children }) {
  return <div className="panneau">{children}</div>;
}

// Utilisation :
<Panneau>
  <p>Contenu du panneau</p>
</Panneau>
\`\`\`

## Listes et clés
Lorsqu'on affiche une liste avec \`map\`, chaque élément doit avoir une
prop \`key\` unique et stable, pour que React puisse identifier les
éléments lors des mises à jour :

\`\`\`jsx
{utilisateurs.map((u) => (
  <Carte key={u.id} nom={u.nom} role={u.role} />
))}
\`\`\`
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Composants et JSX",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quel attribut utilise-t-on en JSX à la place de class en HTML ?",
                          explanation: "class est un mot réservé en JavaScript, JSX utilise donc className.",
                          answers: {
                            create: [
                              { label: "class", isCorrect: false, order: 1 },
                              { label: "className", isCorrect: true, order: 2 },
                              { label: "cssClass", isCorrect: false, order: 3 },
                              { label: "style", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Un composant enfant peut modifier directement les props qu'il reçoit de son parent.",
                          explanation:
                            "Faux : les props sont en lecture seule (immuables). Les données modifiables doivent passer par l'état (state).",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez le code pour donner une clé unique à chaque élément de la liste :\n\n```jsx\n{utilisateurs.map((u) => (\n  <Carte ___={u.id} nom={u.nom} />\n))}\n```",
                          explanation: "La prop key permet à React d'identifier chaque élément de la liste de manière unique.",
                          answers: {
                            create: [{ label: "key", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "etat-et-hooks",
              title: "État et hooks",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Gérer l'état avec useState",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Gérer l'état avec useState

L'**état** (state) représente des données qui peuvent changer au fil du
temps et qui déclenchent un nouvel affichage du composant lorsqu'elles
sont modifiées.

## Le hook useState

\`\`\`jsx
import { useState } from "react";

function Compteur() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Compteur : {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
\`\`\`

## Points clés
- \`useState(valeurInitiale)\` retourne un tableau \`[valeur, setter]\`.
- Appeler le **setter** déclenche un nouveau rendu du composant.
- Ne **jamais** modifier l'état directement (\`count++\`) : toujours passer
  par le setter.

## Mise à jour basée sur la valeur précédente

\`\`\`jsx
setCount((prev) => prev + 1);
// Préférable si plusieurs mises à jour s'enchaînent rapidement
\`\`\`
`,
                  },
                  {
                    title: "Effets de bord avec useEffect",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Effets de bord avec useEffect

Le hook \`useEffect\` permet d'exécuter du code en réaction au rendu d'un
composant : appels API, abonnements, manipulation du DOM, etc.

## Syntaxe de base

\`\`\`jsx
import { useEffect, useState } from "react";

function Profil({ userId }) {
  const [utilisateur, setUtilisateur] = useState(null);

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then((data) => setUtilisateur(data));
  }, [userId]); // se redéclenche si userId change

  if (!utilisateur) return <p>Chargement...</p>;
  return <p>{utilisateur.nom}</p>;
}
\`\`\`

## Le tableau de dépendances
- \`[]\` (tableau vide) : l'effet s'exécute **une seule fois**, au montage.
- \`[userId]\` : l'effet se relance à chaque changement de \`userId\`.
- Pas de tableau : l'effet s'exécute après **chaque** rendu (rarement
  souhaité).

## Fonction de nettoyage (cleanup)

\`\`\`jsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id); // nettoyage à la destruction du composant
}, []);
\`\`\`

## Bonne pratique
Listez toujours dans le tableau de dépendances toutes les valeurs externes
utilisées dans l'effet, pour éviter des bugs dus à des données obsolètes
("stale closures").
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — État et hooks",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quel hook permet de déclarer une variable d'état dans un composant fonctionnel ?",
                          explanation: "useState retourne une paire [valeur, setter] pour gérer l'état local.",
                          answers: {
                            create: [
                              { label: "useEffect", isCorrect: false, order: 1 },
                              { label: "useState", isCorrect: true, order: 2 },
                              { label: "useRef", isCorrect: false, order: 3 },
                              { label: "useContext", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Un useEffect avec un tableau de dépendances vide ([]) s'exécute une seule fois, au montage du composant.",
                          explanation: "Vrai : un tableau de dépendances vide signifie que l'effet ne se relance jamais après le premier rendu.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez le code pour incrémenter le compteur en se basant sur sa valeur précédente :\n\n```jsx\nsetCount((prev) => prev ___ 1);\n```",
                          explanation: "L'opérateur + permet d'ajouter 1 à la valeur précédente du compteur.",
                          answers: {
                            create: [{ label: "+", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const existingNodeModule = await prisma.module.findUnique({ where: { slug: "node-express-fondamentaux" } });
  if (!existingNodeModule) {
    await prisma.module.create({
      data: {
        slug: "node-express-fondamentaux",
        title: "Node.js & Express — Fondamentaux",
        description:
          "Construisez des API web côté serveur avec Node.js et Express : routes, middlewares, requêtes HTTP et bonnes pratiques de sécurité.",
        category: "Back-end",
        order: 7,
        estimatedMinutes: 240,
        published: true,
        completionBadgeCode: "MODULE_COMPLETED_NODE",
        chapters: {
          create: [
            {
              slug: "creer-un-serveur-avec-express",
              title: "Créer un serveur avec Express",
              order: 1,
              lessons: {
                create: [
                  {
                    title: "Routes et middlewares",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Routes et middlewares

Express est un framework minimaliste pour créer des serveurs HTTP avec
Node.js.

## Un serveur Express minimal

\`\`\`js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bonjour !");
});

app.listen(3000, () => console.log("Serveur sur le port 3000"));
\`\`\`

## Les routes
Une route associe une méthode HTTP (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`...)
et un chemin à une fonction de traitement :

\`\`\`js
app.get("/utilisateurs", (req, res) => { /* ... */ });
app.post("/utilisateurs", (req, res) => { /* ... */ });
app.get("/utilisateurs/:id", (req, res) => { /* ... */ });
\`\`\`

## Les middlewares
Un **middleware** est une fonction \`(req, res, next)\` exécutée avant le
gestionnaire de route. Il sert à journaliser, authentifier, valider des
données, etc.

\`\`\`js
app.use(express.json()); // parse le corps JSON des requêtes

function logger(req, res, next) {
  console.log(\`\${req.method} \${req.path}\`);
  next(); // passe au middleware/route suivant
}
app.use(logger);
\`\`\`

Sans appeler \`next()\`, la requête reste bloquée indéfiniment.
`,
                  },
                  {
                    title: "Requêtes et réponses HTTP",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Requêtes et réponses HTTP

## L'objet req (requête)

\`\`\`js
app.get("/utilisateurs/:id", (req, res) => {
  console.log(req.params.id);   // paramètre d'URL
  console.log(req.query.tri);   // ?tri=nom -> "nom"
  console.log(req.body);        // corps JSON (avec express.json())
});
\`\`\`

## L'objet res (réponse)

\`\`\`js
res.json({ message: "OK" });        // réponse JSON (statut 200 par défaut)
res.status(201).json({ id: 42 });   // statut 201 Created
res.status(404).json({ error: "Introuvable" });
res.status(204).send();             // pas de contenu
\`\`\`

## Codes de statut HTTP courants
- **200 OK** : succès.
- **201 Created** : ressource créée.
- **400 Bad Request** : données invalides envoyées par le client.
- **401 Unauthorized** : authentification requise ou invalide.
- **403 Forbidden** : authentifié mais non autorisé.
- **404 Not Found** : ressource introuvable.
- **500 Internal Server Error** : erreur côté serveur.

## Bonne pratique
Choisissez le code de statut le plus précis possible : cela aide le client
(et les outils de monitoring) à comprendre la nature du résultat sans
analyser le corps de la réponse.
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — Routes et middlewares",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle fonction un middleware doit-il appeler pour passer la main au middleware ou à la route suivante ?",
                          explanation: "next() transmet le contrôle au middleware suivant dans la chaîne.",
                          answers: {
                            create: [
                              { label: "return", isCorrect: false, order: 1 },
                              { label: "next()", isCorrect: true, order: 2 },
                              { label: "continue()", isCorrect: false, order: 3 },
                              { label: "res.next()", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Le code de statut 201 signifie qu'une ressource a été créée avec succès.",
                          explanation: "Vrai : 201 Created est utilisé en réponse à une création réussie (ex: POST).",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: true, order: 1 },
                              { label: "Faux", isCorrect: false, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez le code pour répondre avec un statut 404 et un message d'erreur JSON :\n\n```js\nres.___(404).json({ error: \"Introuvable\" });\n```",
                          explanation: "res.status(code) définit le code de statut HTTP de la réponse.",
                          answers: {
                            create: [{ label: "status", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              slug: "api-rest-et-securite",
              title: "API REST et sécurité",
              order: 2,
              lessons: {
                create: [
                  {
                    title: "Construire une API REST",
                    order: 1,
                    type: "THEORY",
                    contentMd: `# Construire une API REST

Une API **REST** expose des ressources (utilisateurs, articles, etc.) via
des URL et des méthodes HTTP standardisées.

## Convention CRUD

\`\`\`js
app.get("/articles", listerArticles);        // lire la liste
app.get("/articles/:id", lireArticle);       // lire un article
app.post("/articles", creerArticle);         // créer un article
app.put("/articles/:id", remplacerArticle);  // remplacer un article
app.patch("/articles/:id", modifierArticle); // modifier partiellement
app.delete("/articles/:id", supprimerArticle); // supprimer
\`\`\`

## Exemple de handler

\`\`\`js
async function creerArticle(req, res) {
  const { titre, contenu } = req.body;
  const article = await db.article.create({ data: { titre, contenu } });
  res.status(201).json(article);
}
\`\`\`

## Bonnes pratiques REST
- Utiliser des noms de ressources au pluriel (\`/articles\`, pas
  \`/getArticle\`).
- Les URL décrivent des **ressources**, pas des actions (pas de
  \`/articles/supprimer/3\`, mais \`DELETE /articles/3\`).
- Retourner des codes de statut HTTP cohérents.
`,
                  },
                  {
                    title: "Sécuriser une API (validation, authentification)",
                    order: 2,
                    type: "THEORY",
                    contentMd: `# Sécuriser une API

## Valider les entrées
Ne jamais faire confiance aux données envoyées par le client. Utilisez une
bibliothèque de validation (ex: Zod, Joi) pour vérifier le format, le type
et les contraintes des données reçues **avant** de les utiliser.

\`\`\`js
const schema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(12),
});

app.post("/inscription", (req, res) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Données invalides" });
  }
  // ... traitement
});
\`\`\`

## Authentification avec middleware

\`\`\`js
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentification requise" });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

app.get("/profil", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

## Bonnes pratiques de sécurité
- Hacher les mots de passe (Argon2id, bcrypt) — jamais en clair.
- Limiter le débit des requêtes sensibles (rate limiting) pour contrer le
  brute-force.
- Définir des en-têtes de sécurité HTTP (Helmet) et activer CORS de manière
  restrictive.
`,
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: "Quiz — API REST et sécurité",
                    passingScore: 70,
                    questions: {
                      create: [
                        {
                          order: 1,
                          type: "MCQ",
                          prompt: "Quelle méthode HTTP convient le mieux pour créer une nouvelle ressource ?",
                          explanation: "POST est utilisé pour créer une nouvelle ressource sur le serveur.",
                          answers: {
                            create: [
                              { label: "GET", isCorrect: false, order: 1 },
                              { label: "POST", isCorrect: true, order: 2 },
                              { label: "DELETE", isCorrect: false, order: 3 },
                              { label: "OPTIONS", isCorrect: false, order: 4 },
                            ],
                          },
                        },
                        {
                          order: 2,
                          type: "TRUE_FALSE",
                          prompt: "Il est acceptable de stocker les mots de passe des utilisateurs en clair tant que la base de données est privée.",
                          explanation:
                            "Faux : les mots de passe doivent toujours être hachés (Argon2id, bcrypt), quel que soit l'environnement.",
                          answers: {
                            create: [
                              { label: "Vrai", isCorrect: false, order: 1 },
                              { label: "Faux", isCorrect: true, order: 2 },
                            ],
                          },
                        },
                        {
                          order: 3,
                          type: "CODE_FILL",
                          prompt:
                            "Complétez le code pour renvoyer une erreur 401 si le token d'authentification est manquant :\n\n```js\nif (!token) return res.status(___).json({ error: \"Authentification requise\" });\n```",
                          explanation: "401 Unauthorized indique que l'authentification est requise ou invalide.",
                          answers: {
                            create: [{ label: "401", isCorrect: true, order: 1 }],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }

  // Ajoute une limite de temps et des questions DEBUG / DRAG_DROP au quiz
  // "Fonctions et contrôle de flux" (idempotent pour les bases déjà seedées).
  const jsControlQuiz = await prisma.quiz.findFirst({
    where: { title: "Quiz — Fonctions et contrôle de flux", chapter: { slug: "fonctions-et-controle" } },
    include: { questions: true },
  });
  if (jsControlQuiz) {
    if (jsControlQuiz.timeLimitSeconds === null) {
      await prisma.quiz.update({ where: { id: jsControlQuiz.id }, data: { timeLimitSeconds: 300 } });
    }

    if (!jsControlQuiz.questions.some((q) => q.type === "DEBUG")) {
      await prisma.quizQuestion.create({
        data: {
          quizId: jsControlQuiz.id,
          order: 4,
          type: "DEBUG",
          prompt:
            "Ce code doit afficher la somme des éléments du tableau, mais contient un bug :\n\n```js\nfunction somme(tableau) {\n  let total = 0;\n  for (let i = 0; i <= tableau.length; i++) {\n    total += tableau[i];\n  }\n  return total;\n}\n```\n\nQuelle doit être la condition de la boucle `for` pour corriger le bug ?",
          explanation:
            "`i <= tableau.length` provoque un accès hors limites (tableau[length] vaut undefined), ce qui rend `total` égal à NaN. La bonne condition est `i < tableau.length`.",
          answers: {
            create: [{ label: "i < tableau.length", isCorrect: true, order: 1 }],
          },
        },
      });
    }

    if (!jsControlQuiz.questions.some((q) => q.type === "DRAG_DROP")) {
      await prisma.quizQuestion.create({
        data: {
          quizId: jsControlQuiz.id,
          order: 5,
          type: "DRAG_DROP",
          prompt:
            "Remettez dans l'ordre les étapes d'exécution de cette boucle :\n\n```js\nfor (let i = 0; i < 3; i++) {\n  console.log(i);\n}\n```",
          explanation:
            "Une boucle for exécute d'abord l'initialisation, puis vérifie la condition, exécute le corps, applique l'incrémentation, et revérifie la condition.",
          answers: {
            create: [
              { label: "Initialisation : i = 0", isCorrect: true, order: 1 },
              { label: "Vérification de la condition : i < 3", isCorrect: true, order: 2 },
              { label: "Exécution du corps : console.log(i)", isCorrect: true, order: 3 },
              { label: "Incrémentation : i++", isCorrect: true, order: 4 },
            ],
          },
        },
      });
    }
  }

  await seedExams(prisma);

  const demoEmail = "demo@devacademy.pro";
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingUser) {
    const passwordHash = await argon2.hash("DemoUser#2026", {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        firstName: "Demo",
        lastName: "Étudiant",
        role: "STUDENT",
      },
    });
    console.log(`Utilisateur de démo créé : ${demoEmail} / DemoUser#2026`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
