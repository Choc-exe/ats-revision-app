"use client";

import React, { useState, useRef } from "react";
import { Copy, Check, Play, Terminal, Edit3, RotateCcw, Loader2 } from "lucide-react";

// Déclaration globale pour Pyodide chargé dynamiquement via CDN
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    __pyodideInstance?: any;
  }
}

interface PythonSandboxProps {
  initialCode: string;
}

export default function PythonSandbox({ initialCode }: PythonSandboxProps) {
  const cleanInitial = initialCode.replace(/\n\$/, "");
  const [code, setCode] = useState(cleanInitial);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Copier le script dans le presse-papiers
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Réinitialiser le code d'origine du cours
  const handleReset = () => {
    setCode(cleanInitial);
    setOutput(null);
    setHasError(false);
  };

  // 3. Charger Pyodide (une seule fois) et exécuter le script Python 3
  const handleRunPython = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput("Initialisation de l'interpréteur Python 3 (Pyodide)...");

    try {
      // Chargement dynamique du script CDN Pyodide s'il n'est pas encore présent
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Impossible de charger Pyodide."));
          document.head.appendChild(script);
        });
      }

      if (!window.__pyodideInstance && window.loadPyodide) {
        window.__pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
        });
      }

      const pyodide = window.__pyodideInstance;
      const logs: string[] = [];

      // Redirection de stdout et stderr vers notre console locale
      pyodide.setStdout({
        batched: (msg: string) => logs.push(msg),
      });
      pyodide.setStderr({
        batched: (msg: string) => logs.push(msg),
      });

      const result = await pyodide.runPythonAsync(code);

      if (logs.length > 0) {
        setOutput(logs.join("\n"));
      } else if (result !== undefined) {
        setOutput(`Valeur retournée : ${String(result)}`);
      } else {
        setOutput(
          "Exécution réussie (aucune sortie print). Cliquez sur 'Modifier' pour ajouter un print() de test !"
        );
      }
    } catch (err: any) {
      setHasError(true);
      setOutput(err?.message || String(err));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-md">
      {/* Barre d'outils supérieure */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Python 3 — Bac à sable interactif
          </span>
        </div>

        {/* Boutons d'action : Modifier, Réinitialiser, Copier, Exécuter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isEditing
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Verrouiller" : "Modifier / Tester"}</span>
          </button>

          {code !== cleanInitial && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Restaurer le script original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunPython}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Exécuter</span>
          </button>
        </div>
      </div>

      {/* Zone de code (Éditable ou Lecture) */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={Math.max(4, code.split("\n").length + 1)}
          spellCheck={false}
          className="w-full p-4 bg-[#0d1117] text-amber-200 font-mono text-xs md:text-sm leading-relaxed focus:outline-none resize-y border-b border-slate-800"
        />
      ) : (
        <pre className="p-4 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed text-emerald-300 selection:bg-red-500/30">
          <code>{code}</code>
        </pre>
      )}

      {/* Console de sortie Pyodide */}
      {output !== null && (
        <div className="border-t border-slate-800 bg-[#090d13] p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Sortie Console Python
            </span>
            <button
              onClick={() => setOutput(null)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Fermer
            </button>
          </div>
          <pre
            className={`whitespace-pre-wrap leading-relaxed ${
              hasError ? "text-red-400" : "text-slate-200"
            }`}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}