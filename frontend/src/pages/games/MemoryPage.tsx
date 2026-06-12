import { useMemo, useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
import { MEMORY_PAIRS, buildDeck, shuffle, type MemoryCard } from "../../lib/games/memoryData";

function newDeck(): MemoryCard[] {
  return shuffle(buildDeck(MEMORY_PAIRS));
}

export function MemoryPage() {
  const [deck, setDeck] = useState<MemoryCard[]>(() => newDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const isWon = matched.size === MEMORY_PAIRS.length;

  const matchedPairs = useMemo(() => matched.size, [matched]);

  function handleFlip(index: number) {
    if (locked) return;
    if (flipped.includes(index)) return;
    if (matched.has(deck[index].pairId) && flipped.length === 0) return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = next;
      const cardA = deck[a];
      const cardB = deck[b];

      if (cardA.pairId === cardB.pairId && cardA.kind !== cardB.kind) {
        setTimeout(() => {
          setMatched((prev) => new Set(prev).add(cardA.pairId));
          setFlipped([]);
          setLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  function handleRestart() {
    setDeck(newDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Memory — Concepts de sécurité</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Retrouvez les paires terme / définition. Cliquez sur deux cartes pour les retourner.
      </p>
      <p className="mt-2 text-xs font-medium text-slate-400">
        Coups joués : {moves} — Paires trouvées : {matchedPairs} / {MEMORY_PAIRS.length}
      </p>

      {isWon && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Bravo, toutes les paires sont trouvées en {moves} coups !</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {deck.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.has(card.pairId);
          return (
            <button
              key={card.cardId}
              onClick={() => handleFlip(index)}
              disabled={matched.has(card.pairId)}
              className={`flex h-28 items-center justify-center rounded-xl border p-2 text-center text-sm font-medium shadow-sm transition ${
                matched.has(card.pairId)
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : isFlipped
                    ? "border-brand-300 bg-brand-50 text-slate-800"
                    : "border-slate-200 bg-white text-2xl text-slate-300 hover:border-brand-300"
              }`}
            >
              {isFlipped ? card.text : "?"}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleRestart}
        className="mt-4 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <RotateCcw className="h-4 w-4" />
        Recommencer
      </button>
    </div>
  );
}
