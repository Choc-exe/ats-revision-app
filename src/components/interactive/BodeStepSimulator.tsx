"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sliders, Activity, TrendingUp, RotateCcw } from "lucide-react";

const svgLabelStyle: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "#f8fafc",
  strokeWidth: "4px",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/**
 * Formatage numérique aux normes françaises (virgule décimale)
 */
function fmtFr(val: number, decimals = 2): string {
  return val
    .toFixed(decimals)
    .replace(/\.?0+$/, (m) => (decimals === 0 ? "" : m))
    .replace(".", ",");
}

function fmtFrFixed(val: number, decimals = 2): string {
  return val.toFixed(decimals).replace(".", ",");
}

/**
 * Champ de saisie numérique contrôlé acceptant la virgule française (ex: "0,707")
 */
function FrenchNumberInput({
  value,
  min,
  max,
  decimals = 2,
  onChange,
  unit,
  prefix,
}: {
  value: number;
  min: number;
  max: number;
  decimals?: number;
  onChange: (v: number) => void;
  unit?: string;
  prefix?: string;
}) {
  const [raw, setRaw] = useState<string>(() => fmtFr(value, decimals));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setRaw(fmtFr(value, decimals));
    }
  }, [value, decimals, focused]);

  const commitValue = (str: string) => {
    const normalized = str.replace(",", ".").trim();
    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setRaw(fmtFr(clamped, decimals));
    } else {
      setRaw(fmtFr(value, decimals));
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--sim-input)",
        borderColor: "var(--sim-border-strong)",
      }}
      className="flex items-center justify-between gap-2 border rounded-lg px-2.5 py-1.5 min-w-0 focus-within:ring-2 focus-within:ring-sky-500/30 transition-all"
    >
      {prefix && (
        <span
          style={{ color: "var(--sim-text-muted)" }}
          className="text-xs font-mono font-bold select-none shrink-0"
        >
          {prefix}
        </span>
      )}
      <div className="flex items-center gap-1.5 ml-auto min-w-0">
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commitValue(raw);
          }}
          onChange={(e) => {
            setRaw(e.target.value);
            const normalized = e.target.value.replace(",", ".");
            const parsed = parseFloat(normalized);
            if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
              onChange(parsed);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          style={{ color: "var(--sim-accent)" }}
          className="w-16 text-right font-mono text-sm font-extrabold bg-transparent focus:outline-none"
        />
        {unit && (
          <span
            style={{ color: "var(--sim-text-muted)" }}
            className="text-xs font-mono font-semibold select-none shrink-0"
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

interface ParameterControlProps {
  label: string;
  symbol: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  decimals?: number;
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
  decimals = 2,
  onChange,
  helperLeft,
  helperRight,
  presets,
}: ParameterControlProps) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div
      style={{
        backgroundColor: "var(--sim-card)",
        borderColor: "var(--sim-border)",
      }}
      className="rounded-xl border p-4 flex flex-col justify-between space-y-3.5 shadow-2xs min-w-0"
    >
      {/* En-tête avec flex-wrap pour éviter toute collision ou troncature */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span
          style={{ color: "var(--sim-text)" }}
          className="text-sm font-bold tracking-tight"
        >
          {label}
        </span>
        <span
          style={{ color: "var(--sim-text-muted)" }}
          className="text-xs font-mono font-medium"
        >
          {symbol}
        </span>
      </div>

      <div className="space-y-2.5">
        <FrenchNumberInput
          prefix="Valeur :"
          value={value}
          min={min}
          max={max * 10}
          decimals={decimals}
          unit={unit}
          onChange={onChange}
        />

        <div className="space-y-1.5 pt-0.5">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={Math.min(max, Math.max(min, value))}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--sim-accent) 0%, var(--sim-accent) ${pct}%, var(--sim-track) ${pct}%, var(--sim-track) 100%)`,
            }}
            className="ats-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
          />

          {(helperLeft || helperRight) && (
            <div
              style={{ color: "var(--sim-text-muted)" }}
              className="flex flex-wrap justify-between gap-2 text-xs font-mono"
            >
              <span>{helperLeft}</span>
              <span>{helperRight}</span>
            </div>
          )}
        </div>
      </div>

      {presets && presets.length > 0 && (
        <div
          style={{ borderColor: "var(--sim-border)" }}
          className="flex flex-wrap gap-1.5 pt-2.5 border-t"
        >
          {presets.map((p) => {
            const active = Math.abs(value - p.value) < 1e-3;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.value)}
                style={
                  active
                    ? {
                        backgroundColor: "var(--sim-accent-soft)",
                        borderColor: "var(--sim-accent)",
                        color: "var(--sim-accent)",
                      }
                    : {
                        backgroundColor: "var(--sim-input)",
                        borderColor: "var(--sim-border)",
                        color: "var(--sim-text-secondary)",
                      }
                }
                className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-md border transition-colors cursor-pointer hover:opacity-90"
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
  const [K, setK] = useState<number>(1.0);
  const [tau, setTau] = useState<number>(0.5);
  const [omega0, setOmega0] = useState<number>(10);
  const [xi, setXi] = useState<number>(0.35);
  const [E0, setE0] = useState<number>(1.0);

  const Q = useMemo(() => 1 / (2 * xi), [xi]);
  const xiPct = Math.min(
    100,
    Math.max(0, ((Math.min(2, xi) - 0.08) / (2 - 0.08)) * 100)
  );

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

  // Projection SVG pour la réponse indicielle (680 x 260) — Axe Y adaptatif au dépassement D1
  const stepSvg = useMemo(() => {
    const W = 680;
    const H = 260;
    const padL = 65;
    const padR = 30;
    const padT = 22;
    const padB = 48;

    const peakVal =
      stepData.sFinal * (1 + (order === 2 ? stepData.overshootPct / 100 : 0));
    const maxY = Math.max(peakVal * 1.18, stepData.sFinal * 1.35, 0.5);
    const toX = (t: number) => padL + (t / stepData.tMax) * (W - padL - padR);
    const toY = (s: number) => H - padB - (s / maxY) * (H - padT - padB);

    const pathD = stepData.points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${toX(p.t).toFixed(1)} ${toY(p.s).toFixed(1)}`
      )
      .join(" ");

    return { W, H, padL, padR, padT, padB, toX, toY, pathD, maxY };
  }, [stepData, order]);

  // Projection SVG pour le diagramme de Bode — Axe Y de Gain 100 % DYNAMIQUE (supporte K=10 et xi=0,08 sans déborder)
  const bodeSvg = useMemo(() => {
    const W = 680;
    const H = 220;
    const padL = 65;
    const padR = 30;
    const padT = 20;
    const padB = 42;

    // Calcul du sommet réel (soit le plateau BF kDb, soit le sommet du pic de résonance mrDb)
    const highestGain = Math.max(
      bodeData.kDb,
      bodeData.mrDb ?? bodeData.kDb
    );
    const lowestGain =
      order === 1 ? bodeData.kDb - 45 : bodeData.kDb - 85;

    // Arrondi propre aux multiples de 20 dB au-dessus et en-dessous
    const topTick = Math.ceil((highestGain + 6) / 20) * 20;
    const bottomTick = Math.floor((lowestGain - 4) / 20) * 20;

    const maxG = topTick + 4;
    const minG = bottomTick - 4;

    const gainTicks: number[] = [];
    for (let g = topTick; g >= bottomTick; g -= 20) {
      gainTicks.push(g);
    }

    const toX = (logW: number) =>
      padL +
      ((logW - bodeData.logMin) / (bodeData.logMax - bodeData.logMin)) *
        (W - padL - padR);
    const toYG = (g: number) =>
      H - padB - ((g - minG) / (maxG - minG)) * (H - padT - padB);
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
  }, [bodeData, order]);

  return (
    <div className="space-y-6">
      {/* =====================================================================
          1. PUPITRE D'INGÉNIERIE : SÉLECTION ET SAISIE EXACTE DES PARAMÈTRES
         ===================================================================== */}
      <div
        style={{
          backgroundColor: "var(--sim-surface)",
          borderColor: "var(--sim-border)",
        }}
        className="rounded-2xl border p-6 shadow-sm space-y-6"
      >
        <div
          style={{ borderColor: "var(--sim-border)" }}
          className="flex flex-wrap items-center justify-between gap-4 border-b pb-4"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: "var(--sim-accent-soft)",
                color: "var(--sim-accent)",
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2
                style={{ color: "var(--sim-text)" }}
                className="text-base font-bold"
              >
                Pupitre de Commande — Paramètres Système H(p)
              </h2>
              <p
                style={{ color: "var(--sim-text-muted)" }}
                className="text-xs"
              >
                Ajustez les curseurs ou saisissez directement vos valeurs numériques (avec virgule).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              style={{
                backgroundColor: "var(--sim-card)",
                borderColor: "var(--sim-border)",
              }}
              className="inline-flex rounded-xl p-1 border"
            >
              <button
                type="button"
                onClick={() => setOrder(1)}
                style={
                  order === 1
                    ? {
                        backgroundColor: "var(--sim-accent)",
                        color: "#0f172a",
                      }
                    : { color: "var(--sim-text-secondary)" }
                }
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  order === 1 ? "text-white dark:text-slate-950 shadow-2xs" : ""
                }`}
              >
                1er Ordre (τ)
              </button>
              <button
                type="button"
                onClick={() => setOrder(2)}
                style={
                  order === 2
                    ? {
                        backgroundColor: "var(--sim-accent)",
                        color: "#0f172a",
                      }
                    : { color: "var(--sim-text-secondary)" }
                }
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                  order === 2 ? "text-white dark:text-slate-950 shadow-2xs" : ""
                }`}
              >
                2nd Ordre (ξ, ω₀, Q)
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                backgroundColor: "var(--sim-card)",
                borderColor: "var(--sim-border)",
                color: "var(--sim-text-secondary)",
              }}
              className="p-2 rounded-xl border hover:opacity-80 transition-opacity cursor-pointer"
              title="Réinitialiser les valeurs par défaut"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grille 2 colonnes fluide et sans collision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParameterControl
            label="Gain statique K"
            symbol={`G₀ = ${fmtFrFixed(20 * Math.log10(Math.max(K, 1e-4)), 1)} dB`}
            value={K}
            min={0.1}
            max={10.0}
            step={0.1}
            decimals={2}
            onChange={setK}
            helperLeft="0,1"
            helperRight="10,0"
            presets={[
              { label: "K = 1 (0 dB)", value: 1 },
              { label: "K = 2 (+6 dB)", value: 2 },
              { label: "K = 10 (+20 dB)", value: 10 },
            ]}
          />

          <ParameterControl
            label="Échelon d'entrée E₀"
            symbol={`Valeur finale s(∞) = ${fmtFrFixed(K * E0, 2)}`}
            value={E0}
            min={0.5}
            max={10.0}
            step={0.5}
            decimals={2}
            onChange={setE0}
            helperLeft="0,5"
            helperRight="10,0"
            presets={[
              { label: "Unitaire (E₀ = 1)", value: 1 },
              { label: "E₀ = 5", value: 5 },
              { label: "E₀ = 10", value: 10 },
            ]}
          />

          {order === 1 ? (
            <div className="md:col-span-2">
              <ParameterControl
                label="Constante de temps τ"
                symbol={`ω_c = 1/τ = ${fmtFrFixed(1 / tau, 2)} rad/s`}
                unit="s"
                value={tau}
                min={0.05}
                max={5.0}
                step={0.05}
                decimals={2}
                onChange={setTau}
                helperLeft="Rapide (0,05 s)"
                helperRight={`t_r5% ≈ 3τ = ${fmtFrFixed(3 * tau, 2)} s`}
                presets={[
                  { label: "τ = 0,1 s", value: 0.1 },
                  { label: "τ = 0,5 s", value: 0.5 },
                  { label: "τ = 1,0 s", value: 1.0 },
                  { label: "τ = 2,0 s", value: 2.0 },
                ]}
              />
            </div>
          ) : (
            <>
              {/* Carte Amortissement ξ & Facteur de qualité Q */}
              <div
                style={{
                  backgroundColor: "var(--sim-card)",
                  borderColor: "var(--sim-border)",
                }}
                className="rounded-xl border p-4 flex flex-col justify-between space-y-3.5 shadow-2xs min-w-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span
                    style={{ color: "var(--sim-text)" }}
                    className="text-sm font-bold tracking-tight"
                  >
                    Amortissement ξ & Qualité Q
                  </span>
                  <span
                    style={{ color: "var(--sim-text-muted)" }}
                    className="text-xs font-mono font-medium"
                  >
                    Q = 1 / (2ξ)
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <FrenchNumberInput
                      prefix="ξ (SII) :"
                      value={xi}
                      min={0.05}
                      max={5.0}
                      decimals={3}
                      onChange={setXi}
                    />
                    <FrenchNumberInput
                      prefix="Q (Phys.) :"
                      value={Q}
                      min={0.1}
                      max={10.0}
                      decimals={2}
                      onChange={(qVal) => setXi(1 / (2 * qVal))}
                    />
                  </div>

                  <div className="space-y-1.5 pt-0.5">
                    <input
                      type="range"
                      min={0.08}
                      max={2.0}
                      step={0.01}
                      value={Math.min(2.0, Math.max(0.08, xi))}
                      onChange={(e) => setXi(parseFloat(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, var(--sim-accent) 0%, var(--sim-accent) ${xiPct}%, var(--sim-track) ${xiPct}%, var(--sim-track) 100%)`,
                      }}
                      className="ats-range-slider w-full h-2 rounded-lg appearance-none cursor-pointer"
                    />
                    <div
                      style={{ color: "var(--sim-text-muted)" }}
                      className="flex flex-wrap justify-between gap-2 text-xs font-mono"
                    >
                      <span>ξ = 0,08 (Q = 6,25)</span>
                      <span>ξ = 2,0 (Q = 0,25)</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{ borderColor: "var(--sim-border)" }}
                  className="flex flex-wrap gap-1.5 pt-2.5 border-t"
                >
                  {[
                    { label: "ξ = 0,25 (Q = 2)", val: 0.25 },
                    { label: "ξ = 0,707 (Butterworth)", val: 0.707 },
                    { label: "ξ = 1,0 (Critique)", val: 1.0 },
                    { label: "ξ = 1,5 (Apériodique)", val: 1.5 },
                  ].map((p) => {
                    const active = Math.abs(xi - p.val) < 1e-2;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setXi(p.val)}
                        style={
                          active
                            ? {
                                backgroundColor: "var(--sim-accent-soft)",
                                borderColor: "var(--sim-accent)",
                                color: "var(--sim-accent)",
                              }
                            : {
                                backgroundColor: "var(--sim-input)",
                                borderColor: "var(--sim-border)",
                                color: "var(--sim-text-secondary)",
                              }
                        }
                        className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-md border transition-colors cursor-pointer hover:opacity-90"
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <ParameterControl
                label="Pulsation propre ω₀"
                symbol={`f₀ = ${fmtFrFixed(omega0 / (2 * Math.PI), 2)} Hz`}
                unit="rad/s"
                value={omega0}
                min={1}
                max={100}
                step={1}
                decimals={1}
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

        {/* Cartes de synthèse avec virgules françaises et protection du symbole ξ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div
            style={{
              backgroundColor: "var(--sim-card)",
              borderColor: "var(--sim-border)",
            }}
            className="p-3.5 rounded-xl border space-y-1"
          >
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: "var(--sim-accent)" }}
                className="w-2 h-2 rounded-full shrink-0"
              />
              <span
                style={{ color: "var(--sim-text-muted)" }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Régime Temporel
              </span>
            </div>
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold block"
            >
              {order === 1
                ? "Exponentiel (sans D₁)"
                : xi < 1
                ? "Pseudopériodique (oscillant)"
                : Math.abs(xi - 1) < 1e-3
                ? "Critique (sans dépassement)"
                : "Apériodique (amorti)"}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--sim-card)",
              borderColor: "var(--sim-border)",
            }}
            className="p-3.5 rounded-xl border space-y-1"
          >
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="text-[11px] font-bold block"
            >
              1ER DÉPASSEMENT D₁ (%)
            </span>
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold font-mono block"
            >
              {order === 2 && xi < 1 && stepData.tPeak
                ? `${fmtFrFixed(stepData.overshootPct, 1)} % (à t₁ = ${fmtFrFixed(stepData.tPeak, 2)} s)`
                : "0 % (Aucun dépassement)"}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--sim-card)",
              borderColor: "var(--sim-border)",
            }}
            className="p-3.5 rounded-xl border space-y-1"
          >
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="text-[11px] font-bold block"
            >
              <span className="uppercase tracking-wider">Résonance en Gain</span>{" "}
              <span className="font-mono">(ξ &lt; 0,707)</span>
            </span>
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold font-mono block"
            >
              {order === 2 &&
              bodeData.hasResonance &&
              bodeData.wr !== null &&
              bodeData.mrDb !== null
                ? `ω_r = ${fmtFrFixed(bodeData.wr, 2)} rad/s (${fmtFrFixed(bodeData.mrDb, 1)} dB)`
                : "Aucune résonance"}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--sim-card)",
              borderColor: "var(--sim-border)",
            }}
            className="p-3.5 rounded-xl border space-y-1"
          >
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="text-[11px] font-bold block"
            >
              <span className="uppercase tracking-wider">Gain & Phase en</span>{" "}
              <span className="font-mono">
                ω = {order === 1 ? "ω_c" : "ω₀"}
              </span>
            </span>
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold font-mono block"
            >
              {order === 1
                ? `${fmtFrFixed(bodeData.kDb - 3.01, 1)} dB  |  φ = −45°`
                : `${fmtFrFixed(bodeData.kDb - 20 * Math.log10(2 * xi), 1)} dB  |  φ = −90°`}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. GRAPHIQUE TEMPOREL : RÉPONSE INDICIELLE s(t) AVEC GRADUATIONS
         ===================================================================== */}
      <div
        style={{
          backgroundColor: "var(--sim-surface)",
          borderColor: "var(--sim-border)",
        }}
        className="rounded-2xl border p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            style={{ color: "var(--sim-text)" }}
            className="text-sm font-bold flex items-center gap-2"
          >
            <Activity
              style={{ color: "var(--sim-accent)" }}
              className="w-4 h-4"
            />
            <span>Réponse Indicielle Temporelle s(t)</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span
              style={{ color: "var(--sim-text-secondary)" }}
              className="flex items-center gap-1.5 font-semibold"
            >
              <span className="w-3 h-0.5 bg-red-600 inline-block" /> Courbe s(t)
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-2 bg-emerald-200 border border-emerald-500 inline-block rounded-xs" />{" "}
              Bande à ±5 % de s(∞) = {fmtFrFixed(stepData.sFinal, 2)}
            </span>
          </div>
        </div>

        <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${stepSvg.W} ${stepSvg.H}`}
            className="w-full h-auto overflow-visible"
          >
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
                    {fmtFr(tVal, 2)} s
                  </text>
                </g>
              );
            })}

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
              {fmtFrFixed(stepData.sFinal, 2)}
            </text>
            <text
              x={stepSvg.padL - 8}
              y={stepSvg.toY(0) + 4}
              textAnchor="end"
              className="text-[11px] font-mono fill-slate-700 font-bold"
            >
              0
            </text>

            {order === 1 && tau <= stepData.tMax && (
              <>
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
                  τ (63 %)
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
                      3τ (95 %)
                    </text>
                  </>
                )}
              </>
            )}

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

            <path
              d={stepSvg.pathD}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
            />

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
                  D₁ = {fmtFrFixed(stepData.overshootPct, 1)} % (t₁ ={" "}
                  {fmtFrFixed(stepData.tPeak, 2)} s)
                </text>
              </>
            )}

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
          3. DIAGRAMMES DE BODE (AXE Y DE GAIN ADAPTATIF & VIRGULES FRANÇAISES)
         ===================================================================== */}
      <div
        style={{
          backgroundColor: "var(--sim-surface)",
          borderColor: "var(--sim-border)",
        }}
        className="rounded-2xl border p-6 shadow-sm space-y-5"
      >
        <div
          style={{ borderColor: "var(--sim-border)" }}
          className="flex flex-wrap items-center justify-between gap-2 border-b pb-3"
        >
          <h3
            style={{ color: "var(--sim-text)" }}
            className="text-sm font-bold flex items-center gap-2"
          >
            <TrendingUp
              style={{ color: "var(--sim-accent)" }}
              className="w-4 h-4"
            />
            <span>Diagrammes de Bode — Analyse Fréquentielle H(jω)</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span
              style={{ color: "var(--sim-text-secondary)" }}
              className="flex items-center gap-1.5 font-semibold"
            >
              <span className="w-3 h-0.5 bg-red-600 inline-block" /> Courbe réelle
            </span>
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="flex items-center gap-1.5 font-semibold"
            >
              <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-500 inline-block" />{" "}
              Asymptotes ({order === 1 ? "−20 dB/déc" : "−40 dB/déc"})
            </span>
          </div>
        </div>

        {/* SOUS-BLOC 3A : DIAGRAMME DE GAIN */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold tracking-wide"
            >
              1. DIAGRAMME DE GAIN : G_dB(ω) = 20·log|H(jω)| (en dB)
            </span>
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="text-xs font-mono"
            >
              Asymptote BF = {fmtFrFixed(bodeData.kDb, 1)} dB | Pente HF ={" "}
              {order === 1 ? "−20 dB/déc" : "−40 dB/déc"}
            </span>
          </div>

          <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
              className="w-full h-auto overflow-visible"
            >
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
                    {gVal > 0 ? `+${gVal}` : gVal} dB
                  </text>
                </g>
              ))}

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
                          ? "fill-blue-600 font-extrabold"
                          : "fill-slate-600 font-semibold"
                      }`}
                    >
                      {dt.w < 10 ? fmtFr(dt.w, 2) : fmtFr(dt.w, 0)} rad/s
                    </text>
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 30}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-bold"
                    >
                      ({dt.multiplierLabel})
                    </text>
                  </g>
                );
              })}

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

        {/* SOUS-BLOC 3B : DIAGRAMME DE PHASE */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <span
              style={{ color: "var(--sim-text)" }}
              className="text-xs font-extrabold tracking-wide"
            >
              2. DIAGRAMME DE PHASE : φ(ω) = arg(H(jω)) (en degrés)
            </span>
            <span
              style={{ color: "var(--sim-text-muted)" }}
              className="text-xs font-mono"
            >
              Déphasage en {order === 1 ? "ω_c : −45°" : "ω₀ : −90°"} (HF →{" "}
              {order === 1 ? "−90°" : "−180°"})
            </span>
          </div>

          <div className="schema-canvas rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${bodeSvg.W} ${bodeSvg.H}`}
              className="w-full h-auto overflow-visible"
            >
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
                          ? "fill-blue-600 font-extrabold"
                          : "fill-slate-600 font-semibold"
                      }`}
                    >
                      {dt.w < 10 ? fmtFr(dt.w, 2) : fmtFr(dt.w, 0)} rad/s
                    </text>
                    <text
                      x={xPos}
                      y={bodeSvg.H - bodeSvg.padB + 30}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-bold"
                    >
                      ({dt.multiplierLabel})
                    </text>
                  </g>
                );
              })}

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