"use client";

import React, { useState, useMemo } from "react";
import { Sliders, Activity, TrendingUp, RotateCcw } from "lucide-react";

// Halo blanc de lisibilité pour les étiquettes internes aux SVG
const svgLabelStyle: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "#f8fafc",
  strokeWidth: "4px",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/**
 * Sous-composant de contrôle professionnel :
 * Combine un champ de saisie numérique exact, une jauge de curseur stylisée et des boutons de préréglages.
 */
interface ParameterControlProps {
  label: string;
  symbol: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  helperLeft?: string;
  helperRight?: string;
  presets?: Array<{ label: string; value: number }>;
}

function ParameterControl({
  label,
  symbol,
  unit = "",
  value,
  min,
  max,
  step,
  onChange,
  helperLeft,
  helperRight,
  presets,
}: ParameterControlProps) {
  // Calcul du pourcentage de remplissage de la jauge
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  return (
    <div className="bg-slate-50/90 rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between space-y-3 shadow-2xs">
      {/* En-tête : Nom du paramètre + Champ de saisie directe */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-slate-800 block">{label}</span>
          <span className="text-[11px] font-mono text-slate-500">{symbol}</span>
        </div>

        <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <input
            type="number"
            value={Number(value.toFixed(4))}
            min={min}
            max={max * 10}
            step={step}
            onChange={handleNumberInput}
            className="w-16 text-right font-mono text-xs font-extrabold text-red-600 bg-transparent focus:outline-none"
          />
          {unit && (
            <span className="ml-1.5 text-[11px] font-mono font-semibold text-slate-400 select-none">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Curseur sur-mesure avec piste remplie */}
      <div className="space-y-1.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${pct}%, #cbd5e1 ${pct}%, #cbd5e1 100%)`,
          }}
          className="ats-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
        />

        {(helperLeft || helperRight) && (
          <div className="flex justify-between text-[11px] font-medium text-slate-500">
            <span>{helperLeft}</span>
            <span>{helperRight}</span>
          </div>
        )}
      </div>

      {/* Boutons de valeurs remarquables optionnels */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/70">
          {presets.map((p) => {
            const active = Math.abs(value - p.value) < 1e-3;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.value)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer ${
                  active
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BodeStepSimulator() {
  const [order, setOrder] = useState<1 | 2>(2);
  const [K, setK] = useState<number>(1.0); // Gain statique
  const [tau, setTau] = useState<number>(0.5); // Constante de temps (1er ordre) en s
  const [omega0, setOmega0] = useState<number>(10); // Pulsation propre (2nd ordre) en rad/s
  const [xi, setXi] = useState<number>(0.35); // Amortissement (2nd ordre)
  const [E0, setE0] = useState<number>(1.0); // Amplitude de l'échelon d'entrée

  const Q = useMemo(() => 1 / (2 * xi), [xi]);

  const handleResetDefaults = () => {
    setK(1.0);
    setE0(1.0);
    setTau(0.5);
    setOmega0(10);
    setXi(0.35);
  };

  // =========================================================================
  // 1. CALCUL DE LA RÉPONSE INDICIELLE s(t) ET DES GRADUATIONS TEMPORELLES
  // =========================================================================
  const stepData = useMemo(() => {
    const rawTMax =
      order === 1 ? Math.max(5.5 * tau, 0.5) : Math.max(18 / omega0, 0.2);

    // Calcul d'un pas de graduation "propre" (1, 2, 5 × 10^n) pour l'axe des temps
    const roughStep = rawTMax / 6;
    const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / mag;
    const niceMult = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
    const tickStep = niceMult * mag;
    const tMax = Math.ceil(rawTMax / tickStep) * tickStep;

    const timeTicks: number[] = [];
    for (let t = 0; t <= tMax + 1e-9; t += tickStep) {
      timeTicks.push(Number(t.toFixed(6)));
    }

    const N = 260;
    const points: Array<{ t: number; s: number }> = [];

    for (let i = 0; i <= N; i++) {
      const t = (i / N) * tMax;
      let s = 0;

      if (order === 1) {
        s = K * E0 * (1 - Math.exp(-t / tau));
      } else {
        if (xi < 1) {
          const sq = Math.sqrt(1 - xi * xi);
          const wp = omega0 * sq;
          s =
            K *
            E0 *
            (1 -
              (Math.exp(-xi * omega0 * t) / sq) *
                (sq * Math.cos(wp * t) + xi * Math.sin(wp * t)));
        } else if (Math.abs(xi - 1) < 1e-4) {
          s = K * E0 * (1 - (1 + omega0 * t) * Math.exp(-omega0 * t));
        } else {
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

    return { points, tMax, tickStep, timeTicks, sFinal, overshootPct, tPeak };
  }, [order, K, tau, omega0, xi, E0]);

  // =========================================================================
  // 2. CALCUL DU DIAGRAMME DE BODE (Gain en dB & Phase en degrés)
  // =========================================================================
  const bodeData = useMemo(() => {
    const wc = order === 1 ? 1 / tau : omega0;
    const logCenter = Math.log10(wc);
    const logMin = logCenter - 2;
    const logMax = logCenter + 2;
    const N = 240;

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

    // Décades relatives à wc (0.01 wc, 0.1 wc, wc, 10 wc, 100 wc)
    const decadeTicks = [-2, -1, 0, 1, 2].map((d) => ({
      logW: logCenter + d,
      w: wc * Math.pow(10, d),
      multiplierLabel:
        d === 0
          ? order === 1
            ? "ω_c"
            : "ω₀"
          : `10^${d}·${order === 1 ? "ω_c" : "ω₀"}`,
    }));

    return {
      points,
      logMin,
      logMax,
      wc,
      kDb,
      hasResonance,
      wr,
      mrDb,
      decadeTicks,
    };
  }, [order, K, tau, omega0, xi]);

  // Projection SVG pour la réponse indicielle (680 x 260)
  const stepSvg = useMemo(() => {
    const W = 680;
    const H = 260;
    const padL = 65;
    const padR = 30;
    const padT = 22;
    const padB = 48;

    const maxY = Math.max(stepData.sFinal * 1.65, 0.5);
    const toX = (t: number) => padL + (t / stepData.tMax) * (W - padL - padR);
    const toY = (s: number) => H - padB - (s / maxY) * (H - padT - padB);

    const pathD = stepData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.t).toFixed(1)} ${toY(p.s).toFixed(1)}`
      )
      .join(" ");

    return { W, H, padL, padR, padT, padB, toX, toY, pathD, maxY };
  }, [stepData]);

  // Projection SVG pour le diagramme de Bode (680 x 220 par graphe)
  const bodeSvg = useMemo(() => {
    const W = 680;
    const H = 220;
    const padL = 65;
    const padR = 30;
    const padT = 20;
    const padB = 42;

    const maxG = bodeData.kDb + 24;
    const minG = bodeData.kDb - 85;

    const toX = (logW: number) =>
      padL +
      ((logW - bodeData.logMin) / (bodeData.logMax - bodeData.logMin)) *
        (W - padL - padR);
    const toYG = (g: number) =>
      H - padB - ((g - minG) / (maxG - minG)) * (H - padT - padB);
    // Plage de phase élargie [-195°, +20°] pour que la ligne 0° ne touche jamais le bord haut
    const toYP = (ph: number) =>
      H - padB - ((ph - -195) / (20 - -195)) * (H - padT - padB);

    const gainRealD = bodeData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYG(p.gdb).toFixed(1)}`
      )
      .join(" ");
    const gainAsympD = bodeData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYG(p.gdbAsymp).toFixed(1)}`
      )
      .join(" ");
    const phaseRealD = bodeData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYP(p.phase).toFixed(1)}`
      )
      .join(" ");
    const phaseAsympD = bodeData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.logW).toFixed(1)} ${toYP(p.phaseAsymp).toFixed(1)}`
      )
      .join(" ");

    const gainTicks = [
      bodeData.kDb + 10,
      bodeData.kDb,
      bodeData.kDb - 20,
      bodeData.kDb - 40,
      bodeData.kDb - 60,
      bodeData.kDb - 80,
    ];

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
      gainTicks,
    };
  }, [bodeData]);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. PUPITRE D'INGÉNIERIE : SÉLECTION ET SAISIE EXACTE DES PARAMÈTRES
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pupitre de Commande — Paramètres Système H(p)
              </h2>
              <p className="text-xs text-slate-500">
                Ajustez les curseurs ou saisissez directement vos valeurs numériques exactes dans les encadrés.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sélecteur 1er Ordre vs 2nd Ordre */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setOrder(1)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  order === 1
                    ? "bg-red-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1er Ordre (τ)
              </button>
              <button
                type="button"
                onClick={() => setOrder(2)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  order === 2
                    ? "bg-red-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2nd Ordre (ξ, ω₀, Q)
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Réinitialiser les valeurs par défaut"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grille des contrôleurs avec saisie manuelle */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ParameterControl
            label="Gain statique"
            symbol={`G₀ = ${(20 * Math.log10(Math.max(K, 1e-4))).toFixed(1)} dB`}
            value={K}
            min={0.1}
            max={10.0}
            step={0.1}
            onChange={setK}
            helperLeft="0.1"
            helperRight="10"
            presets={[
              { label: "K = 1 (0 dB)", value: 1 },
              { label: "K = 2 (+6 dB)", value: 2 },
              { label: "K = 10 (+20 dB)", value: 10 },
            ]}
          />

          <ParameterControl
            label="Échelon d'entrée"
            symbol="Consigne E₀"
            value={E0}
            min={0.5}
            max={10.0}
            step={0.5}
            onChange={setE0}
            helperLeft="0.5"
            helperRight={`s(∞) = ${(K * E0).toFixed(2)}`}
            presets={[
              { label: "Unitaire (1)", value: 1 },
              { label: "E₀ = 5", value: 5 },
              { label: "E₀ = 10", value: 10 },
            ]}
          />

          {order === 1 ? (
            <div className="md:col-span-2">
              <ParameterControl
                label="Constante de temps τ"
                symbol={`Pulsation de coupure ω_c = 1/τ = ${(1 / tau).toFixed(2)} rad/s`}
                unit="s"
                value={tau}
                min={0.05}
                max={5.0}
                step={0.05}
                onChange={setTau}
                helperLeft="Rapide (0.05 s)"
                helperRight={`t_r5% ≈ 3τ = ${(3 * tau).toFixed(2)} s`}
                presets={[
                  { label: "τ = 0.1 s", value: 0.1 },
                  { label: "τ = 0.5 s", value: 0.5 },
                  { label: "τ = 1.0 s", value: 1.0 },
                  { label: "τ = 2.0 s", value: 2.0 },
                ]}
              />
            </div>
          ) : (
            <>
              {/* Contrôle couplé Amortissement xi / Facteur de qualité Q */}
              <div className="bg-slate-50/90 rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Amortissement ξ & Qualité Q
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Q = 1 / (2ξ)
                    </span>
                  </div>

                  {/* Double champ de saisie directe : xi ET Q */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 focus-within:border-red-600">
                      <span className="text-[10px] font-mono font-bold text-slate-400 mr-1">
                        ξ:
                      </span>
                      <input
                        type="number"
                        value={Number(xi.toFixed(3))}
                        min={0.05}
                        max={5}
                        step={0.05}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!Number.isNaN(v) && v >= 0.05) setXi(v);
                        }}
                        className="w-12 text-right font-mono text-xs font-extrabold text-red-600 bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1 focus-within:border-red-600">
                      <span className="text-[10px] font-mono font-bold text-slate-400 mr-1">
                        Q:
                      </span>
                      <input
                        type="number"
                        value={Number(Q.toFixed(2))}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onChange={(e) => {
                          const qVal = parseFloat(e.target.value);
                          if (!Number.isNaN(qVal) && qVal >= 0.1) {
                            setXi(1 / (2 * qVal));
                          }
                        }}
                        className="w-11 text-right font-mono text-xs font-extrabold text-slate-800 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0.08}
                    max={2.0}
                    step={0.01}
                    value={Math.min(2.0, Math.max(0.08, xi))}
                    onChange={(e) => setXi(parseFloat(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${
                        ((Math.min(2, xi) - 0.08) / (2 - 0.08)) * 100
                      }%, #cbd5e1 ${
                        ((Math.min(2, xi) - 0.08) / (2 - 0.08)) * 100
                      }%, #cbd5e1 100%)`,
                    }}
                    className="ats-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/70">
                  {[
                    { label: "ξ=0.25 (Q=2)", val: 0.25 },
                    { label: "ξ=0.707", val: 0.707 },
                    { label: "ξ=1 (Crit.)", val: 1.0 },
                    { label: "ξ=1.5", val: 1.5 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setXi(p.val)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer ${
                        Math.abs(xi - p.val) < 1e-2
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white border-slate-200 text-slate-600 hover:border-red-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <ParameterControl
                label="Pulsation propre ω₀"
                symbol={`Fréquence f₀ = ${(omega0 / (2 * Math.PI)).toFixed(2)} Hz`}
                unit="rad/s"
                value={omega0}
                min={1}
                max={100}
                step={1}
                onChange={setOmega0}
                helperLeft="1 rad/s"
                helperRight="100 rad/s"
                presets={[
                  { label: "1 rad/s", value: 1 },
                  { label: "10 rad/s", value: 10 },
                  { label: "50 rad/s", value: 50 },
                  { label: "100 rad/s", value: 100 },
                ]}
              />
            </>
          )}
        </div>

        {/* Bandeau de synthèse des performances calculées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-[10px] font-bold uppercase text-red-600 block">
              Régime Temporel
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {order === 1
                ? "Exponentiel sans dépassement"
                : xi < 1
                ? "Pseudopériodique (oscillant)"
                : Math.abs(xi - 1) < 1e-3
                ? "Critique (le plus rapide sans D₁)"
                : "Apériodique (amorti sans D₁)"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              1er Dépassement D₁ (%)
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 2 && xi < 1
                ? `${stepData.overshootPct.toFixed(1)} % (à t₁ = ${stepData.tPeak?.toFixed(2)} s)`
                : "0 % (Aucun dépassement)"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Résonance en Gain (ξ &lt; 0.707)
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 2 && bodeData.hasResonance
                ? `ω_r = ${bodeData.wr?.toFixed(2)} rad/s (${bodeData.mrDb?.toFixed(1)} dB)`
                : "Aucune résonance"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Gain et Phase en ω = {order === 1 ? "ω_c" : "ω₀"}
            </span>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {order === 1
                ? `${(bodeData.kDb - 3.01).toFixed(1)} dB  |  φ = −45°`
                : `${(bodeData.kDb - 20 * Math.log10(2 * xi)).toFixed(1)} dB  |  φ = −90°`}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. GRAPHIQUE TEMPOREL : RÉPONSE INDICIELLE s(t) AVEC GRADUATIONS
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-600" />
            <span>Réponse Indicielle Temporelle s(t)</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-600">
              <span className="w-3 h-0.5 bg-red-600 inline-block" /> Réponse s(t)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="w-3 h-2 bg-emerald-200 border border-emerald-500 inline-block rounded-xs" />{" "}
              Bande à ±5% de s(∞) = {stepData.sFinal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${stepSvg.W} ${stepSvg.H}`}
            className="w-full h-auto overflow-visible"
          >
            {/* Quadrillage vertical et graduations numériques de temps t */}
            {stepData.timeTicks.map((tVal) => {
              const xPos = stepSvg.toX(tVal);
              return (
                <g key={tVal}>
                  <line
                    x1={xPos}
                    y1={stepSvg.padT}
                    x2={xPos}
                    y2={stepSvg.toY(0)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <line
                    x1={xPos}
                    y1={stepSvg.toY(0)}
                    x2={xPos}
                    y2={stepSvg.toY(0) + 5}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <text
                    x={xPos}
                    y={stepSvg.toY(0) + 18}
                    textAnchor="middle"
                    className="text-[11px] font-mono fill-slate-700 font-bold"
                  >
                    {tVal}s
                  </text>
                </g>
              );
            })}

            {/* Bande verte des ±5% autour de la valeur finale */}
            <rect
              x={stepSvg.padL}
              y={stepSvg.toY(stepData.sFinal * 1.05)}
              width={stepSvg.W - stepSvg.padL - stepSvg.padR}
              height={
                stepSvg.toY(stepData.sFinal * 0.95) -
                stepSvg.toY(stepData.sFinal * 1.05)
              }
              fill="#dcfce7"
              fillOpacity="0.75"
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
              className="text-[11px] font-mono fill-emerald-700 font-bold"
            >
              {stepData.sFinal.toFixed(2)}
            </text>
            <text
              x={stepSvg.padL - 8}
              y={stepSvg.toY(0) + 4}
              textAnchor="end"
              className="text-[11px] font-mono fill-slate-700 font-bold"
            >
              0
            </text>

            {/* Repères physiques spécifiques au 1er ordre : τ et 3τ */}
            {order === 1 && tau <= stepData.tMax && (
              <>
                {/* Tangente à l'origine coupant l'asymptote en t = tau */}
                <line
                  x1={stepSvg.toX(0)}
                  y1={stepSvg.toY(0)}
                  x2={stepSvg.toX(tau)}
                  y2={stepSvg.toY(stepData.sFinal)}
                  stroke="#64748b"
                  strokeWidth="1.3"
                  strokeDasharray="4 3"
                />
                <line
                  x1={stepSvg.toX(tau)}
                  y1={stepSvg.toY(0.632 * stepData.sFinal)}
                  x2={stepSvg.toX(tau)}
                  y2={stepSvg.toY(0)}
                  stroke="#dc2626"
                  strokeWidth="1.3"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={stepSvg.toX(tau)}
                  cy={stepSvg.toY(0.632 * stepData.sFinal)}
                  r="4"
                  fill="#dc2626"
                />
                <text
                  x={stepSvg.toX(tau) + 6}
                  y={stepSvg.toY(0.632 * stepData.sFinal) + 12}
                  style={svgLabelStyle}
                  className="text-[11px] fill-red-600 font-bold"
                >
                  τ (63%)
                </text>

                {3 * tau <= stepData.tMax && (
                  <>
                    <line
                      x1={stepSvg.toX(3 * tau)}
                      y1={stepSvg.toY(0.95 * stepData.sFinal)}
                      x2={stepSvg.toX(3 * tau)}
                      y2={stepSvg.toY(0)}
                      stroke="#16a34a"
                      strokeWidth="1.3"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={stepSvg.toX(3 * tau)}
                      cy={stepSvg.toY(0.95 * stepData.sFinal)}
                      r="4"
                      fill="#16a34a"
                    />
                    <text
                      x={stepSvg.toX(3 * tau) + 6}
                      y={stepSvg.toY(0.95 * stepData.sFinal) + 12}
                      style={svgLabelStyle}
                      className="text-[11px] fill-emerald-700 font-bold"
                    >
                      3τ (95%)
                    </text>
                  </>
                )}
              </>
            )}

            {/* Axes principaux */}
            <line
              x1={stepSvg.padL}
              y1={stepSvg.toY(0)}
              x2={stepSvg.W - stepSvg.padR}
              y2={stepSvg.toY(0)}
              stroke="#334155"
              strokeWidth="1.8"
            />
            <line
              x1={stepSvg.padL}
              y1={stepSvg.toY(0)}
              x2={stepSvg.padL}
              y2={stepSvg.padT}
              stroke="#334155"
              strokeWidth="1.8"
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
                  strokeWidth="1.3"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={stepSvg.toX(stepData.tPeak)}
                  cy={stepSvg.toY(
                    stepData.sFinal * (1 + stepData.overshootPct / 100)
                  )}
                  r="4.5"
                  fill="#dc2626"
                  stroke="#fff"
                  strokeWidth="1.2"
                />
                <text
                  x={stepSvg.toX(stepData.tPeak) + 8}
                  y={Math.max(
                    stepSvg.padT + 12,
                    stepSvg.toY(
                      stepData.sFinal * (1 + stepData.overshootPct / 100)
                    ) - 6
                  )}
                  style={svgLabelStyle}
                  className="text-[11px] fill-red-600 font-bold"
                >
                  D₁ = {stepData.overshootPct.toFixed(1)}% (t₁ ={" "}
                  {stepData.tPeak.toFixed(2)}s)
                </text>
              </>
            )}

            {/* Titre de l'axe des abscisses sous les graduations */}
            <text
              x={(stepSvg.padL + stepSvg.W - stepSvg.padR) / 2}
              y={stepSvg.H - 6}
              textAnchor="middle"
              className="text-xs fill-slate-700 font-bold"
            >
              Temps t (en secondes)
            </text>
          </svg>
        </div>
      </div>

      {/* =====================================================================
          3. DIAGRAMMES DE BODE (GAIN & PHASE AVEC EN-TÊTES DÉGAGÉS)
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span>Diagrammes de Bode — Analyse Fréquentielle H(jω)</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-3 h-0.5 bg-red-600 inline-block" /> Courbe réelle
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-500">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-600 inline-block" />{" "}
              Asymptotes ({order === 1 ? "−20 dB/déc" : "−40 dB/déc"})
            </span>
          </div>
        </div>

        {/* SOUS-BLOC 3A : DIAGRAMME DE GAIN (En-tête propre au-dessus du SVG) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              1. Diagramme de Gain : G_dB(ω) = 20·log|H(jω)| (en dB)
            </span>
            <span className="text-xs font-mono text-slate-500">
              Gain BF = {bodeData.kDb.toFixed(1)} dB
            </span>
          </div>

          <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
              className="w-full h-auto overflow-visible"
            >
              {/* Grille horizontale de Gain */}
              {bodeSvg.gainTicks.map((gVal) => (
                <g key={gVal}>
                  <line
                    x1={bodeSvg.padL}
                    y1={bodeSvg.toYG(gVal)}
                    x2={bodeSvg.W - bodeSvg.padR}
                    y2={bodeSvg.toYG(gVal)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={bodeSvg.padL - 8}
                    y={bodeSvg.toYG(gVal) + 4}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-700 font-bold"
                  >
                    {gVal.toFixed(0)} dB
                  </text>
                </g>
              ))}

              {/* Grille verticale des décades */}
              {bodeData.decadeTicks.map((dt, idx) => {
                const xPos = bodeSvg.toX(dt.logW);
                const isCenter = idx === 2;
                return (
                  <g key={dt.multiplierLabel}>
                    <line
                      x1={xPos}
                      y1={bodeSvg.padT}
                      x2={xPos}
                      y2={bodeSvg.H - bodeSvg.padB}
                      stroke={isCenter ? "#94a3b8" : "#e2e8f0"}
                      strokeWidth={isCenter ? "1.5" : "1"}
                      strokeDasharray={isCenter ? "4 3" : undefined}
                    />
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 16}
                      textAnchor="middle"
                      className={`text-[11px] font-mono ${
                        isCenter
                          ? "fill-red-600 font-extrabold"
                          : "fill-slate-600 font-semibold"
                      }`}
                    >
                      {dt.w < 10 ? dt.w.toFixed(2) : dt.w.toFixed(0)} rad/s
                    </text>
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 30}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-bold"
                    >
                      ({dt.multiplierLabel})
                    </text>
                  </g>
                );
              })}

              {/* Axes Gain */}
              <line
                x1={bodeSvg.padL}
                y1={bodeSvg.H - bodeSvg.padB}
                x2={bodeSvg.W - bodeSvg.padR}
                y2={bodeSvg.H - bodeSvg.padB}
                stroke="#334155"
                strokeWidth="1.8"
              />
              <line
                x1={bodeSvg.padL}
                y1={bodeSvg.H - bodeSvg.padB}
                x2={bodeSvg.padL}
                y2={bodeSvg.padT}
                stroke="#334155"
                strokeWidth="1.8"
              />

              {/* Asymptotes et Courbe réelle de Gain */}
              <path
                d={bodeSvg.gainAsympD}
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <path
                d={bodeSvg.gainRealD}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>

        {/* SOUS-BLOC 3B : DIAGRAMME DE PHASE (En-tête propre au-dessus du SVG, zéro chevauchement !) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              2. Diagramme de Phase : φ(ω) = arg(H(jω)) (en degrés)
            </span>
            <span className="text-xs font-mono text-slate-500">
              Déphasage en {order === 1 ? "ω_c : −45°" : "ω₀ : −90°"} (HF →{" "}
              {order === 1 ? "−90°" : "−180°"})
            </span>
          </div>

          <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
              className="w-full h-auto overflow-visible"
            >
              {/* Grille horizontale des angles remarquables */}
              {[0, -45, -90, -135, -180].map((deg) => (
                <g key={deg}>
                  <line
                    x1={bodeSvg.padL}
                    y1={bodeSvg.toYP(deg)}
                    x2={bodeSvg.W - bodeSvg.padR}
                    y2={bodeSvg.toYP(deg)}
                    stroke={
                      deg === 0 || deg === -90 || deg === -180
                        ? "#cbd5e1"
                        : "#e2e8f0"
                    }
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={bodeSvg.padL - 8}
                    y={bodeSvg.toYP(deg) + 4}
                    textAnchor="end"
                    className="text-[11px] font-mono fill-slate-700 font-bold"
                  >
                    {deg}°
                  </text>
                </g>
              ))}

              {/* Grille verticale des décades */}
              {bodeData.decadeTicks.map((dt, idx) => {
                const xPos = bodeSvg.toX(dt.logW);
                const isCenter = idx === 2;
                return (
                  <g key={dt.multiplierLabel}>
                    <line
                      x1={xPos}
                      y1={bodeSvg.padT}
                      x2={xPos}
                      y2={bodeSvg.H - bodeSvg.padB}
                      stroke={isCenter ? "#94a3b8" : "#e2e8f0"}
                      strokeWidth={isCenter ? "1.5" : "1"}
                      strokeDasharray={isCenter ? "4 3" : undefined}
                    />
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 16}
                      textAnchor="middle"
                      className={`text-[11px] font-mono ${
                        isCenter
                          ? "fill-red-600 font-extrabold"
                          : "fill-slate-600 font-semibold"
                      }`}
                    >
                      {dt.w < 10 ? dt.w.toFixed(2) : dt.w.toFixed(0)} rad/s
                    </text>
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 30}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-bold"
                    >
                      ({dt.multiplierLabel})
                    </text>
                  </g>
                );
              })}

              {/* Axes Phase */}
              <line
                x1={bodeSvg.padL}
                y1={bodeSvg.H - bodeSvg.padB}
                x2={bodeSvg.W - bodeSvg.padR}
                y2={bodeSvg.H - bodeSvg.padB}
                stroke="#334155"
                strokeWidth="1.8"
              />
              <line
                x1={bodeSvg.padL}
                y1={bodeSvg.H - bodeSvg.padB}
                x2={bodeSvg.padL}
                y2={bodeSvg.padT}
                stroke="#334155"
                strokeWidth="1.8"
              />

              {/* Asymptotes et Courbe réelle de Phase */}
              <path
                d={bodeSvg.phaseAsympD}
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <path
                d={bodeSvg.phaseRealD}
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
              />

              {/* Point remarquable de symétrie de phase en wc */}
              <circle
                cx={bodeSvg.toX(Math.log10(bodeData.wc))}
                cy={bodeSvg.toYP(order === 1 ? -45 : -90)}
                r="4.5"
                fill="#dc2626"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}