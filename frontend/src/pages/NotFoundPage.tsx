import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-500">Cette page n'existe pas.</p>
      <Link to="/" className="mt-4 font-semibold text-brand-600 hover:underline">
        Retour à l'accueil
      </Link>
    </div>
  );
}
