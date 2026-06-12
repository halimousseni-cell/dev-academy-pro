import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(form);
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

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
      <p className="mt-1 text-sm text-slate-500">
        Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un
        caractère spécial.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
            Prénom
            <input
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
            Nom
            <input
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Mot de passe
          <input
            type="password"
            required
            minLength={10}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isSubmitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Déjà un compte ?{" "}
        <Link to="/connexion" className="font-semibold text-brand-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
