import { useRef, useState, type KeyboardEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  CLEAR_SIGNAL,
  initialRepoState,
  runCommand,
  shortId,
  type GitRepoState,
} from "../../lib/gitSimulator";

interface HistoryEntry {
  command: string;
  output: string[];
}

const WELCOME: HistoryEntry = {
  command: "",
  output: [
    "Bienvenue dans le simulateur Git ! Aucune commande n'agit sur votre système réel.",
    "Tapez 'help' pour voir les commandes disponibles, en commençant par 'git init'.",
  ],
};

export function GitLabPage() {
  const [repo, setRepo] = useState<GitRepoState>(initialRepoState);
  const [history, setHistory] = useState<HistoryEntry[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function execute(command: string) {
    const result = runCommand(repo, command);
    if (result.output[0] === CLEAR_SIGNAL) {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, { command, output: result.output }]);
    }
    setRepo(result.state);
  }

  function handleSubmit() {
    const command = input.trim();
    if (!command) return;
    execute(command);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryCursor(null);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextCursor = historyCursor === null ? commandHistory.length - 1 : Math.max(0, historyCursor - 1);
      setHistoryCursor(nextCursor);
      setInput(commandHistory[nextCursor]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyCursor === null) return;
      const nextCursor = historyCursor + 1;
      if (nextCursor >= commandHistory.length) {
        setHistoryCursor(null);
        setInput("");
      } else {
        setHistoryCursor(nextCursor);
        setInput(commandHistory[nextCursor]);
      }
    }
  }

  function updateFile(path: string, content: string) {
    setRepo((prev) => ({ ...prev, files: { ...prev.files, [path]: content } }));
  }

  function addFile() {
    const name = newFileName.trim();
    if (!name || name in repo.files) return;
    setRepo((prev) => ({ ...prev, files: { ...prev.files, [name]: "" } }));
    setNewFileName("");
  }

  function removeFile(path: string) {
    setRepo((prev) => {
      const files = { ...prev.files };
      delete files[path];
      return { ...prev, files };
    });
  }

  const currentBranch = repo.head.type === "branch" ? repo.head.name : `(détaché ${shortId(repo.head.commitId)})`;
  const promptLabel = repo.initialized ? `projet (${currentBranch})` : "projet";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Simulateur Git</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pratiquez les commandes Git de base (init, add, commit, branch, checkout, merge, log...) dans un
        environnement entièrement simulé — aucune commande shell réelle n'est exécutée.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
          <div className="border-b border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400">Terminal</div>
          <div
            className="h-[28rem] overflow-y-auto px-3 py-2 font-mono text-sm text-slate-100"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((entry, i) => (
              <div key={i} className="mb-1">
                {entry.command && (
                  <p className="text-emerald-400">
                    <span className="text-slate-500">{promptLabel}$ </span>
                    {entry.command}
                  </p>
                )}
                {entry.output.map((line, j) => (
                  <p key={j} className="whitespace-pre-wrap text-slate-300">
                    {line}
                  </p>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-slate-500">{promptLabel}$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                className="flex-1 bg-transparent text-emerald-400 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Branches</h2>
            {!repo.initialized ? (
              <p className="mt-2 text-xs text-slate-400">Lancez "git init" pour commencer.</p>
            ) : Object.keys(repo.branches).length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">Aucune branche.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {Object.entries(repo.branches)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([name, commitId]) => (
                    <li key={name} className="flex items-center justify-between font-mono text-xs">
                      <span className={repo.head.type === "branch" && repo.head.name === name ? "font-bold text-brand-700" : "text-slate-700"}>
                        {repo.head.type === "branch" && repo.head.name === name ? "* " : "  "}
                        {name}
                      </span>
                      <span className="text-slate-400">{commitId ? shortId(commitId) : "—"}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Fichiers du répertoire de travail</h2>
            <div className="mt-2 flex flex-col gap-3">
              {Object.keys(repo.files)
                .sort()
                .map((path) => (
                  <div key={path}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-slate-700">{path}</span>
                      <button onClick={() => removeFile(path)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <textarea
                      value={repo.files[path]}
                      onChange={(e) => updateFile(path, e.target.value)}
                      spellCheck={false}
                      className="mt-1 h-20 w-full resize-none rounded-md border border-slate-200 p-2 font-mono text-xs focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFile()}
                placeholder="nom-du-fichier.txt"
                className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs focus:border-brand-400 focus:outline-none"
              />
              <button
                onClick={addFile}
                className="flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
