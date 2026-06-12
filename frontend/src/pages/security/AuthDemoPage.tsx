import { useState } from "react";
import { ShieldAlert, ShieldCheck, Lock, Zap } from "lucide-react";
import {
  ACCOUNT,
  attemptLogin,
  checkPasswordPolicy,
  createInitialState,
  reset,
  runBruteForce,
  toggleProtection,
  type AuthState,
} from "../../lib/authDemo";

export function AuthDemoPage() {
  const [state, setState] = useState<AuthState>(() => createInitialState());
  const [username, setUsername] = useState(ACCOUNT.username);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const passwordCheck = checkPasswordPolicy(newPassword, state.protectionEnabled);

  function handleLogin() {
    setState((prev) => attemptLogin(prev, username, password));
  }

  function handleBruteForce() {
    setState((prev) => runBruteForce(prev, username));
  }

  function handleToggle() {
    setState((prev) => toggleProtection(prev));
  }

  function handleReset() {
    setState((prev) => reset(prev));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Authentification défaillante</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cette catégorie regroupe les failles liées à l'identification et à la gestion des sessions :
        absence de limitation des tentatives de connexion (force brute), politiques de mots de passe
        faibles, sessions mal protégées. Démonstration entièrement simulée en mémoire.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Le problème</h2>
          <p className="mt-1">
            Sans limitation du nombre de tentatives, un attaquant peut tester automatiquement des milliers
            de mots de passe (force brute / "credential stuffing") jusqu'à trouver le bon. Si l'application
            accepte des mots de passe faibles ou très répandus (<code>123456</code>, <code>password</code>...),
            ces attaques deviennent encore plus rapides.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Limiter le nombre de tentatives et verrouiller temporairement le compte (rate limiting).</li>
            <li>Imposer une politique de mot de passe (longueur, complexité, listes de mots interdits).</li>
            <li>Proposer l'authentification multi-facteurs (MFA / TOTP).</li>
            <li>Utiliser des sessions avec identifiants aléatoires, courte durée de vie, régénérés à la connexion.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Protection (rate limiting + politique de mot de passe)</p>
          <p className="text-xs text-slate-500">
            {state.protectionEnabled
              ? `Activée : verrouillage après ${5} tentatives échouées, mots de passe faibles refusés.`
              : "Désactivée : tentatives illimitées, n'importe quel mot de passe est accepté pour le changement."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold text-white ${
              state.protectionEnabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {state.protectionEnabled ? "Protection activée" : "Protection désactivée"}
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <Lock className="h-4 w-4 text-brand-600" />
          Connexion
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Compte existant : <code className="rounded bg-slate-100 px-1">{ACCOUNT.username} / {ACCOUNT.password}</code>
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              spellCheck={false}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Mot de passe</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              spellCheck={false}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleLogin}
            className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Se connecter
          </button>
          <button
            onClick={handleBruteForce}
            className="flex items-center gap-1.5 rounded-md border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <Zap className="h-3.5 w-3.5" />
            Lancer une attaque par force brute
          </button>
        </div>
        {state.locked && (
          <p className="mt-2 text-sm font-semibold text-red-600">Compte verrouillé suite à trop de tentatives échouées.</p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          Journal des tentatives
        </div>
        <div className="max-h-60 overflow-y-auto p-3 text-sm">
          {state.log.length === 0 && <p className="text-slate-400">Aucune tentative pour le moment.</p>}
          <ul className="space-y-1">
            {state.log
              .slice()
              .reverse()
              .map((entry, i) => (
                <li key={i} className="flex items-start gap-2 font-mono text-xs">
                  {entry.outcome === "success" ? (
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <ShieldAlert className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${entry.outcome === "blocked" ? "text-amber-500" : "text-red-500"}`} />
                  )}
                  <span
                    className={
                      entry.outcome === "success"
                        ? "text-emerald-700"
                        : entry.outcome === "blocked"
                          ? "text-amber-700"
                          : "text-red-700"
                    }
                  >
                    {entry.message}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Changer de mot de passe</h2>
        <p className="mt-1 text-xs text-slate-500">
          Avec la protection désactivée, n'importe quel mot de passe (même <code>123456</code>) est accepté.
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            spellCheck={false}
            placeholder="Nouveau mot de passe"
            className="rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        {newPassword.length > 0 && (
          <div className="mt-2 text-sm">
            {passwordCheck.valid ? (
              <p className="font-semibold text-emerald-600">Mot de passe accepté.</p>
            ) : (
              <>
                <p className="font-semibold text-red-600">Mot de passe refusé :</p>
                <ul className="mt-1 list-inside list-disc text-xs text-red-600">
                  {passwordCheck.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
