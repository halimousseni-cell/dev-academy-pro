import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, GraduationCap, Lock } from "lucide-react";
import { api } from "../../api/client";
import type { Exam, ModuleDetail } from "../../types";
import { ExamPlayer } from "../../components/learning/ExamPlayer";

export function ExamPage() {
  const { slug } = useParams<{ slug: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!slug) return;
    api
      .get<{ module: ModuleDetail }>(`/modules/${slug}`)
      .then((res) =>
        api.get<{ exam: Exam }>(`/exams/module/${res.data.module.id}`).then((examRes) => {
          setExam(examRes.data.exam);
        })
      )
      .catch((err) => {
        if (err?.response?.status === 404) {
          setError("Aucun examen final n'est disponible pour ce module pour le moment.");
        } else {
          setError("Impossible de charger l'examen.");
        }
      });
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="mx-auto max-w-3xl px-4 py-8 text-red-600">{error}</p>;
  if (!exam) return <p className="mx-auto max-w-3xl px-4 py-8 text-slate-400">Chargement...</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to={`/modules/${slug}`} className="text-sm text-brand-600 hover:underline">
        ← Retour au module
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <GraduationCap className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">{exam.module.title}</h1>
      </div>

      {exam.certificate && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <Award className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Vous possédez déjà le certificat de ce module.</p>
            <p className="text-xs text-emerald-700">
              Numéro de série : {exam.certificate.serialNumber} —{" "}
              <Link to="/certificats" className="underline">
                voir mes certificats
              </Link>
            </p>
          </div>
        </div>
      )}

      {!exam.moduleCompleted ? (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Lock className="h-6 w-6 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Vous devez terminer toutes les leçons et réussir tous les quiz du module avant de passer l'examen final.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <ExamPlayer exam={exam} onPassed={load} />
        </div>
      )}
    </div>
  );
}
