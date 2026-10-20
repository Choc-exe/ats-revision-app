"use client";

import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SchemaPlaceholderProps {
  src: string;
  alt: string;
  caption?: string;
}

// Style appliqué aux textes SVG : crée un contour blanc fin autour des lettres
// pour qu'un trait passant dessous ne gêne jamais la lecture.
const labelStyle: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "#f8fafc",
  strokeWidth: "4px",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const BUILTIN_SCHEMAS: Record<string, React.ReactNode> = {
  // 1. Physique Chap 1 : Base polaire / cylindrique
  "/images/physique-chimie/base-polaire-cylindrique.png": (
    <svg viewBox="0 0 600 250" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="arrow-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>
      <line x1="80" y1="200" x2="480" y2="200" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
      <line x1="120" y1="230" x2="120" y2="25" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
      <text x="490" y="204" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>
      <text x="102" y="30" style={labelStyle} className="text-xs fill-slate-700 font-bold">y</text>
      <text x="100" y="218" style={labelStyle} className="text-xs fill-slate-700 font-bold">O</text>

      <line x1="120" y1="200" x2="185" y2="200" stroke="#334155" strokeWidth="2.5" markerEnd="url(#arrow-slate)" />
      <line x1="120" y1="200" x2="120" y2="135" stroke="#334155" strokeWidth="2.5" markerEnd="url(#arrow-slate)" />
      <text x="150" y="220" style={labelStyle} className="text-xs fill-slate-900 font-bold">u_x</text>
      <text x="88" y="165" style={labelStyle} className="text-xs fill-slate-900 font-bold">u_y</text>

      <line x1="120" y1="200" x2="320" y2="90" stroke="#475569" strokeWidth="2" strokeDasharray="5 4" />
      <path d="M 190 200 A 70 70 0 0 0 181 166" fill="none" stroke="#dc2626" strokeWidth="2" />
      <text x="200" y="185" style={labelStyle} className="text-xs fill-red-600 font-bold">θ</text>
      <text x="215" y="135" style={labelStyle} className="text-xs fill-slate-700 font-bold">r = OM</text>

      <circle cx="320" cy="90" r="4.5" fill="#dc2626" />
      <text x="332" y="105" style={labelStyle} className="text-xs fill-slate-900 font-bold">M(r, θ)</text>
      <line x1="320" y1="90" x2="390" y2="52" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
      <line x1="320" y1="90" x2="282" y2="22" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
      <text x="400" y="55" style={labelStyle} className="text-xs fill-red-600 font-bold">u_r</text>
      <text x="245" y="25" style={labelStyle} className="text-xs fill-red-600 font-bold">u_θ</text>
    </svg>
  ),

  // 2. Physique Chap 1 : Puits d'énergie potentielle
  "/images/physique-chimie/puits-energie-potentielle.png": (
    <svg viewBox="0 0 600 250" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="60" y1="205" x2="530" y2="205" stroke="#334155" strokeWidth="1.5" />
      <line x1="70" y1="220" x2="70" y2="20" stroke="#334155" strokeWidth="1.5" />
      <text x="540" y="210" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>
      <text x="80" y="30" style={labelStyle} className="text-xs fill-slate-700 font-bold">E_p(x)</text>

      <path d="M 95 45 Q 195 255 300 110 T 500 165" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      <line x1="70" y1="125" x2="510" y2="125" stroke="#dc2626" strokeWidth="2" strokeDasharray="6 4" />
      <text x="410" y="112" style={labelStyle} className="text-xs fill-red-600 font-bold">E_m = E_c + E_p (cte)</text>

      <circle cx="198" cy="172" r="5" fill="#16a34a" />
      <text x="135" y="195" style={labelStyle} className="text-xs fill-emerald-700 font-bold">Équilibre stable (min)</text>
      <circle cx="352" cy="82" r="5" fill="#dc2626" />
      <text x="295" y="65" style={labelStyle} className="text-xs fill-red-600 font-bold">Équilibre instable (max)</text>
    </svg>
  ),

  // 3. Maths Chap 1 : Racines n-ièmes de l'unité
  "/images/mathematiques/racines-unite-cercle.png": (
    <svg viewBox="0 0 600 250" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="140" y1="125" x2="460" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="300" y1="15" x2="300" y2="235" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="300" cy="125" r="85" fill="none" stroke="#334155" strokeWidth="2" />

      <polygon points="385,125 257.5,51.4 257.5,198.6" fill="#fef2f2" fillOpacity="0.65" stroke="#dc2626" strokeWidth="2" />
      <circle cx="385" cy="125" r="5" fill="#dc2626" />
      <circle cx="257.5" cy="51.4" r="5" fill="#dc2626" />
      <circle cx="257.5" cy="198.6" r="5" fill="#dc2626" />

      <text x="398" y="115" style={labelStyle} className="text-xs fill-red-600 font-bold">z₀ = 1</text>
      <text x="155" y="45" style={labelStyle} className="text-xs fill-red-600 font-bold">j = e^(2iπ/3)</text>
      <text x="150" y="212" style={labelStyle} className="text-xs fill-red-600 font-bold">j² = e^(-2iπ/3)</text>
      <text x="445" y="142" style={labelStyle} className="text-xs fill-slate-600 font-semibold">Re</text>
      <text x="310" y="28" style={labelStyle} className="text-xs fill-slate-600 font-semibold">Im</text>
    </svg>
  ),

  // 4. SII Chap 1 : Schéma-blocs d'un système asservi
  "/images/sii/structure-systeme-asservi.png": (
    <svg viewBox="0 0 620 220" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="arr-sii" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>
      <line x1="30" y1="70" x2="98" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="35" y="56" style={labelStyle} className="text-xs fill-slate-800 font-bold">Consigne E(p)</text>
      <circle cx="118" cy="70" r="16" fill="#fff" stroke="#dc2626" strokeWidth="2" />
      <text x="106" y="68" className="text-xs fill-slate-800 font-bold">+</text>
      <text x="115" y="83" className="text-xs fill-red-600 font-bold">−</text>

      <line x1="134" y1="70" x2="195" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="152" y="56" style={labelStyle} className="text-xs fill-red-600 font-bold">ε(p)</text>
      <rect x="200" y="45" width="115" height="50" rx="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="214" y="74" className="text-xs fill-red-700 font-bold">Correcteur C(p)</text>

      <line x1="315" y1="70" x2="365" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <rect x="370" y="45" width="120" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="385" y="74" className="text-xs fill-slate-800 font-bold">Processus H(p)</text>

      <line x1="490" y1="70" x2="585" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="515" y="56" style={labelStyle} className="text-xs fill-slate-800 font-bold">Sortie S(p)</text>

      <line x1="530" y1="70" x2="530" y2="165" stroke="#334155" strokeWidth="2" />
      <line x1="530" y1="165" x2="355" y2="165" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <rect x="235" y="140" width="115" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="252" y="169" className="text-xs fill-slate-700 font-bold">Capteur B(p)</text>
      <line x1="235" y1="165" x2="118" y2="165" stroke="#334155" strokeWidth="2" />
      <line x1="118" y1="165" x2="118" y2="90" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="132" y="154" style={labelStyle} className="text-xs fill-slate-600 font-semibold">Mesure M(p)</text>
    </svg>
  ),

  // 5. SII Chap 1 : Réponses indicielles d'ordre 1 et 2
  "/images/sii/reponses-indicielles-ordre-1-2.png": (
    <svg viewBox="0 0 600 250" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="60" y1="205" x2="540" y2="205" stroke="#334155" strokeWidth="1.5" />
      <line x1="60" y1="215" x2="60" y2="20" stroke="#334155" strokeWidth="1.5" />

      <line x1="60" y1="95" x2="530" y2="95" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="20" y="99" style={labelStyle} className="text-xs fill-slate-700 font-bold">s_∞</text>

      <line x1="60" y1="205" x2="170" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="170" y1="95" x2="170" y2="205" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
      <text x="165" y="225" style={labelStyle} className="text-xs fill-slate-700 font-bold">τ</text>

      <path d="M 60 205 Q 130 110 520 96" fill="none" stroke="#334155" strokeWidth="2.5" />
      <text x="360" y="128" style={labelStyle} className="text-xs fill-slate-800 font-bold">1er ordre (pente initiale ≠ 0)</text>

      <path d="M 60 205 C 105 205, 145 35, 210 50 C 265 65, 290 120, 345 88 C 390 78, 435 97, 520 95" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <text x="185" y="32" style={labelStyle} className="text-xs fill-red-600 font-bold">2nd ordre (0 &lt; ξ &lt; 1 : dépassement D₁)</text>
      <text x="548" y="210" style={labelStyle} className="text-xs fill-slate-700 font-bold">t</text>
    </svg>
  ),

  // 6. Informatique Chap 2 : Intégration par rectangles et trapèzes
  "/images/informatique/integration-rectangles-trapezes.png": (
    <svg viewBox="0 0 600 240" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="50" y1="190" x2="540" y2="190" stroke="#334155" strokeWidth="1.5" />
      <line x1="70" y1="205" x2="70" y2="20" stroke="#334155" strokeWidth="1.5" />

      <rect x="105" y="135" width="90" height="55" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
      <rect x="195" y="88" width="90" height="102" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />

      <polygon points="285,190 285,62 375,78 375,190" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <polygon points="375,190 375,78 465,125 465,190" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />

      <path d="M 85 152 Q 260 22 490 142" fill="none" stroke="#0f172a" strokeWidth="2.5" />
      <text x="120" y="215" style={labelStyle} className="text-xs fill-slate-700 font-bold">Rectangles à gauche</text>
      <text x="315" y="215" style={labelStyle} className="text-xs fill-red-600 font-bold">Trapèzes (plus précis)</text>
    </svg>
  ),

  // 7. Physique Chap 2 : Machine cyclique ditherme
  "/images/physique-chimie/machine-ditherme.png": (
    <svg viewBox="0 0 600 240" className="w-full max-w-xl h-auto overflow-visible">
      <rect x="70" y="35" width="130" height="150" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="90" y="102" className="text-xs fill-red-700 font-bold">Source Chaude</text>
      <text x="122" y="125" className="text-sm fill-red-600 font-extrabold">T_C</text>

      <circle cx="300" cy="110" r="45" fill="#fff" stroke="#334155" strokeWidth="2.5" />
      <text x="262" y="114" className="text-xs fill-slate-900 font-bold">Machine (Cycle)</text>

      <rect x="400" y="35" width="130" height="150" rx="8" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <text x="422" y="102" className="text-xs fill-slate-700 font-bold">Source Froide</text>
      <text x="455" y="125" className="text-sm fill-slate-800 font-extrabold">T_F</text>

      <line x1="200" y1="110" x2="255" y2="110" stroke="#dc2626" strokeWidth="2.5" />
      <text x="218" y="96" style={labelStyle} className="text-xs fill-red-600 font-bold">Q_C</text>
      <line x1="345" y1="110" x2="400" y2="110" stroke="#334155" strokeWidth="2.5" />
      <text x="362" y="96" style={labelStyle} className="text-xs fill-slate-800 font-bold">Q_F</text>
      <line x1="300" y1="155" x2="300" y2="215" stroke="#dc2626" strokeWidth="2.5" />
      <text x="312" y="205" style={labelStyle} className="text-xs fill-red-600 font-bold">Travail W</text>
    </svg>
  ),

  // 8. Physique Chap 3 : Résonance de courant RLC série
  "/images/physique-chimie/resonance-courant-rlc.png": (
    <svg viewBox="0 0 600 250" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="60" y1="205" x2="530" y2="205" stroke="#334155" strokeWidth="1.5" />
      <line x1="60" y1="215" x2="60" y2="20" stroke="#334155" strokeWidth="1.5" />

      <path d="M 60 205 Q 200 198 245 95 Q 270 25 295 95 Q 340 198 510 202" fill="none" stroke="#dc2626" strokeWidth="2.5" />

      <line x1="60" y1="100" x2="296" y2="100" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="244" y1="100" x2="244" y2="205" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="296" y1="100" x2="296" y2="205" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="270" y1="42" x2="270" y2="205" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />

      <text x="262" y="225" style={labelStyle} className="text-xs fill-slate-900 font-bold">ω₀</text>
      <text x="230" y="225" style={labelStyle} className="text-xs fill-red-600 font-bold">ω₁</text>
      <text x="296" y="225" style={labelStyle} className="text-xs fill-red-600 font-bold">ω₂</text>
      <text x="312" y="104" style={labelStyle} className="text-xs fill-red-600 font-bold">Δω = ω₀ / Q (à I_max / √2)</text>
      <text x="75" y="45" style={labelStyle} className="text-xs fill-slate-900 font-bold">I_max = E_m / R</text>
    </svg>
  ),

  // 9. Physique Chap 4 : Tube de courant / Effet Venturi
  "/images/physique-chimie/tube-de-courant-venturi.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <path d="M 50 45 L 190 45 Q 280 45 315 80 L 530 80" fill="none" stroke="#1e293b" strokeWidth="3" />
      <path d="M 50 175 L 190 175 Q 280 175 315 140 L 530 140" fill="none" stroke="#1e293b" strokeWidth="3" />

      <ellipse cx="120" cy="110" rx="14" ry="65" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <ellipse cx="395" cy="110" rx="9" ry="30" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />

      <line x1="120" y1="110" x2="185" y2="110" stroke="#334155" strokeWidth="3" />
      <text x="65" y="28" style={labelStyle} className="text-xs fill-slate-800 font-bold">Section S₁ grande (v₁ faible, P₁ élevée)</text>
      <line x1="395" y1="110" x2="505" y2="110" stroke="#dc2626" strokeWidth="3" />
      <text x="325" y="62" style={labelStyle} className="text-xs fill-red-600 font-bold">Section S₂ réduite (v₂ élevée, P₂ faible)</text>
    </svg>
  ),

  // 10. Physique Chap 5 : Paroi multicouche et résistances thermiques en série
  "/images/physique-chimie/resistances-thermiques-serie.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <rect x="55" y="40" width="50" height="140" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <rect x="105" y="40" width="65" height="140" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="170" y="40" width="40" height="140" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
      <text x="25" y="115" style={labelStyle} className="text-xs fill-red-600 font-bold">T₁</text>
      <text x="220" y="115" style={labelStyle} className="text-xs fill-slate-800 font-bold">T₂</text>
      <text x="115" y="115" className="text-xs fill-red-700 font-bold">Isolant</text>

      <line x1="275" y1="110" x2="310" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="310" y="94" width="60" height="32" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="323" y="114" className="text-xs fill-slate-800 font-bold">R_th1</text>

      <line x1="370" y1="110" x2="400" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="400" y="94" width="65" height="32" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="415" y="114" className="text-xs fill-red-600 font-bold">R_th2</text>

      <line x1="465" y1="110" x2="495" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="495" y="94" width="60" height="32" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="508" y="114" className="text-xs fill-slate-800 font-bold">R_th3</text>
      <text x="330" y="68" style={labelStyle} className="text-xs fill-red-600 font-bold">Même flux Φ → R_eq = R_th1 + R_th2 + R_th3</text>
    </svg>
  ),

  // 11. Physique Chap 6 : Rails de Laplace
  "/images/physique-chimie/rails-de-laplace.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="90" y1="55" x2="500" y2="55" stroke="#334155" strokeWidth="2.5" />
      <line x1="90" y1="170" x2="500" y2="170" stroke="#334155" strokeWidth="2.5" />
      <line x1="90" y1="55" x2="90" y2="85" stroke="#334155" strokeWidth="2" />
      <rect x="78" y="85" width="24" height="55" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="55" y="118" style={labelStyle} className="text-xs fill-slate-800 font-bold">R</text>
      <line x1="90" y1="140" x2="90" y2="170" stroke="#334155" strokeWidth="2" />

      <line x1="320" y1="38" x2="320" y2="188" stroke="#dc2626" strokeWidth="4.5" />
      <text x="313" y="28" style={labelStyle} className="text-xs fill-red-600 font-bold">N</text>
      <text x="313" y="208" style={labelStyle} className="text-xs fill-red-600 font-bold">M</text>

      <line x1="320" y1="100" x2="415" y2="100" stroke="#334155" strokeWidth="2.5" />
      <text x="355" y="88" style={labelStyle} className="text-xs fill-slate-900 font-bold">v(t) u_x</text>
      <line x1="320" y1="130" x2="235" y2="130" stroke="#dc2626" strokeWidth="2.5" />
      <text x="215" y="152" style={labelStyle} className="text-xs fill-red-600 font-bold">F_Laplace</text>

      <circle cx="175" cy="95" r="9" fill="#fff" stroke="#475569" strokeWidth="1.5" />
      <circle cx="175" cy="95" r="2.5" fill="#475569" />
      <text x="192" y="100" style={labelStyle} className="text-xs fill-slate-800 font-bold">B u_z</text>
    </svg>
  ),

  // 12. Physique Chap 7 : Trièdre direct OPPM (k, E, B)
  "/images/physique-chimie/structure-oppm-triedre.png": (
    <svg viewBox="0 0 600 240" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="70" y1="120" x2="520" y2="120" stroke="#334155" strokeWidth="2" />
      <text x="415" y="105" style={labelStyle} className="text-xs fill-slate-900 font-bold">k (Propagation x)</text>

      <line x1="110" y1="205" x2="110" y2="25" stroke="#334155" strokeWidth="1.5" />
      <text x="120" y="32" style={labelStyle} className="text-xs fill-red-600 font-bold">Champ E (polarisation y)</text>
      <path d="M 110 120 Q 175 25 240 120 T 370 120" fill="none" stroke="#dc2626" strokeWidth="2.5" />

      <line x1="110" y1="120" x2="50" y2="195" stroke="#334155" strokeWidth="1.5" />
      <text x="25" y="212" style={labelStyle} className="text-xs fill-slate-800 font-bold">Champ B (z)</text>
      <path d="M 110 120 Q 155 175 240 120 T 370 120" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
      <text x="275" y="45" style={labelStyle} className="text-xs fill-red-600 font-bold">Trièdre direct (k, E, B) et B = E / c</text>
    </svg>
  ),

  // 13. Maths Chap 2 : Géométrie dans l'espace
  "/images/mathematiques/geometrie-espace-plan-droite.png": (
    <svg viewBox="0 0 600 240" className="w-full max-w-xl h-auto overflow-visible">
      <polygon points="85,190 185,105 495,105 395,190" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
      <text x="115" y="178" style={labelStyle} className="text-xs fill-slate-800 font-bold">Plan P : ax + by + cz + d = 0</text>

      <line x1="290" y1="145" x2="290" y2="40" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="290" y="133" width="12" height="12" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <circle cx="290" cy="145" r="4" fill="#334155" />
      <text x="268" y="162" style={labelStyle} className="text-xs fill-slate-900 font-bold">H</text>
      <circle cx="290" cy="40" r="5" fill="#dc2626" />
      <text x="305" y="45" style={labelStyle} className="text-xs fill-red-600 font-bold">M₀(x₀, y₀, z₀)</text>

      <line x1="395" y1="145" x2="395" y2="65" stroke="#dc2626" strokeWidth="2.5" />
      <text x="408" y="82" style={labelStyle} className="text-xs fill-red-600 font-bold">Vecteur normal n(a, b, c)</text>
    </svg>
  ),

  // 14. SII Chap 2 : Fermeture géométrique Bielle-Manivelle
  "/images/sii/fermeture-geometrique-bielle-manivelle.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="60" y1="150" x2="520" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="120" y1="150" x2="210" y2="55" stroke="#dc2626" strokeWidth="3.5" />
      <line x1="210" y1="55" x2="420" y2="150" stroke="#334155" strokeWidth="3.5" />

      <rect x="392" y="130" width="56" height="40" rx="5" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <circle cx="120" cy="150" r="5" fill="#334155" />
      <circle cx="210" cy="55" r="5" fill="#dc2626" />
      <circle cx="420" cy="150" r="5" fill="#334155" />

      <text x="102" y="175" style={labelStyle} className="text-xs fill-slate-900 font-bold">O</text>
      <text x="180" y="40" style={labelStyle} className="text-xs fill-red-600 font-bold">A (Manivelle R)</text>
      <text x="395" y="190" style={labelStyle} className="text-xs fill-slate-900 font-bold">B (Piston x(t))</text>
      <text x="200" y="212" style={labelStyle} className="text-xs fill-red-600 font-bold">Fermeture géométrique : OA + AB + BO = 0</text>
    </svg>
  ),

  // 15. SII Chap 3 : Coupure RDM et Torseur de cohésion
  "/images/sii/rdm-coupure-torseur-cohesion.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <rect x="70" y="85" width="220" height="55" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <line x1="70" y1="55" x2="70" y2="170" stroke="#334155" strokeWidth="4.5" />
      <text x="125" y="118" className="text-xs fill-slate-800 font-bold">Tronçon gauche E₁ [0, x]</text>

      <circle cx="290" cy="112" r="5" fill="#dc2626" />
      <text x="255" y="132" style={labelStyle} className="text-xs fill-slate-900 font-bold">G(x)</text>

      <line x1="290" y1="112" x2="395" y2="112" stroke="#dc2626" strokeWidth="2.5" />
      <text x="405" y="116" style={labelStyle} className="text-xs fill-red-600 font-bold">Effort normal N(x)</text>

      <line x1="290" y1="112" x2="290" y2="32" stroke="#dc2626" strokeWidth="2.5" />
      <text x="302" y="42" style={labelStyle} className="text-xs fill-red-600 font-bold">Effort tranchant T_y(x)</text>

      <path d="M 330 150 A 42 42 0 0 0 330 75" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <text x="348" y="80" style={labelStyle} className="text-xs fill-red-600 font-bold">Moment fléchissant M_fz(x)</text>
    </svg>
  ),

  // 16. SII Chap 4 : Modèle MCC et 4 Quadrants
  "/images/sii/modele-mcc-4-quadrants.png": (
    <svg viewBox="0 0 600 230" className="w-full max-w-xl h-auto overflow-visible">
      <line x1="50" y1="50" x2="105" y2="50" stroke="#334155" strokeWidth="2" />
      <rect x="105" y="38" width="50" height="24" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="125" y="55" className="text-xs fill-slate-800 font-bold">R</text>
      <line x1="155" y1="50" x2="205" y2="50" stroke="#334155" strokeWidth="2" />

      <circle cx="205" cy="115" r="28" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="180" y="119" className="text-xs fill-red-600 font-bold">E = K_Φ Ω</text>
      <line x1="205" y1="50" x2="205" y2="87" stroke="#334155" strokeWidth="2" />
      <line x1="205" y1="143" x2="205" y2="180" stroke="#334155" strokeWidth="2" />
      <line x1="50" y1="180" x2="205" y2="180" stroke="#334155" strokeWidth="2" />
      <text x="45" y="120" style={labelStyle} className="text-xs fill-slate-800 font-bold">u(t)</text>

      <line x1="300" y1="115" x2="555" y2="115" stroke="#334155" strokeWidth="1.5" />
      <line x1="425" y1="25" x2="425" y2="205" stroke="#334155" strokeWidth="1.5" />
      <text x="530" y="135" style={labelStyle} className="text-xs fill-slate-800 font-bold">C_em</text>
      <text x="435" y="38" style={labelStyle} className="text-xs fill-slate-800 font-bold">Ω</text>
      <text x="445" y="80" style={labelStyle} className="text-xs fill-red-600 font-bold">Q1 : Moteur</text>
      <text x="315" y="80" style={labelStyle} className="text-xs fill-slate-700 font-semibold">Q2 : Frein</text>
      <text x="315" y="160" style={labelStyle} className="text-xs fill-red-600 font-bold">Q3 : Moteur</text>
      <text x="445" y="160" style={labelStyle} className="text-xs fill-slate-700 font-semibold">Q4 : Frein</text>
    </svg>
  ),
};

export default function SchemaPlaceholder({
  src,
  alt,
  caption,
}: SchemaPlaceholderProps) {
  const [imageError, setImageError] = useState(false);
  const builtInSvg = BUILTIN_SCHEMAS[src];

  return (
    <figure className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {builtInSvg ? (
        /* La classe 'schema-canvas' garde un fond papier technique clair même en mode sombre */
        <div className="schema-canvas flex justify-center bg-slate-50 rounded-xl p-5 border border-slate-200 overflow-x-auto">
          {builtInSvg}
        </div>
      ) : !imageError ? (
        <div className="schema-canvas flex justify-center bg-slate-50 rounded-xl p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="max-h-80 w-auto object-contain rounded"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
          <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 max-w-lg">{alt}</p>
        </div>
      )}

      {caption && (
        <figcaption className="mt-3 text-center text-xs font-medium text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}