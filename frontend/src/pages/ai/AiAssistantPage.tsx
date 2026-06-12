import { useState } from "react";
import { Sparkles, Info, Send, Loader2 } from "lucide-react";
import {
  ASSISTANT_TOPICS,
  askAssistant,
  type AssistantMode,
  type AssistantResponse,
} from "../../lib/ai/aiAssistant";

const MODES: { id: AssistantMode; label: string; placeholder: string }[] = [
  {
    id: "expliquer",
    label: "Expliquer du code",
    placeholder: "Collez ici l'extrait de code à expliquer...",
  },
  {
    id: "corriger",
    label: "Corriger du code",
    placeholder: "Collez ici l'extrait de code à corriger...",
  },
  {
    id: "exercice",
    label: "Générer un exercice",
    placeholder: "",
  },
];

interface HistoryEntry {
  mode: AssistantMode;
  input: string;
  response: AssistantResponse;
}

export function AiAssistantPage() {
  const [mode, setMode] = useState<AssistantMode>("expliquer");
  const [code, setCode] = useState("");
  const [topic, setTopic] = useState(ASSISTANT_TOPICS[0].id);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentMode = MODES.find((m) => m.id === mode)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const response = askAssistant(mode, code, topic);
      setHistory((h) => [{ mode, input: mode === "exercice" ? topic : code, response }, ...h]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Assistant IA</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Obtenez des explications, des suggestions de correction ou des exercices générés automatiquement.
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Mode démonstration : les réponses sont générées localement par des règles simples, sans appel à un
          service d'IA externe. Une vraie intégration (OpenAI/Anthropic) pourra être branchée plus tard sans
          changer l'interface.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              mode === m.id ? "bg-brand-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {mode === "exercice" ? (
          <div>
            <label className="text-sm font-medium text-slate-700">Thème</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
            >
              {ASSISTANT_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium text-slate-700">Extrait de code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
              placeholder={currentMode.placeholder}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-3 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? "Analyse en cours..." : "Envoyer"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {history.map((entry, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {MODES.find((m) => m.id === entry.mode)?.label}
            </p>
            {entry.mode !== "exercice" && entry.input.trim() && (
              <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-700">
                {entry.input}
              </pre>
            )}
            <p className="mt-2 font-semibold text-slate-900">{entry.response.summary}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{entry.response.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
