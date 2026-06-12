import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CourseListPage } from "../pages/courses/CourseListPage";
import { ModulePage } from "../pages/courses/ModulePage";
import { ExamPage } from "../pages/courses/ExamPage";
import { CertificatesPage } from "../pages/certificates/CertificatesPage";
import { CertificateVerifyPage } from "../pages/certificates/CertificateVerifyPage";
import { CapstoneProjectPage } from "../pages/capstone/CapstoneProjectPage";
import { LabsIndexPage } from "../pages/labs/LabsIndexPage";
import { CodeLabPage } from "../pages/labs/CodeLabPage";
import { GitLabPage } from "../pages/labs/GitLabPage";
import { LinuxLabPage } from "../pages/labs/LinuxLabPage";
import { SqlLabPage } from "../pages/labs/SqlLabPage";
import { ApiLabPage } from "../pages/labs/ApiLabPage";
import { SecurityCenterIndexPage } from "../pages/security/SecurityCenterIndexPage";
import { XssDemoPage } from "../pages/security/XssDemoPage";
import { SqliDemoPage } from "../pages/security/SqliDemoPage";
import { CsrfDemoPage } from "../pages/security/CsrfDemoPage";
import { AccessControlDemoPage } from "../pages/security/AccessControlDemoPage";
import { SecurityMisconfigDemoPage } from "../pages/security/SecurityMisconfigDemoPage";
import { AuthDemoPage } from "../pages/security/AuthDemoPage";
import { BugHuntPage } from "../pages/games/BugHuntPage";
import { MemoryPage } from "../pages/games/MemoryPage";
import { PuzzleJsPage } from "../pages/games/PuzzleJsPage";
import { EscapeGamePage } from "../pages/games/EscapeGamePage";
import { QuizBattlePage } from "../pages/games/QuizBattlePage";
import { AiIndexPage } from "../pages/ai/AiIndexPage";
import { AiAssistantPage } from "../pages/ai/AiAssistantPage";
import { ProjectGeneratorPage } from "../pages/ai/ProjectGeneratorPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute>
              <CourseListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules/:slug"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules/:slug/examen"
          element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificats"
          element={
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/certificats/verifier" element={<CertificateVerifyPage />} />
        <Route path="/certificats/verifier/:serialNumber" element={<CertificateVerifyPage />} />
        <Route
          path="/projet-fil-rouge"
          element={
            <ProtectedRoute>
              <CapstoneProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires"
          element={
            <ProtectedRoute>
              <LabsIndexPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires/code"
          element={
            <ProtectedRoute>
              <CodeLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires/git"
          element={
            <ProtectedRoute>
              <GitLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires/linux"
          element={
            <ProtectedRoute>
              <LinuxLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires/sql"
          element={
            <ProtectedRoute>
              <SqlLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratoires/api"
          element={
            <ProtectedRoute>
              <ApiLabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite"
          element={
            <ProtectedRoute>
              <SecurityCenterIndexPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/xss"
          element={
            <ProtectedRoute>
              <XssDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/sqli"
          element={
            <ProtectedRoute>
              <SqliDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/csrf"
          element={
            <ProtectedRoute>
              <CsrfDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/controle-acces"
          element={
            <ProtectedRoute>
              <AccessControlDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/configuration"
          element={
            <ProtectedRoute>
              <SecurityMisconfigDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/authentification"
          element={
            <ProtectedRoute>
              <AuthDemoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/jeux/chasse-aux-bugs"
          element={
            <ProtectedRoute>
              <BugHuntPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/jeux/memory"
          element={
            <ProtectedRoute>
              <MemoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/jeux/puzzle-js"
          element={
            <ProtectedRoute>
              <PuzzleJsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/jeux/escape-game"
          element={
            <ProtectedRoute>
              <EscapeGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/securite/jeux/quiz-battle"
          element={
            <ProtectedRoute>
              <QuizBattlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ia"
          element={
            <ProtectedRoute>
              <AiIndexPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ia/assistant"
          element={
            <ProtectedRoute>
              <AiAssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ia/generateur-projets"
          element={
            <ProtectedRoute>
              <ProjectGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
