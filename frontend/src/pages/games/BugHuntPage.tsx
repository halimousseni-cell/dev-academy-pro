import { useState } from "react";
import { Bug, CheckCircle2, XCircle } from "lucide-react";
import { BUG_HUNT_CHALLENGES } from "../../lib/games/bugHuntData";

export function BugHuntPage() {
  const [index, setIndex] = useState(0);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const challenge = BUG_HUNT_CHALLENGES[index];
  const isCorrect = answered && selectedLine === challenge.buggyLineIndex;

  function handleSelectLine(lineIndex: number) {
    if (answered) return;
    setSelectedLine(lineIndex);
  }

  function handleSubmit() {
    if (selectedLine === null) return;
    setAnswered(true);
    if (selectedLine === challenge.buggyLineIndex) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (index + 1 >= BUG_HUNT_CHALLENGES.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelectedLine(null);
    setAnswered(false);
  }

  function handleRestart() {
    setIndex(0);
    setSelectedLine(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Chasse aux bugs — Résultat</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-3xl font-bold text-brand-700">
            {score} / {BUG_HUNT_CHALLENGES.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">bugs correctement identifiés.</p>
          <button
            onClick={handleRestart}
            className="mt-4 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Bug className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Chasse aux bugs</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Cliquez sur la ligne qui contient le bug ou la faille de sécurité, puis validez.
      </p>
      <p className="mt-2 text-xs font-medium text-slate-400">
        Snippet {index + 1} / {BUG_HUNT_CHALLENGES.length} — Score : {score}
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          {challenge.title} — {challenge.language}
        </div>
        <div className="p-2 font-mono text-sm">
          {challenge.lines.map((line, i) => {
            const isBuggy = answered && i === challenge.buggyLineIndex;
            const isWrongSelection = answered && i === selectedLine && i !== challenge.buggyLineIndex;
            return (
              <button
                key={i}
                onClick={() => handleSelectLine(i)}
                className={`flex w-full items-start gap-3 rounded px-2 py-1 text-left ${
                  isBuggy
                    ? "bg-emerald-100"
                    : isWrongSelection
                      ? "bg-red-100"
                      : selectedLine === i
                        ? "bg-brand-50"
                        : "hover:bg-slate-50"
                }`}
              >
                <span className="select-none text-slate-400">{i + 1}</span>
                <span className="whitespace-pre text-slate-800">{line || " "}</span>
              </button>
            );
          })}
        </div>
      </div>

      {answered ? (
        <div className={`mt-4 rounded-xl border p-4 text-sm ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          <p className="flex items-center gap-1.5 font-semibold">
            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isCorrect ? "Bonne réponse !" : "Ce n'est pas la bonne ligne."}
          </p>
          <p className="mt-1">{challenge.explanation}</p>
          <button
            onClick={handleNext}
            className="mt-3 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {index + 1 >= BUG_HUNT_CHALLENGES.length ? "Voir le résultat" : "Snippet suivant"}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={selectedLine === null}
          className="mt-4 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Valider
        </button>
      )}
    </div>
  );
}
