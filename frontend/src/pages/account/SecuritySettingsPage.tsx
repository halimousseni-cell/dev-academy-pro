import { useCallback, useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import type { SecurityOverview } from "../../types";

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Connexion réussie",
  LOGIN_FAILED: "Tentative de connexion échouée",
  LOGIN_MFA_REQUIRED: "Connexion (vérification 2FA requise)",
  MFA_LOGIN_SUCCESS: "Connexion avec code 2FA",
  MFA_LOGIN_FAILED: "Code 2FA invalide",
  MFA_ENABLED: "Activation de la 2FA",
  MFA_DISABLED: "Désactivation de la 2FA",
  MFA_DISABLE_FAILED: "Tentative de désactivation de la 2FA échouée",
  RECOVERY_CODE_USED: "Code de récupération utilisé",
  NEW_DEVICE_LOGIN: "Connexion depuis un nouvel appareil",
  REGISTER: "Création du compte",
  REFRESH_TOKEN_REUSE_DETECTED: "Anomalie détectée sur une session",
  SESSION_REVOKED: "Session révoquée",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function describeAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function errorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data?.error) {
    return err.response.data.error;
  }
  return fallback;
}

type MfaSetupState = { secret: string; otpauthUri: string } | null;

export function SecuritySettingsPage() {
  const { refreshUser } = useAuth();
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [setup, setSetup] = useState<MfaSetupState>(null);
  const [setupCode, setSetupCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaBusy, setMfaBusy] = useState(false);

  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const loadOverview = useCallback(() => {
    return api
      .get<SecurityOverview>("/users/security")
      .then((res) => setOverview(res.data))
      .catch(() => setError("Impossible de charger les informations de sécurité."));
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  async function handleStartSetup() {
    setMfaError(null);
    setMfaBusy(true);
    try {
      const res = await api.post<{ secret: string; otpauthUri: string }>("/auth/mfa/setup");
      setSetup(res.data);
      setRecoveryCodes(null);
      setSetupCode("");
    } catch (err) {
      setMfaError(errorMessage(err, "Impossible d'initialiser la 2FA."));
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleConfirmSetup(e: FormEvent) {
    e.preventDefault();
    setMfaError(null);
    setMfaBusy(true);
    try {
      const res = await api.post<{ recoveryCodes: string[] }>("/auth/mfa/verify", { code: setupCode });
      setRecoveryCodes(res.data.recoveryCodes);
      setSetup(null);
      await Promise.all([loadOverview(), refreshUser()]);
    } catch (err) {
      setMfaError(errorMessage(err, "Code invalide."));
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleDisable(e: FormEvent) {
    e.preventDefault();
    setMfaError(null);
    setMfaBusy(true);
    try {
      await api.post("/auth/mfa/disable", { password: disablePassword, code: disableCode });
      setShowDisableForm(false);
      setDisablePassword("");
      setDisableCode("");
      setRecoveryCodes(null);
      await Promise.all([loadOverview(), refreshUser()]);
    } catch (err) {
      setMfaError(errorMessage(err, "Mot de passe ou code invalide."));
    } finally {
      setMfaBusy(false);
    }
  }

  async function handleRevokeSession(id: string) {
    setError(null);
    try {
      await api.delete(`/users/security/sessions/${id}`);
      await loadOverview();
    } catch {
      setError("Impossible de révoquer cette session.");
    }
  }

  if (error && !overview) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-red-600">{error}</p>;
  }

  if (!overview) {
    return <p className="mx-auto max-w-3xl px-4 py-8 text-slate-400">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Sécurité du compte</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gérez la double authentification, vos sessions actives et consultez votre activité récente.
      </p>

      {/* Section MFA */}
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            {overview.mfaEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldOff className="h-5 w-5 text-slate-400" />
            )}
            Authentification à deux facteurs (2FA)
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              overview.mfaEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {overview.mfaEnabled ? "Activée" : "Désactivée"}
          </span>
        </div>

        {mfaError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mfaError}</p>}

        {recoveryCodes && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Notez ces codes de récupération : ils ne seront plus affichés.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-slate-800">
              {recoveryCodes.map((code) => (
                <li key={code} className="rounded bg-white px-2 py-1 text-center">
                  {code}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!overview.mfaEnabled && !setup && (
          <button
            onClick={handleStartSetup}
            disabled={mfaBusy}
            className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            Activer la 2FA
          </button>
        )}

        {setup && (
          <form onSubmit={handleConfirmSetup} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy...), ou
              saisissez le secret manuellement.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-md border border-slate-200 p-3">
                <QRCodeSVG value={setup.otpauthUri} size={160} />
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-slate-500">Secret :</span>
                <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs">{setup.secret}</code>
              </div>
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Code de vérification
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="123456"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value)}
                className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={mfaBusy}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setSetup(null)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {overview.mfaEnabled && !showDisableForm && (
          <button
            onClick={() => setShowDisableForm(true)}
            className="mt-4 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Désactiver la 2FA
          </button>
        )}

        {showDisableForm && (
          <form onSubmit={handleDisable} className="mt-4 flex flex-col gap-4 rounded-md border border-slate-200 p-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Mot de passe
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Code 2FA ou code de récupération
              <input
                type="text"
                required
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={mfaBusy}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                Désactiver la 2FA
              </button>
              <button
                type="button"
                onClick={() => setShowDisableForm(false)}
                className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Section Sessions actives */}
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Smartphone className="h-5 w-5 text-slate-500" />
          Sessions actives
        </h2>

        {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <ul className="mt-4 flex flex-col gap-2">
          {overview.sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {session.userAgent ?? "Appareil inconnu"}
                  {session.current && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      Cette session
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {session.ipAddress ?? "IP inconnue"} · Connecté le {formatDate(session.createdAt)}
                </p>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="shrink-0 rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Révoquer
                </button>
              )}
            </li>
          ))}
          {overview.sessions.length === 0 && <p className="text-sm text-slate-400">Aucune session active.</p>}
        </ul>
      </section>

      {/* Section Activité récente */}
      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Activité récente</h2>

        <ul className="mt-4 flex flex-col gap-2">
          {overview.recentActivity.map((entry) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm ${
                entry.action === "NEW_DEVICE_LOGIN"
                  ? "border-amber-300 bg-amber-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {entry.action === "NEW_DEVICE_LOGIN" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                <div>
                  <p className="font-medium text-slate-800">{describeAction(entry.action)}</p>
                  <p className="text-xs text-slate-500">{entry.ipAddress ?? "IP inconnue"}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{formatDate(entry.createdAt)}</span>
            </li>
          ))}
          {overview.recentActivity.length === 0 && <p className="text-sm text-slate-400">Aucune activité récente.</p>}
        </ul>
      </section>
    </div>
  );
}
