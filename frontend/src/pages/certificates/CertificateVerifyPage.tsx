import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, GraduationCap, ShieldAlert, ShieldCheck } from "lucide-react";
import { api } from "../../api/client";
import type { CertificateVerification } from "../../types";

export function CertificateVerifyPage() {
  const { serialNumber } = useParams<{ serialNumber?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState(serialNumber ?? "");
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(value: string) {
    if (!value.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.get<CertificateVerification>(`/certificates/verify/${encodeURIComponent(value.trim())}`);
      setResult(res.data);
    } catch {
      setError("Impossible de vérifier ce certificat pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Vérification automatique lorsque le numéro de série est fourni dans l'URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (serialNumber) void verify(serialNumber);
  }, [serialNumber]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/certificats/verifier/${encodeURIComponent(input.trim())}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Vérifier un certificat</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Saisissez le numéro de série figurant sur un certificat Dev Academy Pro pour vérifier son authenticité.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex : DAP-2026-AB12CD34EF"
          className="flex-1 rounded-md border border-slate-200 px-3 py-2 font-mono text-sm focus:border-brand-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isLoading ? "Vérification..." : "Vérifier"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {result && (
        <div
          className={`mt-6 rounded-lg border p-4 ${
            result.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
          }`}
        >
          {result.valid ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Certificat authentique</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-emerald-900">
                  <GraduationCap className="h-4 w-4" />
                  <span>{result.module}</span>
                </div>
                <p className="mt-1 text-sm text-emerald-900">Titulaire : {result.holder}</p>
                <p className="text-sm text-emerald-900">Score obtenu : {result.score}%</p>
                <p className="text-sm text-emerald-900">
                  Délivré le {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString("fr-FR") : "—"}
                </p>
                <p className="mt-1 text-xs text-emerald-700">N° de série : {result.serialNumber}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Certificat invalide</p>
                <p className="mt-1 text-sm text-red-700">{result.reason ?? "La signature de ce certificat ne correspond pas."}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        La vérification compare la signature cryptographique (HMAC) stockée pour ce certificat à une nouvelle empreinte
        recalculée à partir de ses données. Cette signature est à but pédagogique et ne constitue pas une signature
        électronique de production.
      </p>
    </div>
  );
}
