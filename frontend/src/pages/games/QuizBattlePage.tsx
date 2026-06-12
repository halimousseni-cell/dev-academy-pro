import { useEffect, useState } from "react";
import { Swords, Trophy, RotateCcw, User, Bot } from "lucide-react";
import {
  QUIZ_BATTLE_QUESTIONS,
  QUESTION_TIME_SECONDS,
  computePoints,
  botAnswer,
} from "../../lib/games/quizBattleData";

type Phase = "question" | "feedback" | "finished";

export function QuizBattlePage() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIME_SECONDS);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [botResult, setBotResult] = useState<{ correct: boolean; remainingSeconds: number } | null>(null);

  const question = QUIZ_BATTLE_QUESTIONS[index];

  useEffect(() => {
    if (phase !== "question") return;
    if (secondsLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  function handleAnswer(optionIndex: number | null) {
    if (phase !== "question") return;
    setSelected(optionIndex);

    const correct = optionIndex === question.correctIndex;
    if (correct) {
      setPlayerScore((s) => s + computePoints(secondsLeft));
    }

    const bot = botAnswer();
    setBotResult(bot);
    if (bot.correct) {
      setBotScore((s) => s + computePoints(bot.remainingSeconds));
    }

    setPhase("feedback");
  }

  function handleNext() {
    if (index + 1 >= QUIZ_BATTLE_QUESTIONS.length) {
      setPhase("finished");
      return;
    }
    setIndex((i) => i + 1);
    setSecondsLeft(QUESTION_TIME_SECONDS);
    setSelected(null);
    setBotResult(null);
    setPhase("question");
  }

  function handleRestart() {
    setIndex(0);
    setPhase("question");
    setSecondsLeft(QUESTION_TIME_SECONDS);
    setPlayerScore(0);
    setBotScore(0);
    setSelected(null);
    setBotResult(null);
  }

  if (phase === "finished") {
    const playerWins = playerScore > botScore;
    const tie = playerScore === botScore;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900">Résultat du Quiz Battle</h1>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <User className="mx-auto h-6 w-6 text-brand-600" />
            <p className="mt-1 font-semibold text-slate-900">Vous</p>
            <p className="text-2xl font-bold text-brand-700">{playerScore}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <Bot className="mx-auto h-6 w-6 text-slate-500" />
            <p className="mt-1 font-semibold text-slate-900">Bot</p>
            <p className="text-2xl font-bold text-slate-700">{botScore}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-700 shadow-sm">
          {tie ? "Match nul !" : playerWins ? "Vous avez gagné le duel !" : "Le bot l'emporte cette fois."}
        </div>
        <button
          onClick={handleRestart}
          className="mx-auto mt-4 flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <RotateCcw className="h-4 w-4" />
          Rejouer
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Swords className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Quiz Battle</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Répondez le plus vite possible : plus vous répondez vite (et juste), plus vous marquez de points.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <User className="h-4 w-4 text-brand-600" />
          <span className="text-sm font-medium text-slate-700">Vous : {playerScore}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Bot className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Bot : {botScore}</span>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-400">
        Question {index + 1} / {QUIZ_BATTLE_QUESTIONS.length} — Temps restant : {secondsLeft}s
      </p>

      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">{question.question}</h2>
        <div className="mt-3 grid gap-2">
          {question.options.map((option, i) => {
            const isCorrect = phase === "feedback" && i === question.correctIndex;
            const isWrongSelected = phase === "feedback" && i === selected && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={phase !== "question"}
                className={`rounded-md border px-3 py-2 text-left text-sm ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : isWrongSelected
                      ? "border-red-300 bg-red-50 text-red-900"
                      : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {selected === question.correctIndex ? (
              <p className="text-emerald-700">
                Bonne réponse ! +{computePoints(secondsLeft)} points.
              </p>
            ) : (
              <p className="text-red-700">
                {selected === null ? "Temps écoulé." : "Mauvaise réponse."} La bonne réponse était : "
                {question.options[question.correctIndex]}".
              </p>
            )}
            {botResult && (
              <p className="mt-1">
                Le bot a {botResult.correct ? `répondu correctement (+${computePoints(botResult.remainingSeconds)} points)` : "répondu incorrectement"}.
              </p>
            )}
            <button
              onClick={handleNext}
              className="mt-3 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {index + 1 >= QUIZ_BATTLE_QUESTIONS.length ? "Voir le résultat" : "Question suivante"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
