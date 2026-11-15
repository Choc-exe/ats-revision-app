"use client";

import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SchemaPlaceholderProps {
  src: string;
  alt: string;
  caption?: string;
}

// Style appliqué aux textes SVG : crée un contour clair fin autour des lettres
// pour qu'un trait passant dessous ne gêne jamais la lecture.
const labelStyle: React.CSSProperties = {
  paintOrder: "stroke",
  stroke: "#f8fafc",
  strokeWidth: "4px",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const BUILTIN_SCHEMAS: Record<string, React.ReactNode> = {
  // =========================================================================
  // 1. Physique Chap 1 : Base polaire / cylindrique
  // =========================================================================
  "/images/physique-chimie/base-polaire-cylindrique.png": (
    <svg viewBox="0 0 620 260" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m1-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m1-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Axes cartésiens principaux */}
      <line x1="80" y1="210" x2="520" y2="210" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#m1-slate)" />
      <line x1="120" y1="240" x2="120" y2="25" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#m1-slate)" />
      <text x="532" y="214" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>
      <text x="120" y="16" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">y</text>
      <text x="100" y="226" style={labelStyle} className="text-xs fill-slate-700 font-bold">O</text>

      {/* Vecteurs de la base cartésienne fixe */}
      <line x1="120" y1="210" x2="185" y2="210" stroke="#334155" strokeWidth="2.5" markerEnd="url(#m1-slate)" />
      <line x1="120" y1="210" x2="120" y2="145" stroke="#334155" strokeWidth="2.5" markerEnd="url(#m1-slate)" />
      <text x="150" y="230" style={labelStyle} className="text-xs fill-slate-900 font-bold">u_x</text>
      <text x="86" y="175" style={labelStyle} className="text-xs fill-slate-900 font-bold">u_y</text>

      {/* Projections orthogonales de M */}
      <line x1="330" y1="95" x2="330" y2="210" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="330" y1="95" x2="120" y2="95" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="330" y="226" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-500 font-semibold">r cos θ</text>
      <text x="75" y="99" style={labelStyle} className="text-[11px] fill-slate-500 font-semibold">r sin θ</text>

      {/* Rayon vecteur OM */}
      <line x1="120" y1="210" x2="330" y2="95" stroke="#475569" strokeWidth="2" strokeDasharray="5 4" />
      <text x="210" y="142" style={labelStyle} className="text-xs fill-slate-800 font-bold">r = ||OM||</text>

      {/* Arc d'angle θ avec flèche de rotation */}
      <path d="M 190 210 A 70 70 0 0 0 181 176" fill="none" stroke="#dc2626" strokeWidth="2" markerEnd="url(#m1-red)" />
      <text x="202" y="195" style={labelStyle} className="text-xs fill-red-600 font-bold">θ</text>

      {/* Point M */}
      <circle cx="330" cy="95" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x="345" y="112" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">M(r, θ)</text>

      {/* Base locale tournante (u_r, u_θ) */}
      <line x1="330" y1="95" x2="400" y2="57" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m1-red)" />
      <line x1="330" y1="95" x2="292" y2="27" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m1-red)" />
      <text x="412" y="60" style={labelStyle} className="text-xs fill-red-600 font-extrabold">u_r</text>
      <text x="265" y="24" style={labelStyle} className="text-xs fill-red-600 font-extrabold">u_θ</text>

      {/* Symbole d'angle droit entre u_r et u_θ */}
      <path d="M 321 79 L 310 85 L 319 101" fill="none" stroke="#dc2626" strokeWidth="1.2" />

      {/* Cartouche formule projection */}
      <rect x="360" y="135" width="240" height="42" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
      <text x="480" y="152" textAnchor="middle" className="text-[11px] fill-slate-800 font-semibold">u_r = cos θ · u_x + sin θ · u_y</text>
      <text x="480" y="168" textAnchor="middle" className="text-[11px] fill-red-600 font-semibold">u_θ = −sin θ · u_x + cos θ · u_y</text>
    </svg>
  ),

  // =========================================================================
  // 2. Physique Chap 1 : Puits d'énergie potentielle
  // =========================================================================
  "/images/physique-chimie/puits-energie-potentielle.png": (
    <svg viewBox="0 0 650 285" className="w-full max-w-2xl h-auto overflow-visible">
      <defs>
        <marker id="m2-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m2-osc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a" />
        </marker>
      </defs>

      {/* 1. Zones interdites (Ep > Em => Ec < 0 impossible) */}
      <rect x="60" y="25" width="56" height="190" fill="#fee2e2" fillOpacity="0.45" />
      <rect x="290" y="25" width="176" height="190" fill="#fee2e2" fillOpacity="0.45" />
      <text x="88" y="38" textAnchor="middle" className="text-[10px] fill-red-700 font-bold uppercase tracking-tighter">
        Interdit
      </text>

      {/* Badge protégé pour le texte de barrière (évite tout chevauchement avec x=380) */}
      <rect x="305" y="78" width="146" height="22" rx="4" fill="#ffffff" fillOpacity="0.9" stroke="#fca5a5" strokeWidth="1" />
      <text x="378" y="93" textAnchor="middle" className="text-[10px] fill-red-700 font-bold uppercase tracking-tighter">
        Barrière (E_p &gt; E_m)
      </text>

      {/* 2. Axes de coordonnées */}
      <line x1="60" y1="215" x2="615" y2="215" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m2-axis)" />
      <line x1="60" y1="225" x2="60" y2="18" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m2-axis)" />
      <text x="625" y="219" style={labelStyle} className="text-xs fill-slate-800 font-bold">x</text>
      <text x="60" y="10" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">E_p(x)</text>

      {/* 3. Projections verticales sur l'axe des abscisses */}
      {/* Point de rebroussement x1 (116, 115) */}
      <line x1="116" y1="115" x2="116" y2="215" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="116" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">x₁</text>

      {/* Position d'équilibre stable x_eq,1 (200, 175) */}
      <line x1="200" y1="175" x2="200" y2="215" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="200" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-emerald-700 font-bold">x_éq,1</text>

      {/* Point de rebroussement x2 (290, 115) */}
      <line x1="290" y1="115" x2="290" y2="215" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="290" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">x₂</text>

      {/* Position d'équilibre instable x_eq,2 (380, 55) */}
      <line x1="380" y1="55" x2="380" y2="215" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="380" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">x_éq,2</text>

      {/* Point de rebroussement x3 (466, 115) */}
      <line x1="466" y1="115" x2="466" y2="215" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="466" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">x₃</text>

      {/* 4. Droite horizontale d'énergie mécanique Em = 115 */}
      <line x1="60" y1="115" x2="600" y2="115" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="6 4" />
      <text x="595" y="104" textAnchor="end" style={labelStyle} className="text-xs fill-red-600 font-bold">
        E_m = E_c + E_p = cte
      </text>

      {/* 5. Courbe Ep(x) */}
      <path
        d="M 80 35 C 110 115, 145 175, 200 175 C 260 175, 320 55, 380 55 C 440 55, 500 185, 580 198"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.5"
      />

      {/* 6. Tangentes horizontales dEp/dx = 0 aux deux extremums */}
      <line x1="165" y1="175" x2="235" y2="175" stroke="#16a34a" strokeWidth="1.5" />
      <line x1="345" y1="55" x2="415" y2="55" stroke="#dc2626" strokeWidth="1.5" />

      {/* 7. Points de rebroussement (Ec = 0) sur la courbe en y = 115 */}
      <circle cx="116" cy="115" r="4" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <circle cx="290" cy="115" r="4" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <circle cx="466" cy="115" r="4" fill="#fff" stroke="#0f172a" strokeWidth="2" />

      {/* Cuvette d'état lié (oscillations entre x1 et x2) */}
      <line
        x1="126"
        y1="142"
        x2="280"
        y2="142"
        stroke="#16a34a"
        strokeWidth="2"
        markerStart="url(#m2-osc)"
        markerEnd="url(#m2-osc)"
      />
      <text x="203" y="134" textAnchor="middle" style={labelStyle} className="text-[11px] fill-emerald-800 font-bold">
        État lié (oscillations)
      </text>

      {/* État de diffusion à droite (x >= x3) */}
      <text x="535" y="168" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-700 font-bold">
        État non lié (x → +∞)
      </text>

      {/* 8. Points d'équilibre avec étiquettes protégées */}
      <circle cx="200" cy="175" r="5.5" fill="#16a34a" stroke="#fff" strokeWidth="1.5" />
      <rect x="135" y="188" width="130" height="20" rx="4" fill="#ffffff" fillOpacity="0.9" stroke="#bbf7d0" strokeWidth="1" />
      <text x="200" y="202" textAnchor="middle" className="text-[11px] fill-emerald-800 font-bold">
        Équilibre stable (min)
      </text>

      <circle cx="380" cy="55" r="5.5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x="380" y="38" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">
        Équilibre instable (max)
      </text>
    </svg>
  ),

  // =========================================================================
  // 3. Maths Chap 1 : Racines n-ièmes de l'unité
  // =========================================================================
  "/images/mathematiques/racines-unite-cercle.png": (
    <svg viewBox="0 0 600 260" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m3-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m3-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Axes orthonormés avec flèches */}
      <line x1="120" y1="130" x2="480" y2="130" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#m3-slate)" />
      <line x1="300" y1="245" x2="300" y2="18" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#m3-slate)" />
      <text x="492" y="134" style={labelStyle} className="text-xs fill-slate-700 font-bold">Re</text>
      <text x="300" y="12" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">Im</text>
      <text x="286" y="145" style={labelStyle} className="text-xs fill-slate-600 font-semibold">O</text>

      {/* Cercle trigonométrique unité */}
      <circle cx="300" cy="130" r="85" fill="none" stroke="#334155" strokeWidth="1.8" />
      <text x="312" y="222" style={labelStyle} className="text-[10px] fill-slate-400 font-mono">−1</text>
      <text x="312" y="52" style={labelStyle} className="text-[10px] fill-slate-400 font-mono">i</text>

      {/* Triangle équilatéral des racines 3-ièmes */}
      <polygon points="385,130 257.5,56.4 257.5,203.6" fill="#fef2f2" fillOpacity="0.65" stroke="#dc2626" strokeWidth="2" />
      <circle cx="385" cy="130" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <circle cx="257.5" cy="56.4" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <circle cx="257.5" cy="203.6" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />

      {/* Rayons vers les sommets */}
      <line x1="300" y1="130" x2="257.5" y2="56.4" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="300" y1="130" x2="257.5" y2="203.6" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3 3" />

      {/* Arc d'angle 2π/3 */}
      <path d="M 345 130 A 45 45 0 0 0 277 91" fill="none" stroke="#dc2626" strokeWidth="1.5" markerEnd="url(#m3-red)" />
      <text x="325" y="105" style={labelStyle} className="text-[11px] fill-red-600 font-bold">2π/3</text>

      {/* Labels des sommets proches et nets */}
      <text x="398" y="122" style={labelStyle} className="text-xs fill-red-600 font-extrabold">z₀ = 1</text>
      <text x="245" y="50" textAnchor="end" style={labelStyle} className="text-xs fill-red-600 font-extrabold">j = e^(i2π/3)</text>
      <text x="245" y="215" textAnchor="end" style={labelStyle} className="text-xs fill-red-600 font-extrabold">j² = e^(−i2π/3)</text>

      {/* Propriété fondamentale */}
      <rect x="175" y="235" width="250" height="22" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <text x="300" y="250" textAnchor="middle" className="text-[11px] fill-slate-800 font-bold">1 + j + j² = 0   et   j³ = 1</text>
    </svg>
  ),

  // =========================================================================
  // 4. SII Chap 1 : Schéma-blocs d'un système asservi
  // =========================================================================
  "/images/sii/structure-systeme-asservi.png": (
    <svg viewBox="0 0 640 220" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m4-sii" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>

      {/* Signal de consigne E(p) */}
      <line x1="25" y1="70" x2="98" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />
      <text x="60" y="56" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">Consigne E(p)</text>

      {/* Comparateur avec croix interne et signes */}
      <circle cx="118" cy="70" r="16" fill="#fff" stroke="#dc2626" strokeWidth="2" />
      <line x1="107" y1="59" x2="129" y2="81" stroke="#dc2626" strokeWidth="1.2" />
      <line x1="107" y1="81" x2="129" y2="59" stroke="#dc2626" strokeWidth="1.2" />
      <text x="96" y="64" style={labelStyle} className="text-xs fill-slate-800 font-bold">+</text>
      <text x="124" y="96" style={labelStyle} className="text-xs fill-red-600 font-bold">−</text>

      {/* Écart ε(p) */}
      <line x1="134" y1="70" x2="192" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />
      <text x="163" y="56" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">ε(p)</text>

      {/* Bloc Correcteur C(p) */}
      <rect x="195" y="45" width="115" height="50" rx="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="252.5" y="70" textAnchor="middle" dominantBaseline="central" className="text-xs fill-red-700 font-bold">Correcteur C(p)</text>

      {/* Grandeur de commande U(p) */}
      <line x1="310" y1="70" x2="368" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />
      <text x="339" y="56" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">U(p)</text>

      {/* Bloc Processus H(p) */}
      <rect x="370" y="45" width="120" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="430" y="70" textAnchor="middle" dominantBaseline="central" className="text-xs fill-slate-800 font-bold">Processus H(p)</text>

      {/* Sortie S(p) */}
      <line x1="490" y1="70" x2="605" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />
      <text x="575" y="56" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">Sortie S(p)</text>

      {/* Point de dérivation avec pastille nette */}
      <circle cx="530" cy="70" r="4" fill="#334155" />

      {/* Boucle de rétroaction */}
      <line x1="530" y1="70" x2="530" y2="165" stroke="#334155" strokeWidth="2" />
      <line x1="530" y1="165" x2="365" y2="165" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />

      {/* Bloc Capteur B(p) */}
      <rect x="245" y="140" width="115" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="302.5" y="165" textAnchor="middle" dominantBaseline="central" className="text-xs fill-slate-700 font-bold">Capteur B(p)</text>

      <line x1="245" y1="165" x2="118" y2="165" stroke="#334155" strokeWidth="2" />
      <line x1="118" y1="165" x2="118" y2="90" stroke="#334155" strokeWidth="2" markerEnd="url(#m4-sii)" />
      <text x="175" y="152" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-600 font-semibold">Mesure M(p)</text>
    </svg>
  ),

  // =========================================================================
  // 5. SII Chap 1 : Réponses indicielles d'ordre 1 et 2
  // =========================================================================
  "/images/sii/reponses-indicielles-ordre-1-2.png": (
    <svg viewBox="0 0 620 260" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m5-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m5-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Axes fléchés */}
      <line x1="60" y1="210" x2="570" y2="210" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m5-axis)" />
      <line x1="60" y1="220" x2="60" y2="18" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m5-axis)" />
      <text x="580" y="214" style={labelStyle} className="text-xs fill-slate-700 font-bold">t</text>
      <text x="60" y="10" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">s(t)</text>
      <text x="50" y="222" style={labelStyle} className="text-xs fill-slate-500 font-semibold">0</text>

      {/* Asymptote de régime permanent s_infini */}
      <line x1="60" y1="100" x2="550" y2="100" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="25" y="104" style={labelStyle} className="text-xs fill-slate-800 font-extrabold">s_∞</text>

      {/* Tangente à l'origine exacte du 1er ordre (passe par (60, 210) et (180, 100)) */}
      <line x1="60" y1="210" x2="180" y2="100" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="180" y1="100" x2="180" y2="210" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="180" y="226" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">τ</text>

      {/* Cotation 63% de s_infini */}
      <line x1="55" y1="141" x2="180" y2="141" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
      <text x="15" y="145" style={labelStyle} className="text-[10px] fill-slate-500 font-bold">0,63 s_∞</text>

      {/* Courbe 1er ordre (tangente au départ) */}
      <path d="M 60 210 C 120 155, 180 115, 540 101" fill="none" stroke="#334155" strokeWidth="2.5" />
      <text x="360" y="128" style={labelStyle} className="text-xs fill-slate-800 font-bold">1er ordre (pente initiale 1/τ)</text>

      {/* Courbe 2nd ordre (pente nulle à l'origine, pic en (205, 52)) */}
      <path d="M 60 210 C 110 210, 140 40, 205 52 C 260 62, 285 115, 340 88 C 390 78, 435 102, 540 100" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <text x="210" y="34" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">2nd ordre (0 &lt; ξ &lt; 1)</text>

      {/* Projection du temps de pic tp */}
      <line x1="205" y1="52" x2="205" y2="210" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="205" y="226" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">t_p</text>

      {/* Cotation du dépassement D1 */}
      <line x1="225" y1="56" x2="225" y2="96" stroke="#dc2626" strokeWidth="1.5" markerStart="url(#m5-dim)" markerEnd="url(#m5-dim)" />
      <text x="238" y="78" style={labelStyle} className="text-xs fill-red-600 font-extrabold">D₁</text>
    </svg>
  ),

  // =========================================================================
  // 6. Informatique Chap 2 : Intégration par rectangles et trapèzes
  // =========================================================================
  "/images/informatique/integration-rectangles-trapezes.png": (
    <svg viewBox="0 0 680 265" className="w-full max-w-2xl h-auto overflow-visible">
      <defs>
        <marker id="m6-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m6-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* SOUS-FIGURE GAUCHE : RECTANGLES À GAUCHE */}
      <text x="160" y="18" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">
        1. Méthode des rectangles à gauche
      </text>

      <rect x="55" y="148" width="70" height="52" fill="#e2e8f0" fillOpacity="0.85" stroke="#475569" strokeWidth="1.5" />
      <rect x="125" y="84" width="70" height="116" fill="#e2e8f0" fillOpacity="0.85" stroke="#475569" strokeWidth="1.5" />
      <rect x="195" y="52" width="70" height="148" fill="#e2e8f0" fillOpacity="0.85" stroke="#475569" strokeWidth="1.5" />

      <line x1="35" y1="148" x2="55" y2="148" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="30" y="152" textAnchor="end" style={labelStyle} className="text-[10px] fill-slate-600 font-bold">f(x₀)</text>
      <line x1="35" y1="84" x2="125" y2="84" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="30" y="88" textAnchor="end" style={labelStyle} className="text-[10px] fill-slate-600 font-bold">f(x₁)</text>

      <path d="M 45 160 Q 142.5 -20 278 60" fill="none" stroke="#0f172a" strokeWidth="2.5" />

      <circle cx="55" cy="148" r="4" fill="#334155" stroke="#fff" strokeWidth="1.2" />
      <circle cx="125" cy="84" r="4" fill="#334155" stroke="#fff" strokeWidth="1.2" />
      <circle cx="195" cy="52" r="4" fill="#334155" stroke="#fff" strokeWidth="1.2" />
      <circle cx="265" cy="52" r="3.5" fill="#fff" stroke="#0f172a" strokeWidth="1.5" />

      <line x1="35" y1="200" x2="295" y2="200" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m6-axis)" />
      <line x1="35" y1="210" x2="35" y2="25" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m6-axis)" />
      <text x="302" y="204" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>

      <text x="55" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">a = x₀</text>
      <text x="125" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₁</text>
      <text x="195" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₂</text>
      <text x="265" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₃ = b</text>

      <line x1="58" y1="234" x2="122" y2="234" stroke="#dc2626" strokeWidth="1.5" markerStart="url(#m6-dim)" markerEnd="url(#m6-dim)" />
      <text x="90" y="248" textAnchor="middle" style={labelStyle} className="text-[11px] fill-red-600 font-bold">pas h</text>

      {/* Séparateur central */}
      <line x1="340" y1="15" x2="340" y2="245" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* SOUS-FIGURE DROITE : TRAPÈZES */}
      <text x="500" y="18" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">
        2. Méthode des trapèzes (cordes sous l&apos;arc)
      </text>

      <polygon points="395,200 395,148 465,84 465,200" fill="#fef2f2" fillOpacity="0.85" stroke="#dc2626" strokeWidth="1.8" />
      <polygon points="465,200 465,84 535,52 535,200" fill="#fef2f2" fillOpacity="0.85" stroke="#dc2626" strokeWidth="1.8" />
      <polygon points="535,200 535,52 605,52 605,200" fill="#fef2f2" fillOpacity="0.85" stroke="#dc2626" strokeWidth="1.8" />

      <path d="M 385 160 Q 482.5 -20 618 60" fill="none" stroke="#0f172a" strokeWidth="2.5" />

      <circle cx="395" cy="148" r="4" fill="#dc2626" stroke="#fff" strokeWidth="1.2" />
      <circle cx="465" cy="84" r="4" fill="#dc2626" stroke="#fff" strokeWidth="1.2" />
      <circle cx="535" cy="52" r="4" fill="#dc2626" stroke="#fff" strokeWidth="1.2" />
      <circle cx="605" cy="52" r="4" fill="#dc2626" stroke="#fff" strokeWidth="1.2" />

      <text x="458" y="72" textAnchor="end" style={labelStyle} className="text-[10px] fill-red-700 font-bold">(x₁, f(x₁))</text>

      <line x1="375" y1="200" x2="635" y2="200" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m6-axis)" />
      <line x1="375" y1="210" x2="375" y2="25" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m6-axis)" />
      <text x="642" y="204" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>

      <text x="395" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">a = x₀</text>
      <text x="465" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₁</text>
      <text x="535" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₂</text>
      <text x="605" y="216" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-800 font-bold">x₃ = b</text>

      <line x1="398" y1="234" x2="462" y2="234" stroke="#dc2626" strokeWidth="1.5" markerStart="url(#m6-dim)" markerEnd="url(#m6-dim)" />
      <text x="430" y="248" textAnchor="middle" style={labelStyle} className="text-[11px] fill-red-600 font-bold">pas h = (b − a) / n</text>
    </svg>
  ),

  // =========================================================================
  // 7. Physique Chap 2 : Machine cyclique ditherme
  // =========================================================================
  "/images/physique-chimie/machine-ditherme.png": (
    <svg viewBox="0 0 620 250" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m7-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="m7-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>

      {/* Source Chaude */}
      <rect x="60" y="35" width="130" height="150" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="125" y="95" textAnchor="middle" className="text-xs fill-red-700 font-bold">Source Chaude</text>
      <text x="125" y="125" textAnchor="middle" className="text-lg fill-red-600 font-extrabold">T_C</text>

      {/* Machine au centre (texte sur 2 lignes parfaitement contenu dans le cercle) */}
      <circle cx="310" cy="110" r="46" fill="#fff" stroke="#334155" strokeWidth="2.5" />
      <text x="310" y="104" textAnchor="middle" className="text-xs fill-slate-900 font-extrabold">Machine</text>
      <text x="310" y="122" textAnchor="middle" className="text-[11px] fill-slate-600 font-bold">(Fluide / Cycle)</text>

      {/* Source Froide */}
      <rect x="430" y="35" width="130" height="150" rx="8" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <text x="495" y="95" textAnchor="middle" className="text-xs fill-slate-700 font-bold">Source Froide</text>
      <text x="495" y="125" textAnchor="middle" className="text-lg fill-slate-800 font-extrabold">T_F &lt; T_C</text>

      {/* Échange de chaleur Q_C (flèche vers la machine) */}
      <line x1="190" y1="110" x2="258" y2="110" stroke="#dc2626" strokeWidth="3" markerEnd="url(#m7-red)" />
      <text x="224" y="94" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">Q_C &gt; 0</text>

      {/* Travail W fourni au milieu extérieur (flèche vers le bas) */}
      <line x1="310" y1="156" x2="310" y2="218" stroke="#dc2626" strokeWidth="3" markerEnd="url(#m7-red)" />
      <text x="310" y="235" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">|W| fourni (W &lt; 0)</text>

      {/* Échange de chaleur Q_F cédé à la source froide (flèche vers la source froide) */}
      <line x1="356" y1="110" x2="424" y2="110" stroke="#334155" strokeWidth="3" markerEnd="url(#m7-slate)" />
      <text x="390" y="94" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-extrabold">|Q_F| cédé</text>

      {/* Bandeau de synthèse bilan d'énergie */}
      <rect x="110" y="8" width="400" height="20" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <text x="310" y="22" textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">
        1er Principe : W + Q_C + Q_F = 0   |   Carnot : η ≤ 1 − T_F / T_C
      </text>
    </svg>
  ),

  // =========================================================================
  // 8. Physique Chap 3 : Résonance de courant RLC série
  // =========================================================================
  "/images/physique-chimie/resonance-courant-rlc.png": (
    <svg viewBox="0 0 620 260" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m8-axis" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m8-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Axes fléchés */}
      <line x1="60" y1="210" x2="560" y2="210" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m8-axis)" />
      <line x1="60" y1="220" x2="60" y2="20" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m8-axis)" />
      <text x="572" y="214" style={labelStyle} className="text-xs fill-slate-700 font-bold">ω</text>
      <text x="60" y="12" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">I(ω)</text>
      <text x="50" y="222" style={labelStyle} className="text-xs fill-slate-500 font-semibold">0</text>

      {/* Courbe de résonance */}
      <path d="M 60 210 Q 200 200 245 95 Q 270 25 295 95 Q 340 200 530 206" fill="none" stroke="#dc2626" strokeWidth="2.5" />

      {/* Pic de résonance à omega0 */}
      <line x1="60" y1="42" x2="270" y2="42" stroke="#475569" strokeWidth="1.2" strokeDasharray="4 4" />
      <line x1="270" y1="42" x2="270" y2="210" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="270" cy="42" r="4.5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x="270" y="228" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">ω₀</text>
      <text x="55" y="46" textAnchor="end" style={labelStyle} className="text-xs fill-slate-900 font-bold">I_max = E_m / R</text>

      {/* Bande passante à I_max / √2 */}
      <line x1="60" y1="95" x2="330" y2="95" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="55" y="99" textAnchor="end" style={labelStyle} className="text-[11px] fill-red-600 font-bold">I_max / √2</text>

      <line x1="244" y1="95" x2="244" y2="210" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="296" y1="95" x2="296" y2="210" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="244" y="228" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">ω₁</text>
      <text x="296" y="228" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">ω₂</text>

      {/* Double flèche cotation bande passante Delta omega */}
      <line x1="248" y1="80" x2="292" y2="80" stroke="#dc2626" strokeWidth="1.5" markerStart="url(#m8-dim)" markerEnd="url(#m8-dim)" />
      <text x="270" y="73" textAnchor="middle" style={labelStyle} className="text-[11px] fill-red-600 font-extrabold">Δω = ω₂ − ω₁</text>

      {/* Formule facteur de qualité */}
      <rect x="350" y="80" width="220" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
      <text x="460" y="96" textAnchor="middle" className="text-xs fill-red-700 font-bold">Δω = ω₀ / Q</text>
      <text x="460" y="110" textAnchor="middle" className="text-[10px] fill-slate-600">Q = Lω₀/R = 1/(RCω₀)</text>
    </svg>
  ),

  // =========================================================================
  // 9. Physique Chap 4 : Tube de courant / Effet Venturi
  // =========================================================================
  "/images/physique-chimie/tube-de-courant-venturi.png": (
    <svg viewBox="0 0 640 240" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m9-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m9-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Parois du tube de courant */}
      <path d="M 40 50 L 190 50 Q 280 50 315 85 L 560 85" fill="none" stroke="#1e293b" strokeWidth="3" />
      <path d="M 40 170 L 190 170 Q 280 170 315 135 L 560 135" fill="none" stroke="#1e293b" strokeWidth="3" />

      {/* Sections transversales S1 et S2 */}
      <ellipse cx="120" cy="110" rx="14" ry="60" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <ellipse cx="430" cy="110" rx="9" ry="25" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Lignes de courant internes montrant le resserrement */}
      <path d="M 40 80 Q 250 80 315 97 L 560 97" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="5 3" />
      <path d="M 40 140 Q 250 140 315 123 L 560 123" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="5 3" />

      {/* Vecteurs vitesse fléchés */}
      <line x1="120" y1="110" x2="190" y2="110" stroke="#334155" strokeWidth="3" markerEnd="url(#m9-slate)" />
      <text x="155" y="100" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">v₁</text>

      <line x1="430" y1="110" x2="540" y2="110" stroke="#dc2626" strokeWidth="3" markerEnd="url(#m9-red)" />
      <text x="485" y="100" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">v₂ &gt; v₁</text>

      {/* Textes explicatifs bien positionnés sans débordement */}
      <rect x="40" y="185" width="220" height="38" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <text x="150" y="201" textAnchor="middle" className="text-xs fill-slate-800 font-bold">Section S₁ grande</text>
      <text x="150" y="215" textAnchor="middle" className="text-[11px] fill-slate-600">vitesse v₁ faible • P₁ élevée</text>

      <rect x="350" y="185" width="230" height="38" rx="6" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1" />
      <text x="465" y="201" textAnchor="middle" className="text-xs fill-red-700 font-bold">Section S₂ réduite (col)</text>
      <text x="465" y="215" textAnchor="middle" className="text-[11px] fill-red-600">vitesse v₂ élevée • P₂ faible</text>

      {/* Formule de conservation de débit */}
      <text x="320" y="28" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-extrabold">
        Conservation du débit : D_v = S₁ v₁ = S₂ v₂ = cte
      </text>
    </svg>
  ),

  // =========================================================================
  // 10. Physique Chap 5 : Paroi multicouche et résistances thermiques
  // =========================================================================
  "/images/physique-chimie/resistances-thermiques-serie.png": (
    <svg viewBox="0 0 640 240" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m10-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Paroi composite 3 couches */}
      <rect x="55" y="40" width="50" height="140" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
      <rect x="105" y="40" width="65" height="140" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="170" y="40" width="40" height="140" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />

      {/* Labels des couches */}
      <text x="80" y="115" textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">Béton</text>
      <text x="137.5" y="115" textAnchor="middle" className="text-xs fill-red-700 font-extrabold">Isolant</text>
      <text x="190" y="115" textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">Plâtre</text>

      {/* Températures aux bords */}
      <text x="35" y="115" textAnchor="middle" style={labelStyle} className="text-sm fill-red-600 font-extrabold">T₁</text>
      <text x="230" y="115" textAnchor="middle" style={labelStyle} className="text-sm fill-slate-800 font-extrabold">T₂</text>

      {/* Flèche de flux thermique Φ traversant la paroi */}
      <line x1="20" y1="110" x2="52" y2="110" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m10-red)" />
      <line x1="212" y1="110" x2="245" y2="110" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m10-red)" />
      <text x="137.5" y="32" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">Flux thermique Φ (W)</text>

      {/* Schéma électrique équivalent */}
      <circle cx="280" cy="110" r="4" fill="#dc2626" />
      <text x="280" y="96" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">T₁</text>

      <line x1="284" y1="110" x2="315" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="315" y="94" width="55" height="32" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="342.5" y="110" textAnchor="middle" dominantBaseline="central" className="text-xs fill-slate-800 font-bold">R_th1</text>

      <line x1="370" y1="110" x2="405" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="405" y="94" width="60" height="32" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="435" y="110" textAnchor="middle" dominantBaseline="central" className="text-xs fill-red-600 font-bold">R_th2</text>

      <line x1="465" y1="110" x2="500" y2="110" stroke="#334155" strokeWidth="2" />
      <rect x="500" y="94" width="55" height="32" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="527.5" y="110" textAnchor="middle" dominantBaseline="central" className="text-xs fill-slate-800 font-bold">R_th3</text>

      <line x1="555" y1="110" x2="585" y2="110" stroke="#334155" strokeWidth="2" />
      <circle cx="585" cy="110" r="4" fill="#334155" />
      <text x="585" y="96" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">T₂</text>

      {/* Flèche de flux dans le circuit */}
      <line x1="400" y1="70" x2="470" y2="70" stroke="#dc2626" strokeWidth="2" markerEnd="url(#m10-red)" />
      <text x="435" y="62" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-bold">Flux Φ</text>

      {/* Formule d'association en série bien centrée */}
      <rect x="270" y="165" width="340" height="45" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
      <text x="440" y="183" textAnchor="middle" className="text-xs fill-slate-900 font-bold">
        R_th,eq = R_th1 + R_th2 + R_th3 = ∑ (e_i / (λ_i · S))
      </text>
      <text x="440" y="200" textAnchor="middle" className="text-[11px] fill-red-600 font-semibold">
        Loi d&apos;Ohm thermique : Φ = (T₁ − T₂) / R_th,eq
      </text>
    </svg>
  ),

  // =========================================================================
  // 11. Physique Chap 6 : Rails de Laplace
  // =========================================================================
  "/images/physique-chimie/rails-de-laplace.png": (
    <svg viewBox="0 0 620 240" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m11-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m11-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="m11-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
      </defs>

      {/* Rails conducteurs horizontaux */}
      <line x1="90" y1="55" x2="520" y2="55" stroke="#334155" strokeWidth="2.5" />
      <line x1="90" y1="170" x2="520" y2="170" stroke="#334155" strokeWidth="2.5" markerEnd="url(#m11-slate)" />
      <text x="532" y="174" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>

      {/* Résistance R de fermeture à gauche */}
      <line x1="90" y1="55" x2="90" y2="85" stroke="#334155" strokeWidth="2" />
      <rect x="78" y="85" width="24" height="55" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="90" y="116" textAnchor="middle" dominantBaseline="central" style={labelStyle} className="text-xs fill-slate-800 font-bold">R</text>
      <line x1="90" y1="140" x2="90" y2="170" stroke="#334155" strokeWidth="2" />

      {/* Écartement L des rails */}
      <line x1="60" y1="58" x2="60" y2="167" stroke="#64748b" strokeWidth="1.2" markerStart="url(#m11-dim)" markerEnd="url(#m11-dim)" />
      <text x="45" y="116" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">L</text>

      {/* Champ magnétique B sortant (cercles avec point central) */}
      <circle cx="170" cy="90" r="9" fill="#fff" stroke="#475569" strokeWidth="1.5" />
      <circle cx="170" cy="90" r="2.5" fill="#475569" />
      <circle cx="170" cy="135" r="9" fill="#fff" stroke="#475569" strokeWidth="1.5" />
      <circle cx="170" cy="135" r="2.5" fill="#475569" />
      <text x="170" y="70" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">B = B · u_z ⊙</text>

      {/* Barre mobile MN */}
      <line x1="330" y1="38" x2="330" y2="188" stroke="#dc2626" strokeWidth="5" />
      <text x="330" y="28" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">N</text>
      <text x="330" y="206" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">M</text>

      {/* Vecteur vitesse v(t) fléché */}
      <line x1="330" y1="95" x2="435" y2="95" stroke="#334155" strokeWidth="2.5" markerEnd="url(#m11-slate)" />
      <text x="385" y="84" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">v(t) u_x</text>

      {/* Force de Laplace opposée au mouvement (loi de Lenz) */}
      <line x1="330" y1="130" x2="235" y2="130" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m11-red)" />
      <text x="280" y="148" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">F_Laplace = −(B²L²v/R) u_x</text>

      {/* Flèche courant induit i(t) */}
      <line x1="250" y1="55" x2="210" y2="55" stroke="#2563eb" strokeWidth="2" markerEnd="url(#m11-slate)" />
      <text x="230" y="44" textAnchor="middle" style={labelStyle} className="text-[11px] fill-blue-600 font-bold">i(t) induit</text>

      {/* Loi fondamentale */}
      <text x="340" y="232" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">
        f.é.m. induite : e = −dΦ/dt = −B · L · v(t)
      </text>
    </svg>
  ),

  // =========================================================================
  // 12. Physique Chap 7 : Trièdre direct OPPM (k, E, B)
  // =========================================================================
  "/images/physique-chimie/structure-oppm-triedre.png": (
    <svg viewBox="0 0 620 250" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m12-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m12-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* Trièdre d'axes avec pointes de flèches */}
      <line x1="70" y1="125" x2="550" y2="125" stroke="#334155" strokeWidth="2" markerEnd="url(#m12-slate)" />
      <text x="562" y="129" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">x (k)</text>

      <line x1="110" y1="210" x2="110" y2="25" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m12-slate)" />
      <text x="110" y="14" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">y (Champ E)</text>

      <line x1="110" y1="125" x2="45" y2="205" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m12-slate)" />
      <text x="35" y="220" style={labelStyle} className="text-xs fill-slate-800 font-extrabold">z (Champ B)</text>

      {/* Onde continue de champ électrique E (polarisation rectiligne selon Oy) */}
      <path d="M 110 125 Q 170 30 230 125 T 350 125 T 470 125" fill="none" stroke="#dc2626" strokeWidth="2.5" />

      {/* Onde de champ magnétique B (transverse selon Oz, en phase avec E) */}
      <path d="M 110 125 Q 150 180 230 125 T 350 125 T 470 125" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />

      {/* Vecteurs champs E et B au sommet (phase constructive) */}
      <line x1="170" y1="125" x2="170" y2="35" stroke="#dc2626" strokeWidth="2" markerEnd="url(#m12-red)" />
      <text x="180" y="45" style={labelStyle} className="text-xs fill-red-600 font-bold">E(x, t)</text>

      <line x1="170" y1="125" x2="130" y2="175" stroke="#475569" strokeWidth="2" markerEnd="url(#m12-slate)" />
      <text x="135" y="190" style={labelStyle} className="text-xs fill-slate-700 font-bold">B(x, t)</text>

      {/* Synthèse relation de structure */}
      <rect x="250" y="20" width="310" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
      <text x="405" y="36" textAnchor="middle" className="text-xs fill-red-600 font-bold">
        Trièdre direct orthogonal (k, E, B)
      </text>
      <text x="405" y="50" textAnchor="middle" className="text-[11px] fill-slate-700 font-semibold">
        B = (1/c) · u_x ∧ E   avec   E = c · B
      </text>
    </svg>
  ),

  // =========================================================================
  // 13. Maths Chap 2 : Géométrie dans l'espace
  // =========================================================================
  "/images/mathematiques/geometrie-espace-plan-droite.png": (
    <svg viewBox="0 0 620 250" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m13-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="m13-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>

      {/* Plan P en perspective */}
      <polygon points="70,195 180,105 480,105 370,195" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
      <text x="100" y="180" style={labelStyle} className="text-xs fill-slate-800 font-bold">Plan P : ax + by + cz + d = 0</text>

      {/* Vecteur normal n(a, b, c) fléché */}
      <line x1="390" y1="140" x2="390" y2="60" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m13-red)" />
      <text x="402" y="70" style={labelStyle} className="text-xs fill-red-600 font-extrabold">n(a, b, c)</text>

      {/* Point M0 et projeté orthogonal H sur P */}
      <line x1="260" y1="150" x2="260" y2="40" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="4 3" />
      <circle cx="260" cy="150" r="4" fill="#334155" stroke="#fff" strokeWidth="1.5" />
      <text x="242" y="165" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">H</text>

      <circle cx="260" cy="40" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x="272" y="42" style={labelStyle} className="text-xs fill-red-600 font-extrabold">M₀(x₀, y₀, z₀)</text>

      {/* Cotation distance d(M0, P) */}
      <text x="250" y="95" textAnchor="end" style={labelStyle} className="text-[11px] fill-red-700 font-bold">d(M₀, P)</text>

      {/* Droite D de vecteur directeur u */}
      <line x1="420" y1="225" x2="570" y2="75" stroke="#334155" strokeWidth="2" />
      <line x1="480" y1="165" x2="525" y2="120" stroke="#2563eb" strokeWidth="2.5" markerEnd="url(#m13-slate)" />
      <text x="535" y="120" style={labelStyle} className="text-xs fill-blue-600 font-bold">u</text>
      <text x="575" y="80" style={labelStyle} className="text-xs fill-slate-800 font-bold">Droite D(A, u)</text>

      {/* Formule distance point-plan */}
      <rect x="70" y="215" width="480" height="26" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <text x="310" y="232" textAnchor="middle" className="text-[11px] fill-slate-900 font-bold">
        d(M₀, P) = |ax₀ + by₀ + cz₀ + d| / √(a² + b² + c²)
      </text>
    </svg>
  ),

  // =========================================================================
  // 14. SII Chap 2 : Fermeture géométrique Bielle-Manivelle
  // =========================================================================
  "/images/sii/fermeture-geometrique-bielle-manivelle.png": (
    <svg viewBox="0 0 620 250" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m14-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="m14-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>

      {/* Axe de translation du piston */}
      <line x1="60" y1="150" x2="550" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#m14-slate)" />
      <text x="562" y="154" style={labelStyle} className="text-xs fill-slate-700 font-bold">x</text>

      {/* Repère au bâti 0 en O */}
      <line x1="120" y1="150" x2="120" y2="175" stroke="#334155" strokeWidth="2" />
      <line x1="105" y1="175" x2="135" y2="175" stroke="#334155" strokeWidth="2" />

      {/* Vecteur OA (Manivelle 1, longueur R) fléché */}
      <line x1="120" y1="150" x2="204" y2="62" stroke="#dc2626" strokeWidth="3" markerEnd="url(#m14-red)" />

      {/* Vecteur AB (Bielle 2, longueur L) fléché */}
      <line x1="210" y1="55" x2="414" y2="147" stroke="#334155" strokeWidth="3" markerEnd="url(#m14-slate)" />

      {/* Piston 3 en translation */}
      <rect x="392" y="130" width="56" height="40" rx="4" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <circle cx="120" cy="150" r="5" fill="#334155" stroke="#fff" strokeWidth="1.5" />
      <circle cx="210" cy="55" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <circle cx="420" cy="150" r="5" fill="#334155" stroke="#fff" strokeWidth="1.5" />

      {/* Labels des sommets */}
      <text x="105" y="145" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">O</text>
      <text x="195" y="42" style={labelStyle} className="text-xs fill-red-600 font-extrabold">A (Manivelle R)</text>
      <text x="435" y="138" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">B (Piston x(t))</text>

      {/* Angle theta à l'origine */}
      <path d="M 160 150 A 40 40 0 0 0 152 116" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <text x="168" y="136" style={labelStyle} className="text-xs fill-red-600 font-bold">θ</text>

      {/* Angle beta de la bielle */}
      <line x1="210" y1="55" x2="270" y2="55" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M 250 55 A 40 40 0 0 1 245 74" fill="none" stroke="#334155" strokeWidth="1.5" />
      <text x="258" y="70" style={labelStyle} className="text-xs fill-slate-700 font-bold">β</text>

      {/* Équation de fermeture géométrique */}
      <rect x="80" y="200" width="460" height="38" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.2" />
      <text x="310" y="216" textAnchor="middle" className="text-xs fill-slate-900 font-bold">
        Fermeture vectorielle : OA + AB + BO = 0
      </text>
      <text x="310" y="230" textAnchor="middle" className="text-[11px] fill-red-600 font-semibold">
        Sur x : R cos θ + L cos β − x(t) = 0   |   Sur y : R sin θ − L sin β = 0
      </text>
    </svg>
  ),

  // =========================================================================
  // 15. SII Chap 3 : Coupure RDM et Torseur de cohésion
  // =========================================================================
  "/images/sii/rdm-coupure-torseur-cohesion.png": (
    <svg viewBox="0 0 620 240" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m15-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
        <marker id="m15-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>

      {/* Tronçon gauche E1 [0, x] */}
      <rect x="70" y="85" width="220" height="55" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      <line x1="70" y1="55" x2="70" y2="170" stroke="#334155" strokeWidth="4.5" />
      <text x="180" y="117" textAnchor="middle" className="text-xs fill-slate-800 font-bold">Tronçon gauche E₁ [0, x]</text>

      {/* Tronçon droit E2 fictif en pointillés pour matérialiser la coupure */}
      <rect x="290" y="85" width="160" height="55" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="370" y="117" textAnchor="middle" className="text-[11px] fill-slate-400 font-semibold">Tronçon droit E₂ [x, L]</text>

      {/* Plan de coupure S et centre G(x) */}
      <line x1="290" y1="70" x2="290" y2="155" stroke="#dc2626" strokeWidth="2" />
      <circle cx="290" cy="112" r="5" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
      <text x="270" y="132" style={labelStyle} className="text-xs fill-slate-900 font-extrabold">G(x)</text>

      {/* Effort normal N(x) fléché */}
      <line x1="290" y1="112" x2="395" y2="112" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m15-red)" />
      <text x="405" y="116" style={labelStyle} className="text-xs fill-red-600 font-extrabold">N(x)</text>

      {/* Effort tranchant Ty(x) fléché */}
      <line x1="290" y1="112" x2="290" y2="35" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m15-red)" />
      <text x="298" y="32" style={labelStyle} className="text-xs fill-red-600 font-extrabold">T_y(x)</text>

      {/* Moment fléchissant M_fz(x) en arc de cercle avec flèche */}
      <path d="M 330 145 A 35 35 0 0 0 330 80" fill="none" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#m15-red)" />
      <text x="360" y="75" style={labelStyle} className="text-xs fill-red-600 font-extrabold">M_fz(x)</text>

      {/* Définition officielle du torseur de cohésion */}
      <rect x="70" y="195" width="480" height="32" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <text x="310" y="215" textAnchor="middle" className="text-xs fill-slate-900 font-bold">
        Torseur de cohésion : {'{'}T_coh{'}'}_G = −{'{'}T_ext → E₁{'}'}_G = +{'{'}T_ext → E₂{'}'}_G
      </text>
    </svg>
  ),

  // =========================================================================
  // 16. SII Chap 4 : Modèle MCC (R-L-E) et 4 Quadrants
  // =========================================================================
  "/images/sii/modele-mcc-4-quadrants.png": (
    <svg viewBox="0 0 620 240" className="w-full max-w-xl h-auto overflow-visible">
      <defs>
        <marker id="m16-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="m16-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>

      {/* MODÈLE ÉLECTRIQUE R-L-E DE L'INDUIT (À GAUCHE) */}
      {/* Borne d'entrée supérieure avec courant i(t) */}
      <line x1="35" y1="45" x2="80" y2="45" stroke="#334155" strokeWidth="2" markerEnd="url(#m16-slate)" />
      <text x="60" y="36" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-900 font-bold">i(t)</text>

      {/* Résistance R */}
      <rect x="80" y="35" width="40" height="20" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="100" y="45" textAnchor="middle" dominantBaseline="central" className="text-xs fill-slate-800 font-bold">R</text>

      {/* Inductance L (modèle complet R-L-E conforme au programme ATS) */}
      <line x1="120" y1="45" x2="135" y2="45" stroke="#334155" strokeWidth="2" />
      <path d="M 135 45 Q 142.5 30 150 45 Q 157.5 30 165 45 Q 172.5 30 180 45" fill="none" stroke="#334155" strokeWidth="2" />
      <text x="157.5" y="24" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">L</text>
      <line x1="180" y1="45" x2="205" y2="45" stroke="#334155" strokeWidth="2" />

      {/* Rotor MCC */}
      <circle cx="205" cy="115" r="28" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="205" y="115" textAnchor="middle" dominantBaseline="central" className="text-xs fill-red-600 font-extrabold">M</text>
      <text x="205" y="155" textAnchor="middle" style={labelStyle} className="text-[11px] fill-red-700 font-bold">e = K_Φ · Ω</text>

      {/* Flèche f.é.m. e(t) en convention récepteur */}
      <line x1="230" y1="130" x2="230" y2="90" stroke="#dc2626" strokeWidth="2" markerEnd="url(#m16-red)" />
      <text x="242" y="112" style={labelStyle} className="text-xs fill-red-600 font-bold">e(t)</text>

      {/* Connexions verticales du rotor */}
      <line x1="205" y1="45" x2="205" y2="87" stroke="#334155" strokeWidth="2" />
      <line x1="205" y1="143" x2="205" y2="185" stroke="#334155" strokeWidth="2" />
      <line x1="35" y1="185" x2="205" y2="185" stroke="#334155" strokeWidth="2" />

      {/* Tension u(t) aux bornes */}
      <line x1="35" y1="175" x2="35" y2="55" stroke="#2563eb" strokeWidth="2" markerEnd="url(#m16-slate)" />
      <text x="22" y="115" textAnchor="middle" style={labelStyle} className="text-xs fill-blue-600 font-extrabold">u(t)</text>

      {/* 4 QUADRANTS DU FONCTIONNEMENT MCC (À DROITE) */}
      <line x1="310" y1="115" x2="560" y2="115" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m16-slate)" />
      <line x1="435" y1="210" x2="435" y2="20" stroke="#334155" strokeWidth="1.5" markerEnd="url(#m16-slate)" />
      <text x="572" y="119" style={labelStyle} className="text-xs fill-slate-800 font-bold">C_em</text>
      <text x="435" y="12" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-800 font-bold">Ω</text>

      {/* Labels des 4 Quadrants bien dégagés */}
      <text x="495" y="70" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">Q1 : Moteur (sens 1)</text>
      <text x="495" y="86" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">P = C·Ω &gt; 0</text>

      <text x="370" y="70" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">Q2 : Frein (génératrice)</text>
      <text x="370" y="86" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">P &lt; 0</text>

      <text x="370" y="155" textAnchor="middle" style={labelStyle} className="text-xs fill-red-600 font-extrabold">Q3 : Moteur (sens 2)</text>
      <text x="370" y="171" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">P &gt; 0</text>

      <text x="495" y="155" textAnchor="middle" style={labelStyle} className="text-xs fill-slate-700 font-bold">Q4 : Frein (sens 2)</text>
      <text x="495" y="171" textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">P &lt; 0</text>

      {/* Équation mécanique */}
      <text x="120" y="225" textAnchor="middle" style={labelStyle} className="text-[11px] fill-slate-700 font-bold">
        u = e + Ri + L(di/dt)
      </text>
      <text x="435" y="225" textAnchor="middle" style={labelStyle} className="text-[11px] fill-red-600 font-bold">
        C_em = K_Φ · i   et   J(dΩ/dt) = C_em − C_r
      </text>
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
