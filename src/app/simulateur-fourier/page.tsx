"use client";

import React, { useState, useMemo } from "react";
import {
  Waves,
  Sliders,
  Sparkles,
  Activity,
  Terminal,
  AlertTriangle,
} from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

function SafeMath({ latex, display = false }: { latex: string; display?: boolean }) {
  try {
    const html = katex.renderToString(latex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{latex}</span>;
  }
}

type SignalType = "square" | "triangle" | "sawtooth" | "rectified";

export default function SimulateurFourierPage() {
  const [activeTab, setActiveTab] = useState<"fourier" | "newton">("fourier");

  // Paramètres Fourier
  const [signalType, setSignalType] = useState<SignalType>("square");
  const [harmonicsCount, setHarmonicsCount] = useState<number>(5);

  // Paramètres Newton-Raphson (Résolution de f(x) = x^2 - 2 = 0 ou cos(x) - x = 0)
  const [newtonFunc, setNewtonFunc] = useState<"sqrt2" | "cosx">("sqrt2");
  const [x0, setX0] = useState<number>(2.0);
  const [iterations, setIterations] = useState<number>(4);

  // Calculs mathématiques exacts pour la Série de Fourier sur [-pi, pi]
  const fourierData = useMemo(() => {
    const pointsCount = 240;
    const xs: number[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      xs.push(-Math.PI + (2 * Math.PI * i) / pointsCount);
    }

    // Coefficients a0, an, bn pour n = 1..harmonicsCount
    let a0 = 0;
    const an: number[] = [0];
    const bn: number[] = [0];
    let exactParsevalPower = 1;
    let formulaLatex = "";

    if (signalType === "square") {
      // Créneau impair d'amplitude E = 1 sur [-pi, pi]
      a0 = 0;
      exactParsevalPower = 1; // Moyenne de 1^2
      formulaLatex =
        "S_N(t) = \\frac{4}{\\pi}\\sum_{k=0}^{\\lfloor(N-1)/2\\rfloor} \\frac{\\sin((2k+1)t)}{2k+1}";
      for (let n = 1; n <= harmonicsCount; n++) {
        an.push(0);
        bn.push(n % 2 === 1 ? 4 / (Math.PI * n) : 0);
      }
    } else if (signalType === "triangle") {
      // Signal triangle pair sur [-pi, pi] : f(t) = 1 - 2|t|/pi
      a0 = 0;
      exactParsevalPower = 1 / 3;
      formulaLatex =
        "S_N(t) = \\frac{8}{\\pi^2}\\sum_{k=0}^{\\lfloor(N-1)/2\\rfloor} \\frac{\\cos((2k+1)t)}{(2k+1)^2}";
      for (let n = 1; n <= harmonicsCount; n++) {
        an.push(n % 2 === 1 ? 8 / (Math.PI * Math.PI * n * n) : 0);
        bn.push(0);
      }
    } else if (signalType === "sawtooth") {
      // Dent de scie impaire : f(t) = t / pi sur ]-pi, pi[
      a0 = 0;
      exactParsevalPower = 1 / 3;
      formulaLatex =
        "S_N(t) = \\frac{2}{\\pi}\\sum_{n=1}^{N} \\frac{(-1)^{n+1}}{n}\\sin(nt)";
      for (let n = 1; n <= harmonicsCount; n++) {
        an.push(0);
        bn.push((2 * (n % 2 === 1 ? 1 : -1)) / (Math.PI * n));
      }
    } else {
      // Redresseur double alternance : f(t) = |sin(t)|
      a0 = 2 / Math.PI;
      exactParsevalPower = 0.5;
      formulaLatex =
        "S_N(t) = \\frac{2}{\\pi} - \\frac{4}{\\pi}\\sum_{k=1}^{\\lfloor N/2 \\rfloor} \\frac{\\cos(2kt)}{4k^2 - 1}";
      for (let n = 1; n <= harmonicsCount; n++) {
        if (n % 2 === 0) {
          an.push(-4 / (Math.PI * (n * n - 1)));
        } else {
          an.push(0);
        }
        bn.push(0);
      }
    }

    // Évaluation de la cible exacte et de la somme partielle S_N(t)
    const exactY: number[] = [];
    const approxY: number[] = [];

    xs.forEach((t) => {
      let yTrue = 0;
      if (signalType === "square") yTrue = t >= 0 ? 1 : -1;
      else if (signalType === "triangle") yTrue = 1 - (2 * Math.abs(t)) / Math.PI;
      else if (signalType === "sawtooth") yTrue = t / Math.PI;
      else yTrue = Math.abs(Math.sin(t));
      exactY.push(yTrue);

      let s = a0;
      for (let n = 1; n <= harmonicsCount; n++) {
        s += an[n] * Math.cos(n * t) + bn[n] * Math.sin(n * t);
      }
      approxY.push(s);
    });

    // Puissance cumulée par Parseval : P_N = a0^2 + 1/2 * sum(an^2 + bn^2)
    let partialParseval = a0 * a0;
    const amplitudes: Array<{ n: number; cn: number }> = [];
    for (let n = 1; n <= harmonicsCount; n++) {
      const cn = Math.sqrt(an[n] * an[n] + bn[n] * bn[n]);
      amplitudes.push({ n, cn });
      partialParseval += 0.5 * (an[n] * an[n] + bn[n] * bn[n]);
    }

    const energyRatioPct = Math.min(
      100,
      (partialParseval / exactParsevalPower) * 100
    );

    return {
      xs,
      exactY,
      approxY,
      amplitudes,
      partialParseval,
      exactParsevalPower,
      energyRatioPct,
      formulaLatex,
    };
  }, [signalType, harmonicsCount]);

  // Calculs Newton-Raphson
  const newtonSteps = useMemo(() => {
    const f = (x: number) =>
      newtonFunc === "sqrt2" ? x * x - 2 : Math.cos(x) - x;
    const df = (x: number) =>
      newtonFunc === "sqrt2" ? 2 * x : -Math.sin(x) - 1;
    const exactRoot =
      newtonFunc === "sqrt2" ? Math.SQRT2 : 0.7390851332151607;

    const steps: Array<{
      k: number;
      xk: number;
      fxk: number;
      dfxk: number;
      xk1: number;
      error: number;
    }> = [];

    let curr = x0;
    for (let k = 0; k < iterations; k++) {
      const val = f(curr);
      const deriv = df(curr);
      const next = Math.abs(deriv) > 1e-12 ? curr - val / deriv : curr;
      steps.push({
        k,
        xk: curr,
        fxk: val,
        dfxk: deriv,
        xk1: next,
        error: Math.abs(curr - exactRoot),
      });
      curr = next;
    }
    return { steps, exactRoot };
  }, [newtonFunc, x0, iterations]);

  // Conversion en coordonnées SVG pour le graphe de Fourier (600 x 240)
  const svgWidth = 640;
  const svgHeight = 250;
  const mapX = (t: number) =>
    ((t + Math.PI) / (2 * Math.PI)) * (svgWidth - 40) + 20;
  const mapY = (y: number) => svgHeight / 2 - y * 85;

  const exactPath = fourierData.xs
    .map((t, i) => `${i === 0 ? "M" : "L"} ${mapX(t).toFixed(1)} ${mapY(fourierData.exactY[i]).toFixed(1)}`)
    .join(" ");

  const approxPath = fourierData.xs
    .map((t, i) => `${i === 0 ? "M" : "L"} ${mapX(t).toFixed(1)} ${mapY(fourierData.approxY[i]).toFixed(1)}`)
    .join(" ");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* EN-TÊTE DU LABO */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              Laboratoire Numérique Interactif
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Séries de Fourier, Parseval & Algorithme de Newton
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Visualisez la synthèse harmonique d'un signal périodique (Maths, Physique, SII) et la convergence quadratique de Newton-Raphson (Python).
            </p>
          </div>
        </div>

        {/* Sélecteur d'atelier */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("fourier")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "fourier"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            1. Synthèse de Fourier
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("newton")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === "newton"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            2. Newton-Raphson (Python)
          </button>
        </div>
      </div>

      {/* =====================================================================
          ONGLET 1 : SYNTHÈSE DE FOURIER, SPECTRE & ÉGALITÉ DE PARSEVAL
         ===================================================================== */}
      {activeTab === "fourier" && (
        <div className="space-y-6">
          {/* Panneau de contrôle */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Signal $2\pi$-périodique étudié
              </label>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value as SignalType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="square">
                  Créneau impair (Discontinu → Phénomène de Gibbs en 1/n)
                </option>
                <option value="triangle">
                  Triangle pair (Continu C⁰ → Convergence rapide en 1/n²)
                </option>
                <option value="sawtooth">
                  Dent de scie impaire (Discontinu → Harmoniques pairs & impairs)
                </option>
                <option value="rectified">
                  Sinus redressé double alternance |sin(t)| (Électronique de puissance)
                </option>
              </select>
            </div>

            <div className="md:col-span-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  Rang maximal d'harmonique $N$ :
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300 font-mono">
                  N = {harmonicsCount}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                value={harmonicsCount}
                onChange={(e) => setHarmonicsCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>N = 1 (Fondamental)</span>
                <span>N = 13</span>
                <span>N = 25</span>
              </div>
            </div>

            {/* Jauge de Parseval */}
            <div className="md:col-span-3 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                Énergie captée (Parseval)
              </span>
              <span className="font-mono text-xl font-extrabold text-emerald-900 dark:text-white">
                {fourierData.energyRatioPct.toFixed(2)} %
              </span>
              <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                P_N = {fourierData.partialParseval.toFixed(4)} /{" "}
                {fourierData.exactParsevalPower.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Oscilloscope SVG : Signal exact vs Somme partielle de Fourier S_N(t) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Superposition temporelle sur $[-\pi, \pi]$
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-4 h-0.5 bg-slate-400 inline-block" />
                  Signal exact $f(t)$
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-sky-400">
                  <span className="w-4 h-0.5 bg-blue-600 dark:bg-sky-400 inline-block" />
                  Somme de Fourier $S_{harmonicsCount}(t)$
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-64 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                {/* Axes */}
                <line
                  x1={20}
                  y1={svgHeight / 2}
                  x2={svgWidth - 20}
                  y2={svgHeight / 2}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-800"
                  strokeWidth="1"
                />
                <line
                  x1={svgWidth / 2}
                  y1={15}
                  x2={svgWidth / 2}
                  y2={svgHeight - 15}
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-800"
                  strokeWidth="1"
                />
                {/* Signal exact en pointillé */}
                <path
                  d={exactPath}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />
                {/* Somme partielle de Fourier */}
                <path
                  d={approxPath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Formule critique de la série sélectionnée */}
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/25 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                  Développement en Série de Fourier tronqué au rang $N = {harmonicsCount}$ :
                </span>
                <SafeMath latex={fourierData.formulaLatex} display />
              </div>

              {(signalType === "square" || signalType === "sawtooth") && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 max-w-xs shrink-0 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">
<strong>Phénomène de Gibbs :</strong> Aux points de saut, la série converge vers la demi-somme <SafeMath latex="\\frac{f(t^+) + f(t^-)}{2}" /> (Dirichlet), mais présente un dépassement irréductible d'environ $9\,\%$ du saut.                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : MÉTHODE DE NEWTON-RAPHSON & CODE PYTHON CONCOURS ATS
         ===================================================================== */}
      {activeTab === "newton" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Équation non linéaire $f(x) = 0$
              </label>
              <select
                value={newtonFunc}
                onChange={(e) =>
                  setNewtonFunc(e.target.value as "sqrt2" | "cosx")
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="sqrt2">
                  f(x) = x² - 2 = 0 (Calcul de √2 ≈ 1,41421356)
                </option>
                <option value="cosx">
                  f(x) = cos(x) - x = 0 (Point fixe de Dottie ≈ 0,73908513)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Point de départ $x_0 = {x0.toFixed(1)}$
              </label>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.1}
                value={x0}
                onChange={(e) => setX0(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Nombre d'itérations : {iterations}
              </label>
              <input
                type="range"
                min={2}
                max={7}
                step={1}
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Tableau des itérations et vitesse de convergence quadratique */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Trace d'exécution pas-à-pas (Convergence quadratique : le nombre de décimales exactes double à chaque pas)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 px-3">Itération k</th>
                    <th className="py-2 px-3">Approximation x_k</th>
                    <th className="py-2 px-3">f(x_k)</th>
                    <th className="py-2 px-3">Tangente x_(k+1)</th>
                    <th className="py-2 px-3">Erreur |x_k - α|</th>
                  </tr>
                </thead>
                <tbody>
                  {newtonSteps.steps.map((st) => (
                    <tr
                      key={st.k}
                      className="border-b border-slate-100 dark:border-slate-800/60"
                    >
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-sky-400">
                        k = {st.k}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {st.xk.toFixed(10)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {st.fxk.toExponential(3)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400 font-bold">
                        {st.xk1.toFixed(10)}
                      </td>
                      <td className="py-2.5 px-3 text-red-600 dark:text-red-400">
                        {st.error.toExponential(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-slate-950 text-slate-100 p-4 font-mono text-xs space-y-1.5 overflow-x-auto">
              <div className="text-sky-400 font-bold flex items-center gap-1.5 mb-2">
                <Terminal className="w-3.5 h-3.5" />
                Implémentation Python exigible au Concours ATS :
              </div>
              <pre>{`def newton(f, df, x0: float, eps: float = 1e-10, n_max: int = 100) -> float:
    x = x0
    for _ in range(n_max):
        fx = f(x)
        if abs(fx) < eps:
            return x
        x = x - fx / df(x)  # Récurrence de la tangente
    return x`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}