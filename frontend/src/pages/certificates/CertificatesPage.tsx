import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Download } from "lucide-react";
import { api } from "../../api/client";
import type { CertificateSummary } from "../../types";

export function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateSummary[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ certificates: CertificateSummary[] }>("/certificates").then((res) => setCertificates(res.data.certificates));
  }, []);

  async function downloadPdf(certificate: CertificateSummary) {
    setDownloadingId(certificate.id);
    try {
      const res = await api.get(`/certificates/${certificate.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificat-${certificate.module.slug}-${certificate.serialNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Mes certificats</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Retrouvez ici les certificats obtenus en réussissant les examens finaux des modules.
      </p>

      {certificates === null ? (
        <p className="mt-6 text-slate-400">Chargement...</p>
      ) : certificates.length === 0 ? (
        <p className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          Vous n'avez pas encore obtenu de certificat. Terminez un module et réussissez son examen final pour en
          débloquer un.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {certificates.map((cert) => (
            <li key={cert.id} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Award className="h-8 w-8 shrink-0 text-amber-500" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{cert.module.category}</p>
                <p className="font-semibold text-slate-900">{cert.module.title}</p>
                <p className="text-xs text-slate-500">
                  Score : {cert.score}% — Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")} — N° {cert.serialNumber}
                </p>
              </div>
              <button
                onClick={() => downloadPdf(cert)}
                disabled={downloadingId === cert.id}
                className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {downloadingId === cert.id ? "..." : "PDF"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Chaque certificat peut être vérifié publiquement sur{" "}
        <Link to="/certificats/verifier" className="text-brand-600 hover:underline">
          la page de vérification
        </Link>{" "}
        à l'aide de son numéro de série.
      </p>
    </div>
  );
}
