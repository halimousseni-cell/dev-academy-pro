export interface FileNode {
  type: "file";
  content: string;
}

export interface DirNode {
  type: "dir";
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;

export interface LinuxState {
  root: DirNode;
  cwd: string[];
}

export interface CommandResult {
  state: LinuxState;
  output: string[];
}

export const CLEAR_SIGNAL = "__CLEAR__";
export const USERNAME = "etudiant";
export const HOSTNAME = "dev-academy";
export const HOME: string[] = ["home", USERNAME];

const HELP_TEXT = [
  "Commandes disponibles :",
  "  pwd                       Afficher le répertoire courant",
  "  ls [-a] [-l] [chemin]     Lister le contenu d'un répertoire",
  "  cd [chemin]               Changer de répertoire (~, .., /)",
  "  cat <fichier...>          Afficher le contenu d'un fichier",
  "  echo <texte> [> | >> f]   Afficher du texte ou écrire dans un fichier",
  "  mkdir [-p] <dossier>      Créer un dossier",
  "  touch <fichier>           Créer un fichier vide",
  "  rm [-r] <chemin>          Supprimer un fichier ou dossier",
  "  rmdir <dossier>           Supprimer un dossier vide",
  "  cp <source> <dest>        Copier un fichier",
  "  mv <source> <dest>        Déplacer / renommer un fichier ou dossier",
  "  head [-n N] <fichier>     Afficher les N premières lignes (défaut 10)",
  "  tail [-n N] <fichier>     Afficher les N dernières lignes (défaut 10)",
  "  grep <motif> <fichier>    Rechercher un motif dans un fichier",
  "  find <chemin> -name <m>   Rechercher des fichiers par nom",
  "  wc [-l] <fichier>         Compter lignes/mots/caractères",
  "  whoami / hostname / date  Informations système simulées",
  "  clear                     Effacer le terminal",
];

function dir(children: Record<string, FsNode> = {}): DirNode {
  return { type: "dir", children };
}

function file(content: string): FileNode {
  return { type: "file", content };
}

export function createInitialState(): LinuxState {
  const root = dir({
    home: dir({
      [USERNAME]: dir({
        documents: dir({
          "notes.txt": file("Mes notes de cours\nLinux est un système d'exploitation libre.\n"),
        }),
        projets: dir({
          "site-web": dir({
            "index.html": file("<h1>Mon site</h1>\n"),
          }),
        }),
        ".bashrc": file("# Configuration du shell\nexport PS1='\\u@\\h:\\w\\$ '\n"),
      }),
    }),
    etc: dir({
      hostname: file(`${HOSTNAME}\n`),
      motd: file("Bienvenue sur le simulateur Linux Dev Academy Pro !\n"),
    }),
    var: dir({
      log: dir({
        syslog: file("Système démarré avec succès.\n"),
      }),
    }),
  });

  return { root, cwd: [...HOME] };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
  }
  return tokens;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function resolvePath(cwd: string[], pathStr: string): string[] {
  let base: string[];
  let rest = pathStr;

  if (pathStr.startsWith("~")) {
    base = [...HOME];
    rest = pathStr.slice(1).replace(/^\//, "");
  } else if (pathStr.startsWith("/")) {
    base = [];
    rest = pathStr.slice(1);
  } else {
    base = [...cwd];
  }

  const result = [...base];
  for (const seg of rest.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") result.pop();
    else result.push(seg);
  }
  return result;
}

function getNode(root: DirNode, segments: string[]): FsNode | null {
  let node: FsNode = root;
  for (const seg of segments) {
    if (node.type !== "dir") return null;
    const child: FsNode | undefined = node.children[seg];
    if (!child) return null;
    node = child;
  }
  return node;
}

function getParentDir(root: DirNode, segments: string[]): { parent: DirNode; name: string } | null {
  if (segments.length === 0) return null;
  const parentNode = getNode(root, segments.slice(0, -1));
  if (!parentNode || parentNode.type !== "dir") return null;
  return { parent: parentNode, name: segments[segments.length - 1] };
}

function pathLabel(segments: string[]): string {
  return segments.length === 0 ? "/" : "/" + segments.join("/");
}

function lastSegment(content: string): string[] {
  const lines = content.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function getPromptPath(cwd: string[]): string {
  if (cwd.length >= HOME.length && HOME.every((seg, i) => cwd[i] === seg)) {
    const rest = cwd.slice(HOME.length);
    return rest.length === 0 ? "~" : `~/${rest.join("/")}`;
  }
  return pathLabel(cwd);
}

export function runCommand(state: LinuxState, input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { state, output: [] };
  const tokens = tokenize(trimmed);
  const [cmd, ...args] = tokens;

  switch (cmd) {
    case "clear":
      return { state, output: [CLEAR_SIGNAL] };
    case "help":
      return { state, output: HELP_TEXT };
    case "pwd":
      return { state, output: [pathLabel(state.cwd)] };
    case "whoami":
      return { state, output: [USERNAME] };
    case "hostname":
      return { state, output: [HOSTNAME] };
    case "date":
      return { state, output: [new Date().toString()] };
    case "ls":
      return cmdLs(state, args);
    case "cd":
      return cmdCd(state, args);
    case "cat":
      return cmdCat(state, args);
    case "echo":
      return cmdEcho(state, args);
    case "mkdir":
      return cmdMkdir(state, args);
    case "touch":
      return cmdTouch(state, args);
    case "rm":
      return cmdRm(state, args);
    case "rmdir":
      return cmdRmdir(state, args);
    case "cp":
      return cmdCp(state, args);
    case "mv":
      return cmdMv(state, args);
    case "head":
      return cmdHeadTail(state, args, "head");
    case "tail":
      return cmdHeadTail(state, args, "tail");
    case "grep":
      return cmdGrep(state, args);
    case "find":
      return cmdFind(state, args);
    case "wc":
      return cmdWc(state, args);
    default:
      return { state, output: [`bash : ${cmd} : commande introuvable (tapez 'help')`] };
  }
}

function cmdLs(state: LinuxState, args: string[]): CommandResult {
  const flags = args.filter((a) => a.startsWith("-"));
  const paths = args.filter((a) => !a.startsWith("-"));
  const showAll = flags.some((f) => f.includes("a"));
  const long = flags.some((f) => f.includes("l"));

  const target = paths[0] ? resolvePath(state.cwd, paths[0]) : state.cwd;
  const node = getNode(state.root, target);
  if (!node) return { state, output: [`ls : impossible d'accéder à '${paths[0]}' : Aucun fichier ou dossier de ce type`] };
  if (node.type === "file") return { state, output: [paths[0]] };

  const names = Object.keys(node.children)
    .filter((name) => showAll || !name.startsWith("."))
    .sort();

  if (names.length === 0) return { state, output: [] };

  if (long) {
    return {
      state,
      output: names.map((name) => {
        const child = node.children[name];
        const perm = child.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
        const size = child.type === "file" ? child.content.length : 4096;
        const label = child.type === "dir" ? `${name}/` : name;
        return `${perm}  ${String(size).padStart(6)}  ${label}`;
      }),
    };
  }

  return { state, output: [names.map((name) => (node.children[name].type === "dir" ? `${name}/` : name)).join("  ")] };
}

function cmdCd(state: LinuxState, args: string[]): CommandResult {
  const target = args[0] ? resolvePath(state.cwd, args[0]) : [...HOME];
  const node = getNode(state.root, target);
  if (!node) return { state, output: [`bash : cd : ${args[0]} : Aucun fichier ou dossier de ce type`] };
  if (node.type !== "dir") return { state, output: [`bash : cd : ${args[0]} : N'est pas un dossier`] };
  return { state: { ...state, cwd: target }, output: [] };
}

function cmdCat(state: LinuxState, args: string[]): CommandResult {
  if (args.length === 0) return { state, output: ["usage : cat <fichier...>"] };
  const output: string[] = [];
  for (const path of args) {
    const node = getNode(state.root, resolvePath(state.cwd, path));
    if (!node) {
      output.push(`cat : ${path} : Aucun fichier ou dossier de ce type`);
    } else if (node.type !== "file") {
      output.push(`cat : ${path} : est un dossier`);
    } else {
      output.push(...lastSegment(node.content));
    }
  }
  return { state, output };
}

function cmdEcho(state: LinuxState, args: string[]): CommandResult {
  const appendIndex = args.indexOf(">>");
  const overwriteIndex = args.indexOf(">");
  const redirectIndex = appendIndex >= 0 ? appendIndex : overwriteIndex;

  if (redirectIndex < 0) {
    return { state, output: [args.join(" ")] };
  }

  const text = args.slice(0, redirectIndex).join(" ");
  const target = args[redirectIndex + 1];
  if (!target) return { state, output: ["bash : erreur de syntaxe près du jeton inattendu 'newline'"] };

  const segments = resolvePath(state.cwd, target);
  const location = getParentDir(state.root, segments);
  if (!location) return { state, output: [`bash : ${target} : Aucun fichier ou dossier de ce type`] };

  const next = clone(state);
  const parent = getNode(next.root, segments.slice(0, -1)) as DirNode;
  const existing = parent.children[location.name];
  if (existing && existing.type === "dir") {
    return { state, output: [`bash : ${target} : est un dossier`] };
  }

  const append = appendIndex >= 0;
  const previous = append && existing?.type === "file" ? existing.content : "";
  parent.children[location.name] = file(`${previous}${text}\n`);

  return { state: next, output: [] };
}

function cmdMkdir(state: LinuxState, args: string[]): CommandResult {
  const recursive = args.includes("-p");
  const paths = args.filter((a) => a !== "-p");
  if (paths.length === 0) return { state, output: ["usage : mkdir [-p] <dossier>"] };

  const next = clone(state);
  const output: string[] = [];

  for (const path of paths) {
    const segments = resolvePath(state.cwd, path);
    if (segments.length === 0) {
      output.push(`mkdir : impossible de créer le dossier '${path}' : Le fichier existe`);
      continue;
    }
    if (recursive) {
      let current: DirNode = next.root;
      let ok = true;
      for (const seg of segments) {
        const child = current.children[seg];
        if (!child) {
          current.children[seg] = dir();
          current = current.children[seg] as DirNode;
        } else if (child.type === "dir") {
          current = child;
        } else {
          output.push(`mkdir : impossible de créer le dossier '${path}' : '${seg}' n'est pas un dossier`);
          ok = false;
          break;
        }
      }
      if (!ok) continue;
    } else {
      const location = getParentDir(next.root, segments);
      if (!location) {
        output.push(`mkdir : impossible de créer le dossier '${path}' : Aucun fichier ou dossier de ce type`);
        continue;
      }
      if (location.parent.children[location.name]) {
        output.push(`mkdir : impossible de créer le dossier '${path}' : Le fichier existe`);
        continue;
      }
      location.parent.children[location.name] = dir();
    }
  }

  return { state: next, output };
}

function cmdTouch(state: LinuxState, args: string[]): CommandResult {
  if (args.length === 0) return { state, output: ["usage : touch <fichier...>"] };
  const next = clone(state);
  const output: string[] = [];

  for (const path of args) {
    const segments = resolvePath(state.cwd, path);
    const location = getParentDir(next.root, segments);
    if (!location) {
      output.push(`touch : impossible de créer '${path}' : Aucun fichier ou dossier de ce type`);
      continue;
    }
    if (!location.parent.children[location.name]) {
      location.parent.children[location.name] = file("");
    }
  }

  return { state: next, output };
}

function cmdRm(state: LinuxState, args: string[]): CommandResult {
  const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-fr");
  const paths = args.filter((a) => !a.startsWith("-"));
  if (paths.length === 0) return { state, output: ["usage : rm [-r] <chemin...>"] };

  const next = clone(state);
  const output: string[] = [];

  for (const path of paths) {
    const segments = resolvePath(state.cwd, path);
    if (segments.length === 0) {
      output.push(`rm : impossible de supprimer '${path}' : opération non permise`);
      continue;
    }
    const node = getNode(next.root, segments);
    const location = getParentDir(next.root, segments);
    if (!node || !location) {
      output.push(`rm : impossible de supprimer '${path}' : Aucun fichier ou dossier de ce type`);
      continue;
    }
    if (node.type === "dir" && !recursive) {
      output.push(`rm : impossible de supprimer '${path}' : est un dossier`);
      continue;
    }
    delete location.parent.children[location.name];
  }

  return { state: next, output };
}

function cmdRmdir(state: LinuxState, args: string[]): CommandResult {
  if (args.length === 0) return { state, output: ["usage : rmdir <dossier>"] };
  const next = clone(state);
  const output: string[] = [];

  for (const path of args) {
    const segments = resolvePath(state.cwd, path);
    const node = getNode(next.root, segments);
    const location = getParentDir(next.root, segments);
    if (!node || !location) {
      output.push(`rmdir : impossible de supprimer '${path}' : Aucun fichier ou dossier de ce type`);
      continue;
    }
    if (node.type !== "dir") {
      output.push(`rmdir : impossible de supprimer '${path}' : N'est pas un dossier`);
      continue;
    }
    if (Object.keys(node.children).length > 0) {
      output.push(`rmdir : impossible de supprimer '${path}' : Le dossier n'est pas vide`);
      continue;
    }
    delete location.parent.children[location.name];
  }

  return { state: next, output };
}

function cmdCp(state: LinuxState, args: string[]): CommandResult {
  const recursive = args.includes("-r");
  const paths = args.filter((a) => !a.startsWith("-"));
  const [source, destination] = paths;
  if (!source || !destination) return { state, output: ["usage : cp [-r] <source> <destination>"] };

  const next = clone(state);
  const sourceNode = getNode(next.root, resolvePath(state.cwd, source));
  if (!sourceNode) return { state, output: [`cp : impossible d'évaluer '${source}' : Aucun fichier ou dossier de ce type`] };
  if (sourceNode.type === "dir" && !recursive) {
    return { state, output: [`cp : -r non spécifié ; '${source}' est un dossier`] };
  }

  const destSegments = resolvePath(state.cwd, destination);
  const destNode = getNode(next.root, destSegments);
  let finalSegments = destSegments;
  if (destNode && destNode.type === "dir") {
    finalSegments = [...destSegments, source.split("/").pop()!];
  }

  const location = getParentDir(next.root, finalSegments);
  if (!location) return { state, output: [`cp : impossible de créer '${destination}' : Aucun fichier ou dossier de ce type`] };

  location.parent.children[location.name] = clone(sourceNode);
  return { state: next, output: [] };
}

function cmdMv(state: LinuxState, args: string[]): CommandResult {
  const [source, destination] = args;
  if (!source || !destination) return { state, output: ["usage : mv <source> <destination>"] };

  const next = clone(state);
  const sourceSegments = resolvePath(state.cwd, source);
  const sourceNode = getNode(next.root, sourceSegments);
  const sourceLocation = getParentDir(next.root, sourceSegments);
  if (!sourceNode || !sourceLocation) {
    return { state, output: [`mv : impossible d'évaluer '${source}' : Aucun fichier ou dossier de ce type`] };
  }

  const destSegments = resolvePath(state.cwd, destination);
  const destNode = getNode(next.root, destSegments);
  let finalSegments = destSegments;
  if (destNode && destNode.type === "dir") {
    finalSegments = [...destSegments, source.split("/").pop()!];
  }

  const finalLocation = getParentDir(next.root, finalSegments);
  if (!finalLocation) return { state, output: [`mv : impossible de déplacer vers '${destination}'`] };

  finalLocation.parent.children[finalLocation.name] = sourceNode;
  delete sourceLocation.parent.children[sourceLocation.name];

  return { state: next, output: [] };
}

function cmdHeadTail(state: LinuxState, args: string[], mode: "head" | "tail"): CommandResult {
  let count = 10;
  const nIndex = args.indexOf("-n");
  let paths = args;
  if (nIndex >= 0) {
    count = Number(args[nIndex + 1]) || 10;
    paths = args.filter((_, i) => i !== nIndex && i !== nIndex + 1);
  }
  const [path] = paths;
  if (!path) return { state, output: [`usage : ${mode} [-n N] <fichier>`] };

  const node = getNode(state.root, resolvePath(state.cwd, path));
  if (!node) return { state, output: [`${mode} : impossible d'ouvrir '${path}' : Aucun fichier ou dossier de ce type`] };
  if (node.type !== "file") return { state, output: [`${mode} : erreur lors de la lecture de '${path}' : Est un dossier`] };

  const lines = lastSegment(node.content);
  const result = mode === "head" ? lines.slice(0, count) : lines.slice(-count);
  return { state, output: result };
}

function cmdGrep(state: LinuxState, args: string[]): CommandResult {
  const ignoreCase = args.includes("-i");
  const paths = args.filter((a) => !a.startsWith("-"));
  const [pattern, path] = paths;
  if (!pattern || !path) return { state, output: ["usage : grep [-i] <motif> <fichier>"] };

  const node = getNode(state.root, resolvePath(state.cwd, path));
  if (!node) return { state, output: [`grep : ${path} : Aucun fichier ou dossier de ce type`] };
  if (node.type !== "file") return { state, output: [`grep : ${path} : Est un dossier`] };

  const needle = ignoreCase ? pattern.toLowerCase() : pattern;
  const matches = lastSegment(node.content).filter((line) => (ignoreCase ? line.toLowerCase() : line).includes(needle));
  return { state, output: matches };
}

function cmdFind(state: LinuxState, args: string[]): CommandResult {
  const nameIndex = args.indexOf("-name");
  const startPath = args[0] && !args[0].startsWith("-") ? args[0] : ".";
  const pattern = nameIndex >= 0 ? args[nameIndex + 1] : undefined;

  const startSegments = resolvePath(state.cwd, startPath);
  const startNode = getNode(state.root, startSegments);
  if (!startNode) return { state, output: [`find : '${startPath}' : Aucun fichier ou dossier de ce type`] };

  const regex = pattern ? new RegExp(`^${pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`) : null;

  const results: string[] = [];
  function walk(node: FsNode, segments: string[]) {
    const label = pathLabel(segments);
    const name = segments[segments.length - 1] ?? "";
    if (!regex || regex.test(name)) results.push(label);
    if (node.type === "dir") {
      for (const [childName, child] of Object.entries(node.children)) {
        walk(child, [...segments, childName]);
      }
    }
  }
  walk(startNode, startSegments);

  return { state, output: results.length > 0 ? results : ["(aucun résultat)"] };
}

function cmdWc(state: LinuxState, args: string[]): CommandResult {
  const linesOnly = args.includes("-l");
  const [path] = args.filter((a) => !a.startsWith("-"));
  if (!path) return { state, output: ["usage : wc [-l] <fichier>"] };

  const node = getNode(state.root, resolvePath(state.cwd, path));
  if (!node) return { state, output: [`wc : ${path} : Aucun fichier ou dossier de ce type`] };
  if (node.type !== "file") return { state, output: [`wc : ${path} : Est un dossier`] };

  const lines = lastSegment(node.content);
  if (linesOnly) return { state, output: [`${lines.length} ${path}`] };

  const words = node.content.trim().split(/\s+/).filter(Boolean).length;
  const chars = node.content.length;
  return { state, output: [`${lines.length} ${words} ${chars} ${path}`] };
}
