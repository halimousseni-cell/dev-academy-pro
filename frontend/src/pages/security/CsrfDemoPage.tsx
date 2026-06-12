import { useState } from "react";
import { ShieldAlert, ShieldCheck, Landmark, Gift } from "lucide-react";
import { createInitialState, toggleProtection, transferFromApp, transferFromAttackerSite, type CsrfState } from "../../lib/csrfDemo";

const ATTACKER_AMOUNT = 1000;
const APP_AMOUNT = 50;

export function CsrfDemoPage() {
  const [state, setState] = useState<CsrfState>(() => createInitialState());

  function handleToggle() {
    setState(toggleProtection(state));
  }

  function handleAppTransfer() {
    setState(transferFromApp(state, APP_AMOUNT, "Bob (ami)"));
  }

  function handleAttackerClick() {
    setState(transferFromAttackerSite(state, ATTACKER_AMOUNT, "compte de l'attaquant"));
  }

  function handleReset() {
    setState(createInitialState());
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">CSRF — Cross-Site Request Forgery</h1>
      <p className="mt-1 text-sm text-slate-500">
        Le CSRF consiste à faire exécuter une action sensible (virement, changement de mot de passe...) par
        le navigateur d'une victime déjà authentifiée, sans son consentement, en utilisant le cookie de
        session envoyé automatiquement par le navigateur. Cette démonstration est entièrement simulée en
        mémoire — aucun vrai cookie ni vraie requête réseau n'est utilisé.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Le problème</h2>
          <p className="mt-1">
            Si l'utilisateur est connecté à <code>banque.exemple</code> (cookie de session actif) et visite
            un site malveillant, ce dernier peut soumettre un formulaire vers{" "}
            <code>banque.exemple/virement</code>. Le navigateur joint automatiquement le cookie de session :
            si l'application ne vérifie que le cookie, la requête est traitée comme légitime.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Jeton anti-CSRF unique par session, vérifié côté serveur pour chaque action sensible.</li>
            <li>Cookies de session avec l'attribut <code>SameSite=Strict</code> ou <code>Lax</code>.</li>
            <li>Vérifier l'en-tête <code>Origin</code> / <code>Referer</code> des requêtes sensibles.</li>
            <li>Demander une ré-authentification pour les actions critiques.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-slate-800">Protection CSRF (jeton anti-CSRF)</p>
          <p className="text-xs text-slate-500">
            {state.protectionEnabled
              ? "Activée : chaque virement doit inclure le jeton CSRF de la session."
              : "Désactivée : l'application ne vérifie que le cookie de session."}
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
            <Landmark className="h-4 w-4 text-brand-600" />
            <span className="text-xs font-semibold text-slate-700">banque.exemple — Votre compte</span>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500">Session active (cookie envoyé automatiquement à chaque requête)</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{state.balance.toLocaleString("fr-FR")} €</p>
            {state.protectionEnabled && (
              <p className="mt-2 break-all rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-500">
                Jeton CSRF de session : {state.csrfToken}
              </p>
            )}
            <button
              onClick={handleAppTransfer}
              className="mt-3 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Virer {APP_AMOUNT} € à Bob (ami)
            </button>
            <p className="mt-1 text-xs text-slate-400">Action légitime, déclenchée volontairement avec le bon jeton.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-red-200 bg-red-50 px-3 py-1.5">
            <Gift className="h-4 w-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700">site-piege.exemple — Vous avez gagné !</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-700">
              Félicitations, vous avez gagné un cadeau ! Cliquez ci-dessous pour le récupérer...
            </p>
            <p className="mt-2 text-xs text-slate-400">
              (En réalité, ce bouton soumet un formulaire caché vers{" "}
              <code>banque.exemple/virement</code> en comptant sur le cookie de session de la victime.)
            </p>
            <button
              onClick={handleAttackerClick}
              className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Réclamer mon cadeau
            </button>
            <p className="mt-1 text-xs text-slate-400">
              Tente un virement caché de {ATTACKER_AMOUNT} € vers le compte de l'attaquant.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
          Journal d'activité
        </div>
        <div className="max-h-60 overflow-y-auto p-3 text-sm">
          {state.log.length === 0 && <p className="text-slate-400">Aucune action pour le moment.</p>}
          <ul className="space-y-2">
            {state.log
              .slice()
              .reverse()
              .map((entry, i) => (
                <li key={i} className="flex items-start gap-2">
                  {entry.source === "attacker" && entry.outcome === "success" ? (
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  ) : (
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                  <span className={entry.source === "attacker" && entry.outcome === "success" ? "text-red-700" : "text-slate-700"}>
                    {entry.message}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
