"use client";

import React, { useState, useMemo } from "react";
import { Sliders, Activity, TrendingUp, Info } from "lucide-react";

export default function BodeStepSimulator() {
  const [order, setOrder] = useState<1 | 2>(2);
  const [K, setK] = useState<number>(1.0); // Gain statique
  const [tau, setTau] = useState<number>(0.5); // Constante de temps (1er ordre) en s
  const [omega0, setOmega0] = useState<number>(10); // Pulsation propre (2nd ordre) en rad/s
  const [xi, setXi] = useState<number>(0.35); // Amortissement (2nd ordre)
  const [E0, setE0] = useState<number>(1.0); // Amplitude de l'échelon d'entrée

  const Q = useMemo(() => 1 / (2 * xi), [xi]);

  // =========================================================================
  // 1. CALCUL DE LA RÉPONSE INDICIELLE s(t)
  // =========================================================================
  const stepData = useMemo(() => {
    const tMax = order === 1 ? Math.max(5 * tau, 1) : Math.max(18 / omega0, 1);
    const N = 220;
    const points: Array<{ t: number; s: number }> = [];

    for (let i = 0; i <= N; i++) {
      const t = (i / N) * tMax;
      let s = 0;

      if (order === 1) {
        s = K * E0 * (1 - Math.exp(-t / tau));
      } else {
        if (xi < 1) {
          // Régime pseudopériodique
          const sq = Math.sqrt(1 - xi * xi);
          const wp = omega0 * sq;
          s =
            K *
            E0 *
            (1 -
              (Math.exp(-xi * omega0 * t) / sq) *
                (sq * Math.cos(wp * t) + xi * Math.sin(wp * t)));
        } else if (Math.abs(xi - 1) < 1e-4) {
          // Régime critique
          s = K * E0 * (1 - (1 + omega0 * t) * Math.exp(-omega0 * t));
        } else {
          // Régime apériodique (xi > 1)
          const sq = Math.sqrt(xi * xi - 1);
          const r1 = -omega0 * (xi - sq);
          const r2 = -omega0 * (xi + sq);
          s =
            K *
            E0 *
            (1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1));
        }
      }
      points.push({ t, s });
    }

    const sFinal = K * E0;
    const overshootPct =
      order === 2 && xi < 1
        ? Math.exp((-Math.PI * xi) / Math.sqrt(1 - xi * xi)) * 100
        : 0;
    const tPeak =
      order === 2 && xi < 1
        ? Math.PI / (omega0 * Math.sqrt(1 - xi * xi))
        : null;

    return { points, tMax, sFinal, overshootPct, tPeak };
  }, [order, K, tau, omega0, xi, E0]);

  // =========================================================================
  // 2. CALCUL DU DIAGRAMME DE BODE (Gain en dB & Phase en degrés)
  // =========================================================================
  const bodeData = useMemo(() => {
    const wc = order === 1 ? 1 / tau : omega0;
    // Échelle logarithmique sur 4 décades autour de la pulsation de cassure wc
    const logMin = Math.log10(wc) - 2;
    const logMax = Math.log10(wc) + 2;
    const N = 200;

    const points: Array<{
      logW: number;
      w: number;
      gdb: number;
      gdbAsymp: number;
      phase: number;
      phaseAsymp: number;
    }> = [];

    const kDb = 20 * Math.log10(Math.max(K, 1e-4));

    for (let i = 0; i <= N; i++) {
      const logW = logMin + (i / N) * (logMax - logMin);
      const w = Math.pow(10, logW);
      const u = w / wc;

      let gdb = 0;
      let gdbAsymp = 0;
      let phase = 0;
      let phaseAsymp = 0;

      if (order === 1) {
        gdb = kDb - 10 * Math.log10(1 + u * u);
        gdbAsymp = u <= 1 ? kDb : kDb - 20 * Math.log10(u);
        phase = (-Math.atan(u) * 180) / Math.PI;
        phaseAsymp = u <= 1 ? 0 : -90;
      } else {
        const realPart = 1 - u * u;
        const imagPart = 2 * xi * u;
        gdb = kDb - 10 * Math.log10(realPart * realPart + imagPart * imagPart);
        gdbAsymp = u <= 1 ? kDb : kDb - 40 * Math.log10(u);
        phase = (-Math.atan2(imagPart, realPart) * 180) / Math.PI;
        phaseAsymp = u <= 1 ? 0 : -180;
      }

      points.push({ logW, w, gdb, gdbAsymp, phase, phaseAsymp });
    }

    const hasResonance = order === 2 && xi < 1 / Math.sqrt(2);
    const wr = hasResonance ? omega0 * Math.sqrt(1 - 2 * xi * xi) : null;
    const mrDb = hasResonance
      ? kDb - 20 * Math.log10(2 * xi * Math.sqrt(1 - xi * xi))
      : null;

    return { points, logMin, logMax, wc, kDb, hasResonance, wr, mrDb };
  }, [order, K, tau, omega0, xi]);

  // Helpers de projection SVG pour la réponse indicielle (600 x 240)
  const stepSvg = useMemo(() => {
    const W = 600;
    const H = 230;
    const padL = 55;
    const padR = 25;
    const padT = 20;
    const padB = 35;

    const maxY = Math.max(stepData.sFinal * 1.65, 1);
    const toX = (t: number) => padL + (t / stepData.tMax) * (W - padL - padR);
    const toY = (s: number) => H - padB - (s / maxY) * (H - padT - padB);

    const pathD = stepData.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.t).toFixed(1)} ${toY(p.s).toFixed(1)}`)
      .join(" ");

    return { W, H, padL, padR, padT, padB, toX, toY, pathD, maxY };
  }, [stepData]);

  // Helpers de projection SVG pour le diagramme de Bode (Gain & Phase)
  const bodeSvg = useMemo(() => {
    const W = 600;
    const H = 210;
    const padL = 55;
    const padR = 25;
    const padT = 20;
    const padB = 32;

    const maxG = bodeData.kDb + 22;
    const minG = bodeData.kDb - 85;

    const toX = (logW: number) =>
      padL +
      ((logW - bodeData.logMin) / (bodeData.logMax - bodeData.logMin)) *
        (W - padL - padR);
    const toYG = (g: number) =>
      H - padB - ((g - minG) / (maxG - minG)) * (H - padT - padB);
    const toYP = (ph: number) =>
      H - padB - ((ph - -190) / (10 - -190)) * (H - padT - padB);

    const gainRealD = bodeData.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYG(p.gdb).toFixed(1)}`)
      .join(" ");
    const gainAsympD = bodeData.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYG(p.gdbAsymp).toFixed(1)}`)
      .join(" ");
    const phaseRealD = bodeData.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYP(p.phase).toFixed(1)}`)
      .join(" ");
    const phaseAsympD = bodeData.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYP(p.phaseAsymp).toFixed(1)}`)
      .join(" ");

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      toX,
      toYG,
      toYP,
      gainRealD,
      gainAsympD,
      phaseRealD,
      phaseAsympD,
    };
  }, [bodeData]);

  return (
    <div className="space-y-6">
      {/* PANNEAU DE CONTRÔLE DES CURSEURS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-slate-900">
              Paramètres de la Fonction de Transfert Canonique H(p)
            </h2>
          </div>

          {/* Sélecteur 1er Ordre vs 2nd Ordre */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setOrder(1)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                order === 1
                  ? "bg-red-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1er Ordre (τ)
            </button>
            <button
              onClick={() => setOrder(2)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                order === 2
                  ? "bg-red-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2nd Ordre (ξ, ω₀, Q)
            </button>
          </div>
        </div>

        {/* Curseurs interactifs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gain statique K */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Gain statique K</span>
              <span className="font-mono text-red-600">
                K = {K.toFixed(1)} ({(20 * Math.log10(K)).toFixed(1)} dB)
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={K}
              onChange={(e) => setK(parseFloat(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0.2</span>
              <span>Valeur finale s(∞) = {(K * E0).toFixed(2)}</span>
              <span>5.0</span>
            </div>
          </div>

          {order === 1 ? (
            /* Constante de temps tau (1er ordre) */
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 md:col-span-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Constante de temps τ (s)</span>
                <span className="font-mono text-red-600">
                  τ = {tau.toFixed(2)} s (ω_c = 1/τ = {(1 / tau).toFixed(2)} rad/s)
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={tau}
                onChange={(e) => setTau(parseFloat(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rapide (0.1 s)</span>
                <span>Temps de réponse t_r5% ≈ 3τ = {(3 * tau).toFixed(2)} s</span>
                <span>Lent (3.0 s)</span>
              </div>
            </div>
          ) : (
            <>
              {/* Facteur d'amortissement xi / Facteur de qualité Q */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Amortissement ξ (SII) / Q (Phys.)</span>
                  <span className="font-mono text-red-600">
                    ξ = {xi.toFixed(2)} ⇔ Q = {Q.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.08"
                  max="2.0"
                  step="0.02"
                  value={xi}
                  onChange={(e) => setXi(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setXi(0.25)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-200 text-slate-700 hover:border-red-500 cursor-pointer"
                  >
                    ξ = 0.25 (Q=2)
                  </button>
                  <button
                    onClick={() => setXi(0.7)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-200 text-slate-700 hover:border-red-500 cursor-pointer"
                  >
                    ξ = 0.7 (Optimum)
                  </button>
                  <button
                    onClick={() => setXi(1.0)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white border border-slate-200 text-slate-700 hover:border-red-500 cursor-pointer"
                  >
                    ξ = 1 (Critique)
                  </button>
                </div>
              </div>

              {/* Pulsation propre omega0 */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">Pulsation propre ω₀ (rad/s)</span>
                  <span className="font-mono text-red-600">
                    ω₀ = {omega0} rad/s
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={omega0}
                  onChange={(e) => setOmega0(parseFloat(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 rad/s</span>
                  <span>f₀ = {(omega0 / (2 * Math.PI)).toFixed(2)} Hz</span>
                  <span>100 rad/s</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bandeau de synthèse des grandeurs caractéristiques calculées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-[10px] font-bold uppercase text-red-600 block">
              Régime Temporel
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {order === 1
                ? "Exponentiel (1er ordre)"
                : xi < 1
                ? "Pseudopériodique (ξ < 1)"
                : Math.abs(xi - 1) < 1e-3
                ? "Critique (ξ = 1)"
                : "Apériodique (ξ > 1)"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              1er Dépassement D₁ (%)
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 2 && xi < 1
                ? `${stepData.overshootPct.toFixed(1)} % (à t₁ = ${stepData.tPeak?.toFixed(2)} s)`
                : "Aucun dépassement (0 %)"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Résonance en Gain (Bode)
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 2 && bodeData.hasResonance
                ? `Oui (ξ < 0.707) : ω_r = ${bodeData.wr?.toFixed(1)} rad/s`
                : "Pas de résonance"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Gain à ω = ω₀ (Cassure)
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 1
                ? `${(bodeData.kDb - 3.01).toFixed(1)} dB (−3 dB)`
                : `${(bodeData.kDb - 20 * Math.log10(2 * xi)).toFixed(1)} dB (20 log Q)`}
            </span>
          </div>
        </div>
      </div>

      {/* GRAPHIQUE 1 : RÉPONSE INDICIELLE TEMPORELLE s(t) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span>Réponse Indicielle Temporelle s(t) à un échelon E₀ = {E0}</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Asymptote finale : s(∞) = K·E₀ = {stepData.sFinal.toFixed(2)}
          </span>
        </div>

        <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${stepSvg.W} ${stepSvg.H}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Bande des ±5% autour de la valeur finale */}
            <rect
              x={stepSvg.padL}
              y={stepSvg.toY(stepData.sFinal * 1.05)}
              width={stepSvg.W - stepSvg.padL - stepSvg.padR}
              height={
                stepSvg.toY(stepData.sFinal * 0.95) -
                stepSvg.toY(stepData.sFinal * 1.05)
              }
              fill="#dcfce7"
              fillOpacity="0.7"
            />

            {/* Asymptote horizontale s_inf */}
            <line
              x1={stepSvg.padL}
              y1={stepSvg.toY(stepData.sFinal)}
              x2={stepSvg.W - stepSvg.padR}
              y2={stepSvg.toY(stepData.sFinal)}
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text
              x={stepSvg.padL - 8}
              y={stepSvg.toY(stepData.sFinal) + 4}
              textAnchor="end"
              className="text-[11px] fill-emerald-700 font-bold"
            >
              K·E₀ = {stepData.sFinal.toFixed(1)}
            </text>

            {/* Axes */}
            <line
              x1={stepSvg.padL}
              y1={stepSvg.toY(0)}
              x2={stepSvg.W - stepSvg.padR}
              y2={stepSvg.toY(0)}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={stepSvg.padL}
              y1={stepSvg.H - stepSvg.padB}
              x2={stepSvg.padL}
              y2={stepSvg.padT}
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Courbe s(t) */}
            <path
              d={stepSvg.pathD}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
            />

            {/* Marqueur du 1er dépassement si ordre 2 et xi < 1 */}
            {order === 2 && xi < 1 && stepData.tPeak && (
              <>
                <line
                  x1={stepSvg.toX(stepData.tPeak)}
                  y1={stepSvg.toY(
                    stepData.sFinal * (1 + stepData.overshootPct / 100)
                  )}
                  x2={stepSvg.toX(stepData.tPeak)}
                  y2={stepSvg.toY(0)}
                  stroke="#dc2626"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={stepSvg.toX(stepData.tPeak)}
                  cy={stepSvg.toY(
                    stepData.sFinal * (1 + stepData.overshootPct / 100)
                  )}
                  r="4.5"
                  fill="#dc2626"
                />
                <text
                  x={stepSvg.toX(stepData.tPeak) + 8}
                  y={
                    stepSvg.toY(
                      stepData.sFinal * (1 + stepData.overshootPct / 100)
                    ) - 4
                  }
                  className="text-[11px] fill-red-600 font-bold"
                >
                  D₁ = {stepData.overshootPct.toFixed(1)}% (t₁ ={" "}
                  {stepData.tPeak.toFixed(2)}s)
                </text>
              </>
            )}

            <text
              x={stepSvg.W - stepSvg.padR}
              y={stepSvg.toY(0) + 18}
              textAnchor="end"
              className="text-xs fill-slate-700 font-bold"
            >
              Temps t (en s, échelle 0 → {stepData.tMax.toFixed(1)} s)
            </text>
          </svg>
        </div>
      </div>

      {/* GRAPHIQUE 2 : DIAGRAMMES DE BODE (GAIN & PHASE + ASYMPTOTES) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span>
              Diagrammes de Bode — Courbes Réelles (rouge) & Asymptotes (pointillés ardoise)
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Pente HF : {order === 1 ? "−20 dB/décade" : "−40 dB/décade"}
          </span>
        </div>

        <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-4 overflow-x-auto">
          {/* 2A. Bode en Gain G_dB(omega) */}
          <svg
            viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Ligne verticale à la pulsation de cassure wc */}
            <line
              x1={bodeSvg.toX(Math.log10(bodeData.wc))}
              y1={bodeSvg.padT}
              x2={bodeSvg.toX(Math.log10(bodeData.wc))}
              y2={bodeSvg.H - bodeSvg.padB}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x={bodeSvg.toX(Math.log10(bodeData.wc))}
              y={bodeSvg.H - 8}
              textAnchor="middle"
              className="text-[11px] fill-slate-800 font-bold"
            >
              {order === 1
                ? `ω_c = 1/τ = ${bodeData.wc.toFixed(1)} rad/s`
                : `ω₀ = ${bodeData.wc.toFixed(1)} rad/s`}
            </text>

            {/* Axes Gain */}
            <line
              x1={bodeSvg.padL}
              y1={bodeSvg.H - bodeSvg.padB}
              x2={bodeSvg.W - bodeSvg.padR}
              y2={bodeSvg.H - bodeSvg.padB}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={bodeSvg.padL}
              y1={bodeSvg.H - bodeSvg.padB}
              x2={bodeSvg.padL}
              y2={bodeSvg.padT}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text
              x={bodeSvg.padL + 8}
              y={bodeSvg.padT + 10}
              className="text-xs fill-slate-800 font-bold"
            >
              Gain G_dB(ω) = 20 log|H(jω)| (en dB)
            </text>

            {/* Asymptote de Gain */}
            <path
              d={bodeSvg.gainAsympD}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* Courbe réelle de Gain */}
            <path
              d={bodeSvg.gainRealD}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
            />

            <text
              x={bodeSvg.padL - 6}
              y={bodeSvg.toYG(bodeData.kDb) + 4}
              textAnchor="end"
              className="text-[11px] fill-slate-700 font-bold"
            >
              {bodeData.kDb.toFixed(0)} dB
            </text>
          </svg>

          {/* 2B. Bode en Phase phi(omega) */}
          <svg
            viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Ligne verticale à la pulsation de cassure wc */}
            <line
              x1={bodeSvg.toX(Math.log10(bodeData.wc))}
              y1={bodeSvg.padT}
              x2={bodeSvg.toX(Math.log10(bodeData.wc))}
              y2={bodeSvg.H - bodeSvg.padB}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Axes Phase */}
            <line
              x1={bodeSvg.padL}
              y1={bodeSvg.H - bodeSvg.padB}
              x2={bodeSvg.W - bodeSvg.padR}
              y2={bodeSvg.H - bodeSvg.padB}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={bodeSvg.padL}
              y1={bodeSvg.H - bodeSvg.padB}
              x2={bodeSvg.padL}
              y2={bodeSvg.padT}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text
              x={bodeSvg.padL + 8}
              y={bodeSvg.padT + 10}
              className="text-xs fill-slate-800 font-bold"
            >
              Phase φ(ω) = arg(H(jω)) (en degrés)
            </text>

            {/* Repères 0°, -90°, -180° */}
            {[0, -90, -180].map((deg) => (
              <g key={deg}>
                <line
                  x1={bodeSvg.padL}
                  y1={bodeSvg.toYP(deg)}
                  x2={bodeSvg.W - bodeSvg.padR}
                  y2={bodeSvg.toYP(deg)}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={bodeSvg.padL - 6}
                  y={bodeSvg.toYP(deg) + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-700 font-bold"
                >
                  {deg}°
                </text>
              </g>
            ))}

            {/* Asymptote de Phase */}
            <path
              d={bodeSvg.phaseAsympD}
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* Courbe réelle de Phase */}
            <path
              d={bodeSvg.phaseRealD}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
            />

            <text
              x={bodeSvg.W - bodeSvg.padR}
              y={bodeSvg.H - 8}
              textAnchor="end"
              className="text-xs fill-slate-700 font-bold"
            >
              Pulsation ω (échelle logarithmique : 4 décades autour de ω₀)
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}