export interface GitCommit {
  id: string;
  parents: string[];
  message: string;
  files: Record<string, string>;
  timestamp: number;
}

export type GitHead = { type: "branch"; name: string } | { type: "detached"; commitId: string };

export interface GitRepoState {
  initialized: boolean;
  files: Record<string, string>;
  index: Record<string, string>;
  commits: Record<string, GitCommit>;
  branches: Record<string, string | null>;
  head: GitHead;
}

export interface CommandResult {
  state: GitRepoState;
  output: string[];
}

export const CLEAR_SIGNAL = "__CLEAR__";

export const initialRepoState: GitRepoState = {
  initialized: false,
  files: {
    "index.html": "<h1>Bonjour le monde</h1>\n",
    "README.md": "# Mon projet\n",
  },
  index: {},
  commits: {},
  branches: {},
  head: { type: "branch", name: "main" },
};

const HELP_TEXT = [
  "Commandes disponibles :",
  "  git init                  Initialiser un dépôt",
  "  git status                Afficher l'état du dépôt",
  "  git add <fichier|.>       Indexer des modifications",
  '  git commit -m "message"   Créer un commit',
  "  git branch [nom]          Lister ou créer une branche",
  "  git checkout [-b] <cible> Changer de branche / créer + changer",
  "  git merge <branche>       Fusionner une branche dans la branche actuelle",
  "  git log [--oneline]       Afficher l'historique des commits",
  "  git diff                  Afficher les modifications non indexées",
  "  ls                        Lister les fichiers du répertoire de travail",
  "  cat <fichier>             Afficher le contenu d'un fichier",
  "  clear                     Effacer le terminal",
];

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

export function shortId(id: string): string {
  return id.slice(0, 7);
}

function generateCommitId(): string {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function getCurrentCommitId(state: GitRepoState): string | null {
  if (state.head.type === "branch") {
    return state.branches[state.head.name] ?? null;
  }
  return state.head.commitId;
}

function getCommitFiles(state: GitRepoState, commitId: string | null): Record<string, string> {
  if (!commitId) return {};
  return state.commits[commitId]?.files ?? {};
}

function getAncestors(state: GitRepoState, commitId: string | null): Set<string> {
  const result = new Set<string>();
  const queue: string[] = [];
  if (commitId) queue.push(commitId);
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (result.has(id)) continue;
    result.add(id);
    const commit = state.commits[id];
    if (commit) queue.push(...commit.parents);
  }
  return result;
}

function refsPointingAt(state: GitRepoState, commitId: string): string[] {
  const refs: string[] = [];
  for (const [name, id] of Object.entries(state.branches)) {
    if (id === commitId) {
      refs.push(state.head.type === "branch" && state.head.name === name ? `HEAD -> ${name}` : name);
    }
  }
  if (state.head.type === "detached" && state.head.commitId === commitId) {
    refs.unshift("HEAD");
  }
  return refs;
}

export function runCommand(state: GitRepoState, input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { state, output: [] };
  const tokens = tokenize(trimmed);
  const [cmd, ...rest] = tokens;

  if (cmd === "clear") return { state, output: [CLEAR_SIGNAL] };
  if (cmd === "help") return { state, output: HELP_TEXT };
  if (cmd === "ls") return { state, output: lsCommand(state) };
  if (cmd === "cat") return { state, output: catCommand(state, rest) };
  if (cmd !== "git") return { state, output: [`commande introuvable : ${cmd} (tapez "help")`] };

  const [sub, ...args] = rest;
  if (!sub) return { state, output: ["usage : git <commande> [<args>]"] };

  if (sub !== "init" && !state.initialized) {
    return { state, output: ["fatal : pas un dépôt git (ou l'un des répertoires parents) : .git"] };
  }

  switch (sub) {
    case "init":
      return gitInit(state);
    case "status":
      return gitStatus(state);
    case "add":
      return gitAdd(state, args);
    case "commit":
      return gitCommit(state, args);
    case "branch":
      return gitBranch(state, args);
    case "checkout":
      return gitCheckout(state, args);
    case "merge":
      return gitMerge(state, args);
    case "log":
      return gitLog(state, args);
    case "diff":
      return gitDiff(state);
    default:
      return { state, output: [`git : '${sub}' n'est pas une commande git. Tapez 'help' pour la liste.`] };
  }
}

function lsCommand(state: GitRepoState): string[] {
  const names = Object.keys(state.files).sort();
  return names.length === 0 ? ["(répertoire vide)"] : names;
}

function catCommand(state: GitRepoState, args: string[]): string[] {
  const [file] = args;
  if (!file) return ["usage : cat <fichier>"];
  if (!(file in state.files)) return [`cat : ${file} : fichier introuvable`];
  return state.files[file].split("\n");
}

function gitInit(state: GitRepoState): CommandResult {
  if (state.initialized) {
    return { state, output: ["Dépôt Git déjà initialisé."] };
  }
  const next: GitRepoState = {
    ...clone(state),
    initialized: true,
    branches: { main: null },
    head: { type: "branch", name: "main" },
  };
  return { state: next, output: ["Dépôt Git vide initialisé."] };
}

function gitStatus(state: GitRepoState): CommandResult {
  const output: string[] = [];
  if (state.head.type === "branch") {
    output.push(`Sur la branche ${state.head.name}`);
  } else {
    output.push(`HEAD détachée sur ${shortId(state.head.commitId)}`);
  }

  const currentCommitId = getCurrentCommitId(state);
  if (!currentCommitId) {
    output.push("", "Aucun commit pour l'instant");
  }

  const headFiles = getCommitFiles(state, currentCommitId);
  const indexFiles = { ...headFiles, ...state.index };

  const stagedLines: string[] = [];
  for (const path of Object.keys(state.index).sort()) {
    if (!(path in headFiles)) {
      stagedLines.push(`        nouveau fichier : ${path}`);
    } else if (headFiles[path] !== state.index[path]) {
      stagedLines.push(`        modifié :         ${path}`);
    }
  }
  if (stagedLines.length > 0) {
    output.push("", "Modifications qui seront validées :", ...stagedLines);
  }

  const unstagedLines: string[] = [];
  const untrackedLines: string[] = [];
  for (const path of Object.keys(state.files).sort()) {
    if (path in indexFiles) {
      if (state.files[path] !== indexFiles[path]) {
        unstagedLines.push(`        modifié :         ${path}`);
      }
    } else {
      untrackedLines.push(`        ${path}`);
    }
  }
  if (unstagedLines.length > 0) {
    output.push("", "Modifications qui ne seront pas indexées pour la validation :", ...unstagedLines);
  }
  if (untrackedLines.length > 0) {
    output.push("", "Fichiers non suivis :", ...untrackedLines);
  }

  if (currentCommitId && stagedLines.length === 0 && unstagedLines.length === 0 && untrackedLines.length === 0) {
    output.push("", "rien à valider, la copie de travail est propre");
  }

  return { state, output };
}

function gitAdd(state: GitRepoState, args: string[]): CommandResult {
  if (args.length === 0) {
    return { state, output: ["rien de spécifié, rien n'a été ajouté."] };
  }
  const next = clone(state);
  if (args[0] === ".") {
    for (const [path, content] of Object.entries(next.files)) {
      next.index[path] = content;
    }
    return { state: next, output: [] };
  }
  for (const path of args) {
    if (!(path in next.files)) {
      return { state, output: [`pathspec '${path}' ne correspond à aucun fichier connu`] };
    }
    next.index[path] = next.files[path];
  }
  return { state: next, output: [] };
}

function gitCommit(state: GitRepoState, args: string[]): CommandResult {
  const flagIndex = args.indexOf("-m");
  const message = flagIndex >= 0 ? args[flagIndex + 1] : undefined;
  if (!message) {
    return { state, output: ['usage : git commit -m "message"'] };
  }

  const currentCommitId = getCurrentCommitId(state);
  const headFiles = getCommitFiles(state, currentCommitId);
  const newFiles = { ...headFiles, ...state.index };

  if (currentCommitId && Object.keys(state.index).every((p) => headFiles[p] === state.index[p])) {
    return { state, output: ["rien à valider, la copie de travail est propre"] };
  }

  const id = generateCommitId();
  const commit: GitCommit = {
    id,
    parents: currentCommitId ? [currentCommitId] : [],
    message,
    files: newFiles,
    timestamp: Date.now(),
  };

  const next = clone(state);
  next.commits[id] = commit;
  next.index = {};
  if (next.head.type === "branch") {
    next.branches[next.head.name] = id;
  } else {
    next.head = { type: "detached", commitId: id };
  }

  return { state: next, output: [`[${state.head.type === "branch" ? state.head.name : "HEAD détachée"} ${shortId(id)}] ${message}`] };
}

function gitBranch(state: GitRepoState, args: string[]): CommandResult {
  if (args.length === 0) {
    const names = Object.keys(state.branches).sort();
    if (names.length === 0) return { state, output: ["(aucune branche)"] };
    return {
      state,
      output: names.map((name) => {
        const current = state.head.type === "branch" && state.head.name === name;
        return `${current ? "* " : "  "}${name}`;
      }),
    };
  }

  const [name] = args;
  if (state.branches[name] !== undefined) {
    return { state, output: [`la branche '${name}' existe déjà`] };
  }
  const currentCommitId = getCurrentCommitId(state);
  if (!currentCommitId) {
    return { state, output: ["fatal : impossible de créer une branche sans commit initial"] };
  }
  const next = clone(state);
  next.branches[name] = currentCommitId;
  return { state: next, output: [] };
}

function gitCheckout(state: GitRepoState, args: string[]): CommandResult {
  let createNew = false;
  let target: string | undefined;
  for (const arg of args) {
    if (arg === "-b") createNew = true;
    else target = arg;
  }
  if (!target) return { state, output: ["usage : git checkout [-b] <branche>"] };

  const next = clone(state);

  if (createNew) {
    if (next.branches[target] !== undefined) {
      return { state, output: [`la branche '${target}' existe déjà`] };
    }
    const currentCommitId = getCurrentCommitId(next);
    next.branches[target] = currentCommitId;
    next.head = { type: "branch", name: target };
    return { state: next, output: [`Basculement sur la nouvelle branche '${target}'`] };
  }

  if (next.branches[target] !== undefined) {
    next.head = { type: "branch", name: target };
    next.files = clone(getCommitFiles(next, next.branches[target]));
    next.index = {};
    return { state: next, output: [`Basculement sur la branche '${target}'`] };
  }

  if (next.commits[target]) {
    next.head = { type: "detached", commitId: target };
    next.files = clone(getCommitFiles(next, target));
    next.index = {};
    return { state: next, output: [`Note : basculement sur '${shortId(target)}'.`, "Vous êtes en HEAD détachée."] };
  }

  return { state, output: [`erreur : pathspec '${target}' ne correspond à aucun objet connu`] };
}

function gitMerge(state: GitRepoState, args: string[]): CommandResult {
  const [target] = args;
  if (!target) return { state, output: ["usage : git merge <branche>"] };
  if (state.head.type !== "branch") {
    return { state, output: ["fatal : impossible de fusionner en HEAD détachée"] };
  }
  const branchName = state.head.name;
  const targetCommitId = state.branches[target];
  if (targetCommitId === undefined) {
    return { state, output: [`fusion : ${target} - introuvable`] };
  }

  const currentCommitId = getCurrentCommitId(state);

  if (!targetCommitId) {
    return { state, output: ["Déjà à jour."] };
  }
  if (currentCommitId === targetCommitId) {
    return { state, output: ["Déjà à jour."] };
  }

  const currentAncestors = getAncestors(state, currentCommitId);
  const targetAncestors = getAncestors(state, targetCommitId);

  // Cible déjà fusionnée (la cible est un ancêtre de la branche actuelle)
  if (currentCommitId && currentAncestors.has(targetCommitId)) {
    return { state, output: ["Déjà à jour."] };
  }

  // Fast-forward : la branche actuelle est un ancêtre de la cible (ou n'a pas de commit)
  const canFastForward = !currentCommitId || targetAncestors.has(currentCommitId);
  if (canFastForward) {
    const next = clone(state);
    next.branches[branchName] = targetCommitId;
    next.files = clone(getCommitFiles(next, targetCommitId));
    next.index = {};
    return { state: next, output: ["Mise à jour rapide (fast-forward)", `${target} -> ${branchName}`] };
  }

  // Recherche de l'ancêtre commun le plus proche
  let baseId: string | null = null;
  for (const id of getAncestors(state, currentCommitId)) {
    if (targetAncestors.has(id)) {
      baseId = id;
      break;
    }
  }

  const baseFiles = getCommitFiles(state, baseId);
  const currentFiles = getCommitFiles(state, currentCommitId);
  const targetFiles = getCommitFiles(state, targetCommitId);

  const mergedFiles: Record<string, string> = {};
  const conflicts: string[] = [];
  const allPaths = new Set([...Object.keys(baseFiles), ...Object.keys(currentFiles), ...Object.keys(targetFiles)]);

  for (const path of allPaths) {
    const base = baseFiles[path];
    const current = currentFiles[path];
    const target_ = targetFiles[path];

    if (current === target_) {
      if (current !== undefined) mergedFiles[path] = current;
      continue;
    }
    if (current === base) {
      if (target_ !== undefined) mergedFiles[path] = target_;
      continue;
    }
    if (target_ === base) {
      if (current !== undefined) mergedFiles[path] = current;
      continue;
    }
    // Modifié des deux côtés différemment : conflit
    conflicts.push(path);
    mergedFiles[path] = `<<<<<<< HEAD\n${current ?? ""}=======\n${target_ ?? ""}>>>>>>> ${target}\n`;
  }

  const next = clone(state);
  next.files = mergedFiles;

  if (conflicts.length > 0) {
    next.index = { ...currentFiles };
    return {
      state: next,
      output: [
        "Fusion automatique échouée ; corrigez les conflits puis validez le résultat.",
        ...conflicts.map((p) => `CONFLIT (contenu) : Conflit de fusion dans ${p}`),
      ],
    };
  }

  const id = generateCommitId();
  const commit: GitCommit = {
    id,
    parents: [currentCommitId, targetCommitId],
    message: `Fusion de la branche '${target}'`,
    files: mergedFiles,
    timestamp: Date.now(),
  };
  next.commits[id] = commit;
  next.branches[branchName] = id;
  next.index = {};

  return { state: next, output: [`Fusion réussie de '${target}' (commit ${shortId(id)})`] };
}

function gitLog(state: GitRepoState, args: string[]): CommandResult {
  const oneline = args.includes("--oneline");
  const currentCommitId = getCurrentCommitId(state);
  if (!currentCommitId) return { state, output: ["fatal : votre branche actuelle ne contient aucun commit"] };

  const ids = Array.from(getAncestors(state, currentCommitId))
    .map((id) => state.commits[id])
    .filter((c): c is GitCommit => !!c)
    .sort((a, b) => b.timestamp - a.timestamp);

  const output: string[] = [];
  for (const commit of ids) {
    const refs = refsPointingAt(state, commit.id);
    const refsLabel = refs.length > 0 ? ` (${refs.join(", ")})` : "";
    if (oneline) {
      output.push(`${shortId(commit.id)}${refsLabel} ${commit.message}`);
    } else {
      output.push(`commit ${commit.id}${refsLabel}`, `Date:   ${new Date(commit.timestamp).toLocaleString("fr-FR")}`, "", `    ${commit.message}`, "");
    }
  }
  return { state, output };
}

function gitDiff(state: GitRepoState): CommandResult {
  const currentCommitId = getCurrentCommitId(state);
  const headFiles = getCommitFiles(state, currentCommitId);
  const baseline = { ...headFiles, ...state.index };
  const output: string[] = [];

  for (const path of Object.keys({ ...baseline, ...state.files }).sort()) {
    const before = baseline[path];
    const after = state.files[path];
    if (before === after) continue;
    output.push(`diff --git a/${path} b/${path}`);
    if (before === undefined) {
      output.push(`+++ b/${path}`, ...after.split("\n").map((l) => `+${l}`));
    } else if (after === undefined) {
      output.push(`--- a/${path}`, ...before.split("\n").map((l) => `-${l}`));
    } else {
      output.push(`--- a/${path}`, `+++ b/${path}`, ...before.split("\n").map((l) => `-${l}`), ...after.split("\n").map((l) => `+${l}`));
    }
  }

  return { state, output: output.length > 0 ? output : ["(aucune différence)"] };
}
