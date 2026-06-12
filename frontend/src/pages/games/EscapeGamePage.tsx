import { useEffect, useState } from "react";
import { DoorOpen, CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";
import { ESCAPE_STEPS, checkAnswer } from "../../lib/games/escapeGameData";

export function EscapeGamePage() {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = ESCAPE_STEPS[index];

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [finished]);

  function formatTime(total: number) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checkAnswer(step, value)) {
      setError(false);
      if (index + 1 >= ESCAPE_STEPS.length) {
        setFinished(true);
        return;
      }
      setIndex((i) => i + 1);
      setValue("");
      setShowHint(false);
    } else {
      setError(true);
    }
  }

  function handleHint() {
    if (!showHint) {
      setHintsUsed((h) => h + 1);
    }
    setShowHint(true);
  }

  function handleRestart() {
    setIndex(0);
    setValue("");
    setError(false);
    setShowHint(false);
    setHintsUsed(0);
    setSeconds(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900">Vous vous êtes échappé !</h1>
        </div>
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900">
          <p className="text-lg font-semibold">Bravo !</p>
          <p className="mt-1 text-sm">
            Temps total : {formatTime(seconds)} — Indices utilisés : {hintsUsed}
          </p>
          <button
            onClick={handleRestart}
            className="mt-4 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-brand-600" />
          <h1 className="text-2xl font-bold text-slate-900">Escape Game — Salle des serveurs</h1>
        </div>
        <span className="text-sm font-mono text-slate-500">{formatTime(seconds)}</span>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-400">
        Énigme {index + 1} / {ESCAPE_STEPS.length}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">{step.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{step.narrative}</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="text-sm font-medium text-slate-700">{step.question}</label>
          <div className="mt-1 flex gap-2">
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              placeholder="Votre réponse..."
            />
            <button
              type="submit"
              className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Valider
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-600">Ce n'est pas la bonne réponse, réessayez.</p>
        )}

        <button
          onClick={handleHint}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          <Lightbulb className="h-4 w-4" />
          {showHint ? "Indice affiché" : "Afficher un indice"}
        </button>
        {showHint && (
          <p className="mt-1 rounded-md bg-amber-50 p-2 text-sm text-amber-800">{step.hint}</p>
        )}
      </div>

      <div className="mt-4 flex gap-1.5">
        {ESCAPE_STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full ${i < index ? "bg-emerald-500" : i === index ? "bg-brand-500" : "bg-slate-200"}`}
          />
        ))}
      </div>
      {index > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          {index} énigme(s) résolue(s)
        </p>
      )}
    </div>
  );
}
