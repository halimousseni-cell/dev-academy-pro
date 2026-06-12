import { useState } from "react";
import { Puzzle, ArrowUp, ArrowDown, CheckCircle2, XCircle, Eye } from "lucide-react";
import { PUZZLE_CHALLENGES, type PuzzleChallenge } from "../../lib/games/puzzleData";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffledLines(challenge: PuzzleChallenge): string[] {
  let attempt = shuffle(challenge.lines);
  let tries = 0;
  while (attempt.join("\n") === challenge.lines.join("\n") && tries < 10) {
    attempt = shuffle(challenge.lines);
    tries++;
  }
  return attempt;
}

export function PuzzleJsPage() {
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<string[]>(() => shuffledLines(PUZZLE_CHALLENGES[0]));
  const [checked, setChecked] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState(0);

  const challenge = PUZZLE_CHALLENGES[index];
  const isCorrect = order.join("\n") === challenge.lines.join("\n");

  function moveLine(i: number, direction: -1 | 1) {
    const j = i + direction;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(null);
  }

  function handleCheck() {
    setChecked(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  }

  function loadChallenge(i: number) {
    setIndex(i);
    setOrder(shuffledLines(PUZZLE_CHALLENGES[i]));
    setChecked(null);
    setShowSolution(false);
  }

  function handleNext() {
    if (index + 1 >= PUZZLE_CHALLENGES.length) {
      loadChallenge(0);
      return;
    }
    loadChallenge(index + 1);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Puzzle className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Puzzle JS</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Réordonnez les lignes pour reconstituer un programme valide, à l'aide des flèches.
      </p>
      <p className="mt-2 text-xs font-medium text-slate-400">
        Puzzle {index + 1} / {PUZZLE_CHALLENGES.length} — Score : {score}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">{challenge.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{challenge.description}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-2 font-mono text-sm">
          {(showSolution ? challenge.lines : order).map((line, i) => (
            <div key={i} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-slate-50">
              <span className="select-none text-slate-400">{i + 1}</span>
              <span className="flex-1 whitespace-pre text-slate-800">{line || " "}</span>
              {!showSolution && (
                <div className="flex flex-col">
                  <button onClick={() => moveLine(i, -1)} className="text-slate-400 hover:text-brand-600" aria-label="Monter">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveLine(i, 1)} className="text-slate-400 hover:text-brand-600" aria-label="Descendre">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {checked !== null && (
        <div className={`mt-4 rounded-xl border p-4 text-sm ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          <p className="flex items-center gap-1.5 font-semibold">
            {checked ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {checked ? "Bravo, l'ordre est correct !" : "L'ordre n'est pas correct, réessayez."}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleCheck}
          className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Vérifier
        </button>
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
          {showSolution ? "Masquer la solution" : "Voir la solution"}
        </button>
        {checked && (
          <button
            onClick={handleNext}
            className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Puzzle suivant
          </button>
        )}
      </div>
    </div>
  );
}
