import { useRef, useState, type KeyboardEvent } from "react";
import {
  CLEAR_SIGNAL,
  createInitialState,
  getPromptPath,
  HOSTNAME,
  runCommand,
  USERNAME,
  type LinuxState,
} from "../../lib/linuxSimulator";

interface HistoryEntry {
  command: string;
  output: string[];
}

const WELCOME: HistoryEntry = {
  command: "",
  output: [
    "Bienvenue dans le simulateur de terminal Linux !",
    "Vous travaillez sur un système de fichiers virtuel, en mémoire — aucune commande n'agit sur votre machine.",
    "Tapez 'help' pour voir les commandes disponibles.",
  ],
};

export function LinuxLabPage() {
  const [fs, setFs] = useState<LinuxState>(() => createInitialState());
  const [history, setHistory] = useState<HistoryEntry[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function execute(command: string) {
    const result = runCommand(fs, command);
    if (result.output[0] === CLEAR_SIGNAL) {
      setHistory([]);
    } else {
      setHistory((prev) => [...prev, { command, output: result.output }]);
    }
    setFs(result.state);
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

  const prompt = `${USERNAME}@${HOSTNAME}:${getPromptPath(fs.cwd)}$`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Simulateur de terminal Linux</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pratiquez les commandes de base (ls, cd, cat, mkdir, rm, grep, find...) sur un système de fichiers
        virtuel en mémoire — aucune commande shell réelle n'est exécutée.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="border-b border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400">Terminal</div>
        <div className="h-[32rem] overflow-y-auto px-3 py-2 font-mono text-sm text-slate-100" onClick={() => inputRef.current?.focus()}>
          {history.map((entry, i) => (
            <div key={i} className="mb-1">
              {entry.command && (
                <p className="text-emerald-400">
                  <span className="text-sky-400">{prompt}</span> {entry.command}
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
            <span className="text-sky-400">{prompt}</span>
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
    </div>
  );
}
