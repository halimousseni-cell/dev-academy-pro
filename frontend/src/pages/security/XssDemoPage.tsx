import { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const DEFAULT_COMMENT = `<script>console.log("Script exécuté ! Sur un vrai site, ceci pourrait voler des données.")</script>`;

const PAYLOADS = [
  {
    label: "Script <script>",
    value: `<script>console.log("Script exécuté ! Sur un vrai site, ceci pourrait voler des données.")</script>`,
  },
  {
    label: "Image avec onerror",
    value: `<img src="x" onerror="console.error('Code exécuté via onerror !')">`,
  },
  {
    label: "alert() intercepté",
    value: `<script>alert('Vous avez été piraté !')</script>`,
  },
  {
    label: "Commentaire normal",
    value: `Super article, merci pour ces explications !`,
  },
];

type LogEntry = { level: "log" | "warn" | "error" | "info"; message: string };

const LOG_STYLES: Record<LogEntry["level"], string> = {
  log: "text-slate-700",
  info: "text-sky-700",
  warn: "text-amber-700",
  error: "text-red-700",
};

const CONSOLE_BRIDGE = `
(function () {
  function send(level, args) {
    try {
      window.parent.postMessage({ source: "devacademy-lab", level: level, message: args.map(function (a) {
        try { return typeof a === "object" ? JSON.stringify(a) : String(a); } catch (e) { return String(a); }
      }).join(" ") }, "*");
    } catch (e) {}
  }
  ["log", "warn", "error", "info"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      send(level, Array.prototype.slice.call(arguments));
      if (original) original.apply(console, arguments);
    };
  });
  window.alert = function (msg) { send("warn", ["[alert() intercepté par le sandbox] " + msg]); };
})();
`;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildCommentPage(commentHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; padding: 1rem; color: #1e293b; }
  h3 { margin: 0 0 0.5rem; }
  .comment { border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.75rem; margin-top: 0.5rem; }
  .comment b { color: #475569; }
</style>
</head>
<body>
  <h3>Commentaires de l'article</h3>
  <div class="comment"><b>Alice :</b> Très clair, merci pour cet article !</div>
  <div class="comment"><b>Vous :</b> ${commentHtml}</div>
  <script>${CONSOLE_BRIDGE}<\/script>
</body>
</html>`;
}

interface PreviewProps {
  title: string;
  description: string;
  srcDoc: string;
  icon: typeof ShieldAlert;
  iconClass: string;
}

function PreviewPanel({ title, description, srcDoc, icon: Icon, iconClass }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "devacademy-lab") return;
      setLogs((prev) => [...prev, { level: data.level, message: String(data.message) }].slice(-50));
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    setLogs([]);
  }, [srcDoc]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-1.5">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>
      <p className="border-b border-slate-100 px-3 py-1.5 text-xs text-slate-500">{description}</p>
      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="h-48 w-full bg-white"
      />
      <div className="border-t border-slate-200 px-3 py-2">
        <p className="text-xs font-semibold text-slate-500">Activité détectée dans l'aperçu</p>
        <div className="mt-1 max-h-20 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-400">Aucune activité.</p>
          ) : (
            logs.map((entry, i) => (
              <p key={i} className={LOG_STYLES[entry.level]}>
                {entry.message}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function XssDemoPage() {
  const [comment, setComment] = useState(DEFAULT_COMMENT);

  const vulnerableSrcDoc = buildCommentPage(comment);
  const safeSrcDoc = buildCommentPage(escapeHtml(comment));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">XSS — Cross-Site Scripting</h1>
      <p className="mt-1 text-sm text-slate-500">
        Le XSS consiste à injecter du code (le plus souvent du JavaScript) dans une page consultée par
        d'autres utilisateurs. La démonstration ci-dessous est exécutée dans un{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{"<iframe sandbox=\"allow-scripts\">"}</code>{" "}
        isolé : aucun script n'a accès à vos cookies, à votre session ou au reste de l'application.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <h2 className="font-semibold">Reflected / Stored XSS</h2>
          <p className="mt-1">
            Si une application affiche directement le contenu saisi par un utilisateur (ex : un commentaire)
            sans le filtrer ni l'échapper, un attaquant peut y injecter du HTML/JS qui sera exécuté dans le
            navigateur des autres visiteurs (vol de session, redirection, defacement...).
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <h2 className="font-semibold">Mitigations</h2>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Échapper les caractères spéciaux (&lt;, &gt;, &amp;, ", ') avant l'affichage.</li>
            <li>Utiliser un framework qui échappe par défaut (React/JSX échappe automatiquement).</li>
            <li>Définir une politique de sécurité du contenu (Content-Security-Policy).</li>
            <li>Marquer les cookies de session en HttpOnly pour empêcher leur lecture par un script.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-medium text-slate-500">Commentaire à publier</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          spellCheck={false}
          className="mt-1 h-24 w-full resize-none rounded-md border border-slate-300 p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PAYLOADS.map((payload) => (
            <button
              key={payload.label}
              onClick={() => setComment(payload.value)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              {payload.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PreviewPanel
          title="Site vulnérable (affichage brut)"
          description="Le commentaire est inséré tel quel dans le HTML de la page."
          srcDoc={vulnerableSrcDoc}
          icon={ShieldAlert}
          iconClass="text-red-600"
        />
        <PreviewPanel
          title="Site protégé (échappement)"
          description={'Le commentaire est échappé (<, >, &, ", \') avant insertion : il s\'affiche en texte, sans être exécuté.'}
          srcDoc={safeSrcDoc}
          icon={ShieldCheck}
          iconClass="text-emerald-600"
        />
      </div>
    </div>
  );
}
