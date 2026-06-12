import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trash2 } from "lucide-react";

const DEFAULT_HTML = `<h1>Bonjour !</h1>
<p>Modifiez ce code puis cliquez sur "Exécuter".</p>
<button id="btn">Cliquez-moi</button>`;

const DEFAULT_CSS = `body {
  font-family: sans-serif;
  padding: 1rem;
  color: #1e293b;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}`;

const DEFAULT_JS = `document.getElementById("btn").addEventListener("click", () => {
  console.log("Bouton cliqué !");
});`;

type Tab = "html" | "css" | "js";
type LogEntry = { level: "log" | "warn" | "error" | "info"; message: string };

function buildDocument(html: string, css: string, js: string): string {
  const safeHtml = html.replace(/<\/script>/gi, "<\\/script>");
  const safeJs = js.replace(/<\/script>/gi, "<\\/script>");

  return `<!DOCTYPE html>
<html>
<head><style>${css}</style></head>
<body>
${safeHtml}
<script>
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
  window.addEventListener("error", function (e) {
    send("error", [e.message + " (ligne " + e.lineno + ")"]);
  });
})();
<\/script>
<script>
${safeJs}
<\/script>
</body>
</html>`;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "html", label: "HTML" },
  { key: "css", label: "CSS" },
  { key: "js", label: "JavaScript" },
];

const LOG_STYLES: Record<LogEntry["level"], string> = {
  log: "text-slate-700",
  info: "text-sky-700",
  warn: "text-amber-700",
  error: "text-red-700",
};

export function CodeLabPage() {
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);
  const [activeTab, setActiveTab] = useState<Tab>("html");
  const [srcDoc, setSrcDoc] = useState(() => buildDocument(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "devacademy-lab") return;
      setLogs((prev) => [...prev, { level: data.level, message: String(data.message) }].slice(-100));
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function run() {
    setLogs([]);
    setSrcDoc(buildDocument(html, css, js));
  }

  function reset() {
    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
    setJs(DEFAULT_JS);
    setLogs([]);
    setSrcDoc(buildDocument(DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS));
  }

  const value = activeTab === "html" ? html : activeTab === "css" ? css : js;
  const setValue = activeTab === "html" ? setHtml : activeTab === "css" ? setCss : setJs;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Laboratoire de code — HTML / CSS / JS</h1>
      <p className="mt-1 text-sm text-slate-500">
        Écrivez votre code et exécutez-le dans un aperçu isolé (sandbox). Le contenu de l'aperçu n'a aucun
        accès à votre session ni à vos données.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-2 pt-2">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-t-md px-3 py-1.5 text-sm font-medium ${
                    activeTab === tab.key
                      ? "bg-slate-100 text-brand-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pb-2">
              <button
                onClick={run}
                className="flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                <Play className="h-3.5 w-3.5" />
                Exécuter
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            </div>
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            className="h-96 w-full resize-none border-0 p-3 font-mono text-sm text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500">
              Aperçu
            </div>
            <iframe
              ref={iframeRef}
              title="Aperçu du code"
              srcDoc={srcDoc}
              sandbox="allow-scripts"
              className="h-64 w-full bg-white"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-500">Console</span>
              <button
                onClick={() => setLogs([])}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Effacer
              </button>
            </div>
            <div className="h-28 overflow-y-auto px-3 py-2 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-slate-400">Aucun message. Utilisez console.log() dans votre code JS.</p>
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
      </div>
    </div>
  );
}
