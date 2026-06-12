import { useMemo, useState } from "react";
import { Boxes, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  PROJECT_TEMPLATES,
  SECURITY_OPTIONS,
  analyzeAsvs,
  buildSetupCommands,
} from "../../lib/ai/projectGenerator";

export function ProjectGeneratorPage() {
  const [templateId, setTemplateId] = useState(PROJECT_TEMPLATES[0].id);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set(["validation", "secrets"]));

  const template = PROJECT_TEMPLATES.find((t) => t.id === templateId)!;
  const asvsResults = useMemo(() => analyzeAsvs(selectedOptions), [selectedOptions]);
  const setupCommands = useMemo(() => buildSetupCommands(template, selectedOptions), [template, selectedOptions]);

  const okCount = asvsResults.filter((r) => r.status === "ok").length;

  function toggleOption(id: string) {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-2">
        <Boxes className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-900">Générateur de projets</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Choisissez un type de projet et des options de sécurité pour obtenir une structure de fichiers, des
        commandes d'installation et une analyse OWASP ASVS simplifiée.
      </p>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">1. Type de projet</h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {PROJECT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            className={`rounded-xl border p-3 text-left text-sm shadow-sm ${
              templateId === t.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300"
            }`}
          >
            <p className="font-semibold text-slate-900">{t.name}</p>
            <p className="mt-1 text-xs text-slate-500">{t.description}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">2. Options de sécurité</h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {SECURITY_OPTIONS.map((opt) => (
          <label
            key={opt.id}
            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
          >
            <input
              type="checkbox"
              checked={selectedOptions.has(opt.id)}
              onChange={() => toggleOption(opt.id)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium text-slate-900">{opt.label}</span>
              <span className="block text-xs text-slate-500">{opt.description}</span>
            </span>
          </label>
        ))}
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">3. Stack et structure</h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">Stack technique</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            {template.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">Arborescence</p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-slate-700">{template.fileTree.join("\n")}</pre>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">4. Commandes d'installation</h2>
      <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-100">
        {setupCommands.join("\n")}
      </pre>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">
        5. Analyse OWASP ASVS ({okCount}/{asvsResults.length} couverts)
      </h2>
      <div className="mt-2 space-y-2">
        {asvsResults.map((result, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              result.status === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {result.status === "ok" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>
              <span className="font-semibold">{result.category}</span> — {result.requirement}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
