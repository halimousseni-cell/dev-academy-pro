import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LayoutDashboard, LogOut, BookOpen, FlaskConical, ShieldHalf, Sparkles, Award, Rocket } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/connexion");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-700 text-lg">
          <GraduationCap className="h-6 w-6" />
          Dev Academy Pro
        </Link>

        {user && (
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-brand-600">
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Link>
            <Link to="/modules" className="flex items-center gap-1.5 hover:text-brand-600">
              <BookOpen className="h-4 w-4" />
              Parcours
            </Link>
            <Link to="/laboratoires" className="flex items-center gap-1.5 hover:text-brand-600">
              <FlaskConical className="h-4 w-4" />
              Laboratoires
            </Link>
            <Link to="/securite" className="flex items-center gap-1.5 hover:text-brand-600">
              <ShieldHalf className="h-4 w-4" />
              Sécurité
            </Link>
            <Link to="/ia" className="flex items-center gap-1.5 hover:text-brand-600">
              <Sparkles className="h-4 w-4" />
              IA
            </Link>
            <Link to="/certificats" className="flex items-center gap-1.5 hover:text-brand-600">
              <Award className="h-4 w-4" />
              Certificats
            </Link>
            <Link to="/projet-fil-rouge" className="flex items-center gap-1.5 hover:text-brand-600">
              <Rocket className="h-4 w-4" />
              Projet
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
