import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
