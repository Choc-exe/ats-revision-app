"use client";

import React, { useState, useRef } from "react";
import {
  Copy,
  Check,
  Play,
  Terminal,
  Edit3,
  RotateCcw,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    __pyodideInstance?: any;
  }
}

interface PythonSandboxProps {
  initialCode: string;
}

/**
 * Script Python interne d'introspection (AST + Auto-Testeur ATS).
 * Il exécute le code de l'étudiant, capture les prints, inspecte les variables
 * et teste automatiquement les fonctions déclarées si aucun print n'est présent.
 */
const PYTHON_RUNNER_WRAPPER = `
import sys, io, ast, time, math

def __ats_execute_code(user_code):
    stdout_buf = io.StringIO()
    stderr_buf = io.StringIO()
    old_stdout, old_stderr = sys.stdout, sys.stderr
    sys.stdout, sys.stderr = stdout_buf, stderr_buf
    
    env = {"math": math}
    auto_logs = []
    has_error = False
    t0 = time.perf_counter()
    
    try:
        tree = ast.parse(user_code)
        
        # Si la dernière instruction est une expression seule (style Jupyter), on l'isole pour l'afficher
        last_expr = None
        if tree.body and isinstance(tree.body[-1], ast.Expr):
            last_node = tree.body.pop()
            exec(compile(tree, filename="<ats_sandbox>", mode="exec"), env)
            val = eval(compile(ast.Expression(last_node.value), filename="<ats_sandbox>", mode="eval"), env)
            if val is not None:
                auto_logs.append(f"Out: {repr(val)}")
        else:
            exec(compile(tree, filename="<ats_sandbox>", mode="exec"), env)
            
        printed = stdout_buf.getvalue()
        
        # SI AUCUN PRINT N'A ÉTÉ FAIT : on inspecte les variables et on auto-teste les fonctions !
        if not printed.strip() and not auto_logs:
            user_vars = {
                k: v for k, v in env.items()
                if not k.startswith("_") and k not in ("math",) and not callable(v) and not isinstance(v, type(sys))
            }
            user_funcs = [
                (k, v) for k, v in env.items()
                if not k.startswith("_") and callable(v) and hasattr(v, "__code__")
            ]
            
            # 1. Affichage des variables globales créées par le script
            if user_vars:
                auto_logs.append("📊 État des variables en mémoire :")
                for k, v in user_vars.items():
                    auto_logs.append(f"  • {k} = {repr(v)}")
                    
            # 2. Banc d'essai automatique pour les fonctions du programme ATS
            if user_funcs:
                auto_logs.append("⚡ Auto-test des fonctions détectées dans le script :")
                for fname, fn in user_funcs:
                    arg_names = fn.__code__.co_varnames[:fn.__code__.co_argcount]
                    
                    # Jeux de tests intelligents selon le nom/signature de la fonction ATS
                    test_executed = False
                    try:
                        # Cas 1 : Recherche dichotomique / élément dans un tableau (tab, x)
                        if len(arg_names) == 2 and any(w in arg_names[0].lower() for w in ("tab", "t", "l", "liste")):
                            sample_tab = [2, 5, 8, 12, 16, 23, 38]
                            sample_x = 16
                            res = fn(sample_tab, sample_x)
                            auto_logs.append(f"  >>> {fname}({sample_tab}, {sample_x})  ⟶  {repr(res)}")
                            test_executed = True
                            
                        # Cas 2 : Fonction prenant un tableau 1D ou une matrice 2D (1 seul argument)
                        elif len(arg_names) == 1 and any(w in arg_names[0].lower() for w in ("tab", "t", "l", "liste", "mat", "m", "img")):
                            if any(w in fname.lower() or w in arg_names[0].lower() for w in ("mat", "2d", "img", "ligne", "col")):
                                sample_mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
                                res = fn(sample_mat)
                                auto_logs.append(f"  >>> {fname}({sample_mat})  ⟶  {repr(res)}")
                            else:
                                sample_tab = [14, 3, 27, 8, 19, 5]
                                sample_copy = list(sample_tab)
                                res = fn(sample_copy)
                                # Si c'est un tri en place (qui retourne None mais modifie la liste)
                                if res is None and sample_copy != sample_tab:
                                    auto_logs.append(f"  >>> tab = {sample_tab} ; {fname}(tab)  ⟶  tab = {repr(sample_copy)}")
                                else:
                                    auto_logs.append(f"  >>> {fname}({sample_tab})  ⟶  {repr(res)}")
                            test_executed = True

                        # Cas 3 : Méthodes numériques d'analyse (Intégration, Dichotomie, Newton, Euler)
                        elif "f" in arg_names:
                            f_test = lambda x: x**2 - 2  # Racine sqrt(2) ≈ 1.4142
                            df_test = lambda x: 2*x
                            if len(arg_names) == 3 and ("a" in arg_names or "x0" in arg_names):
                                res = fn(f_test, 0.0, 2.0)
                                auto_logs.append(f"  >>> {fname}(lambda x: x² - 2, 0.0, 2.0)  ⟶  {repr(res)}")
                                test_executed = True
                            elif len(arg_names) == 4 and "df" in arg_names:
                                res = fn(f_test, df_test, 1.5, 1e-6)
                                auto_logs.append(f"  >>> {fname}(f, df, x0=1.5, eps=1e-6) [pour x²-2=0]  ⟶  {repr(res)}")
                                test_executed = True
                            elif len(arg_names) == 4:
                                res = fn(f_test, 0.0, 2.0, 100)
                                auto_logs.append(f"  >>> {fname}(lambda x: x² - 2, a=0, b=2, n=100)  ⟶  {repr(res)}")
                                test_executed = True
                                
                        # Cas 4 : Fonction mathématique / entière classique à 1 argument (n, x)
                        elif len(arg_names) == 1:
                            res = fn(5)
                            auto_logs.append(f"  >>> {fname}(5)  ⟶  {repr(res)}")
                            test_executed = True
                    except Exception:
                        pass
                        
                    if not test_executed:
                        sig = ", ".join(arg_names)
                        auto_logs.append(f"  ✓ Fonction '{fname}({sig})' compilée et prête. Ajoutez print({fname}(...)) pour la tester avec vos valeurs.")
                        
    except Exception as e:
        has_error = True
        import traceback
        tb_lines = traceback.format_exception(type(e), e, e.__traceback__)
        # On filtre les lignes internes du wrapper pour ne montrer que l'erreur du script étudiant
        clean_tb = [line for line in tb_lines if "<ats_sandbox>" in line or line == tb_lines[-1]]
        stderr_buf.write("".join(clean_tb if clean_tb else tb_lines[-2:]))
    finally:
        sys.stdout, sys.stderr = old_stdout, old_stderr
        
    dt_ms = (time.perf_counter() - t0) * 1000.0
    final_out = stdout_buf.getvalue()
    if auto_logs:
        final_out = (final_out + "\\n" if final_out else "") + "\\n".join(auto_logs)
    err_out = stderr_buf.getvalue()
    
    return {
        "output": (err_out if has_error else final_out).strip(),
        "hasError": has_error,
        "timeMs": round(dt_ms, 2)
    }
`;

export default function PythonSandbox({ initialCode }: PythonSandboxProps) {
  const cleanInitial = initialCode.replace(/\n\$/, "");
  const [code, setCode] = useState(cleanInitial);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(cleanInitial);
    setOutput(null);
    setExecTimeMs(null);
    setHasError(false);
  };

  const handleRunPython = async () => {
    setIsRunning(true);
    setHasError(false);
    setOutput("Exécution dans l'environnement Python 3 (Pyodide)...");

    try {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Impossible de charger Pyodide."));
          document.head.appendChild(script);
        });
      }

      if (!window.__pyodideInstance && window.loadPyodide) {
        window.__pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/",
        });
        await window.__pyodideInstance.runPythonAsync(PYTHON_RUNNER_WRAPPER);
      }

      const pyodide = window.__pyodideInstance;
      const runner = pyodide.globals.get("__ats_execute_code");
      const pyResult = runner(code);
      const jsResult = pyResult.toJs({ dict_converter: Object.fromEntries });
      pyResult.destroy();

      setHasError(Boolean(jsResult.hasError));
      setExecTimeMs(jsResult.timeMs ?? null);
      setOutput(
        jsResult.output ||
          "✓ Script exécuté avec succès (aucune sortie ni variable détectée)."
      );
    } catch (err: any) {
      setHasError(true);
      setOutput(err?.message || String(err));
    } finally {
      setIsRunning(false);
    }
  };

  // Permet d'utiliser la touche Tab pour indenter de 4 espaces dans l'éditeur
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const updated = code.substring(0, start) + "    " + code.substring(end);
      setCode(updated);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-md">
      {/* Barre supérieure de l'IDE */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Python 3 — Auto-Testeur ATS
          </span>
        </div>

        {/* Boutons d'actions */}
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
            <span>{isEditing ? "Verrouiller" : "Modifier"}</span>
          </button>

          {code !== cleanInitial && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Restaurer le script original du cours"
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

      {/* Zone de code (Édition avec support de la touche Tab ou Lecture) */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.max(4, code.split("\n").length + 1)}
          spellCheck={false}
          className="w-full p-4 bg-[#0d1117] text-amber-200 font-mono text-xs md:text-sm leading-relaxed focus:outline-none resize-y border-b border-slate-800"
        />
      ) : (
        <pre className="p-4 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed text-emerald-300 selection:bg-red-500/30">
          <code>{code}</code>
        </pre>
      )}

      {/* Console de sortie enrichie */}
      {output !== null && (
        <div className="border-t border-slate-800 bg-[#090d13] p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-semibold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sortie Console & Banc d&apos;essai</span>
              {execTimeMs !== null && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] normal-case">
                  <Clock className="w-2.5 h-2.5 text-emerald-400" />
                  {execTimeMs} ms
                </span>
              )}
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