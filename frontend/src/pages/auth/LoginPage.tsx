import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@devacademy.pro");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMfaSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await completeMfaLogin(mfaToken, code);
      navigate("/dashboard");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mfaToken) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <h1 className="text-2xl font-bold text-slate-900">Vérification en deux étapes</h1>
        <p className="mt-1 text-sm text-slate-500">
          {useRecoveryCode
            ? "Saisissez l'un de vos codes de récupération (format XXXX-XXXX)."
            : "Saisissez le code à 6 chiffres généré par votre application d'authentification."}
        </p>

        <form onSubmit={handleMfaSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {useRecoveryCode ? "Code de récupération" : "Code de vérification"}
            <input
              type="text"
              required
              autoFocus
              inputMode={useRecoveryCode ? "text" : "numeric"}
              placeholder={useRecoveryCode ? "XXXX-XXXX" : "123456"}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {isSubmitting ? "Vérification..." : "Valider"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setUseRecoveryCode((v) => !v);
            setCode("");
            setError(null);
          }}
          className="mt-4 text-left text-sm font-semibold text-brand-600 hover:underline"
        >
          {useRecoveryCode ? "Utiliser le code de l'application" : "Utiliser un code de récupération"}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
      <p className="mt-1 text-sm text-slate-500">
        Compte de démo : <code className="rounded bg-slate-100 px-1 py-0.5">demo@devacademy.pro</code> /{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5">DemoUser#2026</code>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-semibold text-brand-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
