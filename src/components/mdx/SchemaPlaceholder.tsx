"use client";

import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SchemaPlaceholderProps {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Registre des 16 schémas vectoriels (SVG) intégrés nativement pour tous les chapitres ATS.
 * Charte graphique : traits principaux en slate-700/800 et éléments critiques en red-600 (#dc2626).
 */
const BUILTIN_SCHEMAS: Record<string, React.ReactNode> = {
  // 1. Physique Chap 1 : Base polaire / cylindrique
  "/images/physique-chimie/base-polaire-cylindrique.png": (
    <svg viewBox="0 0 500 240" className="w-full max-w-lg h-auto">
      <defs>
        <marker id="arrow-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
        </marker>
      </defs>
      {/* Axes cartésiens */}
      <line x1="60" y1="190" x2="420" y2="190" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
      <line x1="100" y1="220" x2="100" y2="30" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow-slate)" />
      <text x="425" y="195" className="text-xs fill-slate-600 font-bold">x</text>
      <text x="85" y="35" className="text-xs fill-slate-600 font-bold">y</text>
      <text x="82" y="205" className="text-xs fill-slate-600 font-bold">O</text>
      {/* Vecteurs unitaires ux, uy */}
      <line x1="100" y1="190" x2="155" y2="190" stroke="#334155" strokeWidth="2.5" markerEnd="url(#arrow-slate)" />
      <line x1="100" y1="190" x2="100" y2="135" stroke="#334155" strokeWidth="2.5" markerEnd="url(#arrow-slate)" />
      <text x="125" y="208" className="text-xs fill-slate-800 font-bold">u_x</text>
      <text x="72" y="160" className="text-xs fill-slate-800 font-bold">u_y</text>
      {/* Rayon OM et angle theta */}
      <line x1="100" y1="190" x2="280" y2="85" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M 160 190 A 60 60 0 0 0 152 160" fill="none" stroke="#dc2626" strokeWidth="2" />
      <text x="170" y="178" className="text-xs fill-red-600 font-bold">θ</text>
      <text x="190" y="125" className="text-xs fill-slate-600 font-semibold">r</text>
      {/* Point M et base locale (ur, utheta) en rouge */}
      <circle cx="280" cy="85" r="4" fill="#dc2626" />
      <text x="290" y="95" className="text-xs fill-slate-900 font-bold">M(r, θ)</text>
      <line x1="280" y1="85" x2="340" y2="50" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
      <line x1="280" y1="85" x2="245" y2="25" stroke="#dc2626" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
      <text x="348" y="55" className="text-xs fill-red-600 font-bold">u_r</text>
      <text x="215" y="30" className="text-xs fill-red-600 font-bold">u_θ</text>
    </svg>
  ),

  // 2. Physique Chap 1 : Puits d'énergie potentielle
  "/images/physique-chimie/puits-energie-potentielle.png": (
    <svg viewBox="0 0 500 230" className="w-full max-w-lg h-auto">
      <line x1="50" y1="195" x2="460" y2="195" stroke="#334155" strokeWidth="1.5" />
      <line x1="60" y1="210" x2="60" y2="20" stroke="#334155" strokeWidth="1.5" />
      <text x="450" y="212" className="text-xs fill-slate-700 font-bold">x</text>
      <text x="70" y="30" className="text-xs fill-slate-700 font-bold">E_p(x)</text>
      {/* Courbe Ep(x) */}
      <path d="M 80 50 Q 170 240 260 110 T 430 160" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      {/* Droite Em */}
      <line x1="60" y1="125" x2="440" y2="125" stroke="#dc2626" strokeWidth="2" strokeDasharray="6 4" />
      <text x="400" y="118" className="text-xs fill-red-600 font-bold">E_m = E_c + E_p</text>
      {/* Minimum stable et Maximum instable */}
      <circle cx="172" cy="162" r="4.5" fill="#16a34a" />
      <text x="120" y="182" className="text-[11px] fill-emerald-700 font-bold">Équilibre stable (min)</text>
      <circle cx="305" cy="82" r="4.5" fill="#dc2626" />
      <text x="260" y="68" className="text-[11px] fill-red-600 font-bold">Équilibre instable (max)</text>
    </svg>
  ),

  // 3. Maths Chap 1 : Racines n-ièmes de l'unité
  "/images/mathematiques/racines-unite-cercle.png": (
    <svg viewBox="0 0 500 240" className="w-full max-w-lg h-auto">
      <line x1="110" y1="120" x2="390" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="250" y1="20" x2="250" y2="220" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="250" cy="120" r="80" fill="none" stroke="#334155" strokeWidth="2" />
      {/* Triangle équilatéral U_3 (1, j, j^2) */}
      <polygon points="330,120 210,50.7 210,189.3" fill="#fef2f2" fillOpacity="0.6" stroke="#dc2626" strokeWidth="2" />
      <circle cx="330" cy="120" r="4.5" fill="#dc2626" />
      <circle cx="210" cy="50.7" r="4.5" fill="#dc2626" />
      <circle cx="210" cy="189.3" r="4.5" fill="#dc2626" />
      <text x="340" y="115" className="text-xs fill-red-600 font-bold">z₀ = 1</text>
      <text x="145" y="48" className="text-xs fill-red-600 font-bold">j = e^(2iπ/3)</text>
      <text x="140" y="202" className="text-xs fill-red-600 font-bold">j² = e^(-2iπ/3)</text>
      <text x="375" y="135" className="text-xs fill-slate-500">Re</text>
      <text x="258" y="30" className="text-xs fill-slate-500">Im</text>
    </svg>
  ),

  // 4. SII Chap 1 : Schéma-blocs d'un système asservi
  "/images/sii/structure-systeme-asservi.png": (
    <svg viewBox="0 0 560 200" className="w-full max-w-xl h-auto">
      <defs>
        <marker id="arr-sii" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
        </marker>
      </defs>
      {/* Entrée E(p) et Comparateur */}
      <line x1="20" y1="70" x2="82" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="25" y="60" className="text-xs fill-slate-800 font-bold">E(p)</text>
      <circle cx="100" cy="70" r="16" fill="#fff" stroke="#dc2626" strokeWidth="2" />
      <text x="89" y="68" className="text-xs fill-slate-800 font-bold">+</text>
      <text x="97" y="83" className="text-xs fill-red-600 font-bold">−</text>
      {/* Écart et Correcteur */}
      <line x1="116" y1="70" x2="175" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="132" y="60" className="text-xs fill-red-600 font-bold">ε(p)</text>
      <rect x="180" y="45" width="95" height="50" rx="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="195" y="74" className="text-xs fill-red-700 font-bold">Correcteur C(p)</text>
      {/* Processus / Actionneur */}
      <line x1="275" y1="70" x2="325" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <rect x="330" y="45" width="110" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="345" y="74" className="text-xs fill-slate-800 font-bold">Système H(p)</text>
      {/* Sortie S(p) */}
      <line x1="440" y1="70" x2="530" y2="70" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="495" y="60" className="text-xs fill-slate-800 font-bold">S(p)</text>
      {/* Chaîne de retour Capteur B(p) */}
      <line x1="480" y1="70" x2="480" y2="155" stroke="#334155" strokeWidth="2" />
      <line x1="480" y1="155" x2="315" y2="155" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <rect x="210" y="130" width="100" height="50" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="225" y="159" className="text-xs fill-slate-700 font-bold">Capteur B(p)</text>
      <line x1="210" y1="155" x2="100" y2="155" stroke="#334155" strokeWidth="2" />
      <line x1="100" y1="155" x2="100" y2="90" stroke="#334155" strokeWidth="2" markerEnd="url(#arr-sii)" />
      <text x="115" y="145" className="text-xs fill-slate-600 font-semibold">Mesure M(p)</text>
    </svg>
  ),

  // 5. SII Chap 1 : Réponses indicielles d'ordre 1 et 2
  "/images/sii/reponses-indicielles-ordre-1-2.png": (
    <svg viewBox="0 0 520 230" className="w-full max-w-lg h-auto">
      <line x1="50" y1="195" x2="480" y2="195" stroke="#334155" strokeWidth="1.5" />
      <line x1="50" y1="205" x2="50" y2="20" stroke="#334155" strokeWidth="1.5" />
      {/* Asymptote K E0 */}
      <line x1="50" y1="90" x2="470" y2="90" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="12" y="94" className="text-xs fill-slate-600 font-bold">s_∞</text>
      {/* Tangente à l'origine 1er ordre */}
      <line x1="50" y1="195" x2="150" y2="90" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="150" y1="90" x2="150" y2="195" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
      <text x="145" y="212" className="text-xs fill-slate-600 font-bold">τ</text>
      {/* Courbe 1er ordre */}
      <path d="M 50 195 Q 110 105 460 91" fill="none" stroke="#334155" strokeWidth="2.5" />
      <text x="340" y="115" className="text-xs fill-slate-700 font-bold">1er ordre (pente ≠ 0)</text>
      {/* Courbe 2nd ordre pseudopériodique en rouge */}
      <path d="M 50 195 C 90 195, 130 35, 190 50 C 240 65, 260 115, 310 85 C 350 75, 390 92, 460 90" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <text x="175" y="40" className="text-xs fill-red-600 font-bold">2nd ordre (0 &lt; ξ &lt; 1 : dépassement D₁)</text>
      <text x="465" y="212" className="text-xs fill-slate-700 font-bold">t</text>
    </svg>
  ),

  // 6. Informatique Chap 2 : Intégration par rectangles et trapèzes
  "/images/informatique/integration-rectangles-trapezes.png": (
    <svg viewBox="0 0 520 220" className="w-full max-w-lg h-auto">
      <line x1="40" y1="185" x2="480" y2="185" stroke="#334155" strokeWidth="1.5" />
      <line x1="60" y1="200" x2="60" y2="25" stroke="#334155" strokeWidth="1.5" />
      {/* Rectangles à gauche */}
      <rect x="90" y="130" width="80" height="55" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      <rect x="170" y="85" width="80" height="100" fill="#f1f5f9" stroke="#475569" strokeWidth="1.5" />
      {/* Trapèzes en rouge à droite */}
      <polygon points="250,185 250,60 330,75 330,185" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <polygon points="330,185 330,75 410,120 410,185" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      {/* Courbe continue f(x) */}
      <path d="M 75 145 Q 230 20 430 135" fill="none" stroke="#0f172a" strokeWidth="2.5" />
      <text x="105" y="203" className="text-xs fill-slate-700 font-semibold">Rectangles (gauche)</text>
      <text x="290" y="203" className="text-xs fill-red-600 font-bold">Trapèzes (plus précis)</text>
    </svg>
  ),

  // 7. Physique Chap 2 : Machine cyclique ditherme
  "/images/physique-chimie/machine-ditherme.png": (
    <svg viewBox="0 0 500 220" className="w-full max-w-lg h-auto">
      {/* Source chaude TC */}
      <rect x="60" y="30" width="110" height="160" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="78" y="105" className="text-xs fill-red-700 font-bold">Source Chaude</text>
      <text x="98" y="125" className="text-sm fill-red-600 font-extrabold">T_C</text>
      {/* Système cyclique */}
      <circle cx="250" cy="110" r="42" fill="#fff" stroke="#334155" strokeWidth="2.5" />
      <text x="225" y="114" className="text-xs fill-slate-900 font-bold">Fluide (Cycle)</text>
      {/* Source froide TF */}
      <rect x="330" y="30" width="110" height="160" rx="8" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <text x="348" y="105" className="text-xs fill-slate-700 font-bold">Source Froide</text>
      <text x="372" y="125" className="text-sm fill-slate-800 font-extrabold">T_F</text>
      {/* Échanges QC, QF, W */}
      <line x1="170" y1="110" x2="208" y2="110" stroke="#dc2626" strokeWidth="2.5" />
      <text x="180" y="98" className="text-xs fill-red-600 font-bold">Q_C</text>
      <line x1="292" y1="110" x2="330" y2="110" stroke="#334155" strokeWidth="2.5" />
      <text x="302" y="98" className="text-xs fill-slate-700 font-bold">Q_F</text>
      <line x1="250" y1="152" x2="250" y2="205" stroke="#dc2626" strokeWidth="2.5" />
      <text x="260" y="195" className="text-xs fill-red-600 font-bold">Travail W</text>
    </svg>
  ),

  // 8. Physique Chap 3 : Résonance de courant RLC série
  "/images/physique-chimie/resonance-courant-rlc.png": (
    <svg viewBox="0 0 500 230" className="w-full max-w-lg h-auto">
      <line x1="50" y1="195" x2="460" y2="195" stroke="#334155" strokeWidth="1.5" />
      <line x1="50" y1="205" x2="50" y2="20" stroke="#334155" strokeWidth="1.5" />
      {/* Courbe de résonance */}
      <path d="M 50 195 Q 180 190 220 90 Q 240 30 260 90 Q 300 190 440 192" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      {/* Niveau Imax / sqrt(2) et bande passante */}
      <line x1="50" y1="95" x2="262" y2="95" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="218" y1="95" x2="218" y2="195" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="262" y1="95" x2="262" y2="195" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="240" y1="45" x2="240" y2="195" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="232" y="212" className="text-xs fill-slate-900 font-bold">ω₀</text>
      <text x="205" y="212" className="text-[11px] fill-red-600 font-bold">ω₁</text>
      <text x="262" y="212" className="text-[11px] fill-red-600 font-bold">ω₂</text>
      <text x="280" y="98" className="text-xs fill-red-600 font-bold">Δω = ω₀ / Q (à I_max / √2)</text>
      <text x="60" y="45" className="text-xs fill-slate-800 font-bold">I_max = E_m / R</text>
    </svg>
  ),

  // 9. Physique Chap 4 : Tube de courant / Effet Venturi
  "/images/physique-chimie/tube-de-courant-venturi.png": (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
      {/* Parois du tube de Venturi */}
      <path d="M 40 40 L 160 40 Q 240 40 270 75 L 450 75" fill="none" stroke="#1e293b" strokeWidth="3" />
      <path d="M 40 170 L 160 170 Q 240 170 270 135 L 450 135" fill="none" stroke="#1e293b" strokeWidth="3" />
      {/* Sections S1 et S2 */}
      <ellipse cx="100" cy="105" rx="12" ry="65" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
      <ellipse cx="340" cy="105" rx="8" ry="30" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Vecteurs vitesse v1 et v2 */}
      <line x1="100" y1="105" x2="155" y2="105" stroke="#334155" strokeWidth="3" />
      <text x="90" y="30" className="text-xs fill-slate-700 font-bold">S₁ grande (v₁ faible, P₁ forte)</text>
      <line x1="340" y1="105" x2="435" y2="105" stroke="#dc2626" strokeWidth="3" />
      <text x="280" y="60" className="text-xs fill-red-600 font-bold">S₂ réduite (v₂ élevée, P₂ faible)</text>
    </svg>
  ),

  // 10. Physique Chap 5 : Paroi multicouche et résistances thermiques en série
  "/images/physique-chimie/resistances-thermiques-serie.png": (
    <svg viewBox="0 0 520 210" className="w-full max-w-lg h-auto">
      {/* Mur 3 couches à gauche */}
      <rect x="40" y="35" width="45" height="140" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
      <rect x="85" y="35" width="60" height="140" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="145" y="35" width="35" height="140" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
      <text x="12" y="110" className="text-xs fill-red-600 font-bold">T₁</text>
      <text x="190" y="110" className="text-xs fill-slate-700 font-bold">T₂</text>
      <text x="95" y="110" className="text-xs fill-red-700 font-bold">Isolant</text>
      {/* Schéma électrique équivalent à droite */}
      <line x1="250" y1="105" x2="280" y2="105" stroke="#334155" strokeWidth="2" />
      <rect x="280" y="90" width="50" height="30" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="292" y="110" className="text-xs fill-slate-800 font-bold">R_th1</text>
      <line x1="330" y1="105" x2="355" y2="105" stroke="#334155" strokeWidth="2" />
      <rect x="355" y="90" width="55" height="30" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="367" y="110" className="text-xs fill-red-600 font-bold">R_th2</text>
      <line x1="410" y1="105" x2="435" y2="105" stroke="#334155" strokeWidth="2" />
      <rect x="435" y="90" width="50" height="30" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="447" y="110" className="text-xs fill-slate-800 font-bold">R_th3</text>
      <text x="330" y="65" className="text-xs fill-red-600 font-bold">Même flux Φ → R_eq = ∑ R_thi</text>
    </svg>
  ),

  // 11. Physique Chap 6 : Rails de Laplace
  "/images/physique-chimie/rails-de-laplace.png": (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
      {/* Rails horizontaux et résistance R */}
      <line x1="80" y1="50" x2="440" y2="50" stroke="#334155" strokeWidth="2.5" />
      <line x1="80" y1="160" x2="440" y2="160" stroke="#334155" strokeWidth="2.5" />
      <line x1="80" y1="50" x2="80" y2="80" stroke="#334155" strokeWidth="2" />
      <rect x="68" y="80" width="24" height="50" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="48" y="110" className="text-xs fill-slate-800 font-bold">R</text>
      <line x1="80" y1="130" x2="80" y2="160" stroke="#334155" strokeWidth="2" />
      {/* Barre mobile MN en rouge */}
      <line x1="280" y1="35" x2="280" y2="175" stroke="#dc2626" strokeWidth="4" />
      <text x="273" y="28" className="text-xs fill-red-600 font-bold">N</text>
      <text x="273" y="192" className="text-xs fill-red-600 font-bold">M</text>
      {/* Vecteur vitesse v et Force de Laplace */}
      <line x1="280" y1="105" x2="360" y2="105" stroke="#334155" strokeWidth="2.5" />
      <text x="335" y="95" className="text-xs fill-slate-900 font-bold">v(t) u_x</text>
      <line x1="280" y1="125" x2="210" y2="125" stroke="#dc2626" strokeWidth="2.5" />
      <text x="195" y="145" className="text-xs fill-red-600 font-bold">F_Laplace</text>
      {/* Champ B sortant */}
      <circle cx="160" cy="85" r="8" fill="none" stroke="#475569" strokeWidth="1.5" />
      <circle cx="160" cy="85" r="2" fill="#475569" />
      <text x="175" y="90" className="text-xs fill-slate-700 font-bold">B u_z</text>
    </svg>
  ),

  // 12. Physique Chap 7 : Trièdre direct OPPM (k, E, B)
  "/images/physique-chimie/structure-oppm-triedre.png": (
    <svg viewBox="0 0 500 220" className="w-full max-w-lg h-auto">
      {/* Axe de propagation Ox (vecteur k) */}
      <line x1="50" y1="115" x2="450" y2="115" stroke="#334155" strokeWidth="2" />
      <text x="435" y="105" className="text-xs fill-slate-900 font-bold">k (Propagation x)</text>
      {/* Champ électrique E vertical selon Oy en rouge */}
      <line x1="90" y1="190" x2="90" y2="25" stroke="#334155" strokeWidth="1.5" />
      <text x="72" y="35" className="text-xs fill-red-600 font-bold">E (y)</text>
      <path d="M 90 115 Q 150 25 210 115 T 330 115" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      {/* Champ magnétique B transverse selon Oz */}
      <line x1="90" y1="115" x2="40" y2="180" stroke="#334155" strokeWidth="1.5" />
      <text x="20" y="192" className="text-xs fill-slate-700 font-bold">B (z)</text>
      <path d="M 90 115 Q 130 165 210 115 T 330 115" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
      <text x="240" y="45" className="text-xs fill-red-600 font-bold">Trièdre direct (k, E, B) et B = E / c</text>
    </svg>
  ),

  // 13. Maths Chap 2 : Géométrie dans l'espace (Plan, Normale et Projeté H)
  "/images/mathematiques/geometrie-espace-plan-droite.png": (
    <svg viewBox="0 0 500 220" className="w-full max-w-lg h-auto">
      {/* Plan P en parallélogramme */}
      <polygon points="70,175 160,95 430,95 340,175" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <text x="95" y="165" className="text-xs fill-slate-700 font-bold">Plan P : ax + by + cz + d = 0</text>
      {/* Projeté orthogonal H et point M0 */}
      <line x1="260" y1="135" x2="260" y2="40" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="260" y="125" width="10" height="10" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <circle cx="260" cy="135" r="4" fill="#334155" />
      <text x="242" y="150" className="text-xs fill-slate-900 font-bold">H</text>
      <circle cx="260" cy="40" r="4.5" fill="#dc2626" />
      <text x="272" y="45" className="text-xs fill-red-600 font-bold">M₀(x₀, y₀, z₀)</text>
      {/* Vecteur normal n */}
      <line x1="350" y1="135" x2="350" y2="65" stroke="#dc2626" strokeWidth="2.5" />
      <text x="360" y="80" className="text-xs fill-red-600 font-bold">Vecteur normal n(a, b, c)</text>
    </svg>
  ),

  // 14. SII Chap 2 : Fermeture géométrique Bielle-Manivelle
  "/images/sii/fermeture-geometrique-bielle-manivelle.png": (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
      {/* Axe de glissière Ox */}
      <line x1="50" y1="150" x2="450" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Manivelle OA et Bielle AB */}
      <line x1="100" y1="150" x2="180" y2="65" stroke="#dc2626" strokeWidth="3.5" />
      <line x1="180" y1="65" x2="360" y2="150" stroke="#334155" strokeWidth="3.5" />
      {/* Piston en B */}
      <rect x="335" y="132" width="50" height="36" rx="4" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
      <circle cx="100" cy="150" r="5" fill="#334155" />
      <circle cx="180" cy="65" r="5" fill="#dc2626" />
      <circle cx="360" cy="150" r="5" fill="#334155" />
      <text x="85" y="172" className="text-xs fill-slate-900 font-bold">O</text>
      <text x="175" y="52" className="text-xs fill-red-600 font-bold">A (Manivelle R)</text>
      <text x="355" y="185" className="text-xs fill-slate-900 font-bold">B (Piston x(t))</text>
      <text x="205" y="195" className="text-xs fill-red-600 font-bold">Fermeture : OA + AB + BO = 0</text>
    </svg>
  ),

  // 15. SII Chap 3 : Coupure RDM et Torseur de cohésion
  "/images/sii/rdm-coupure-torseur-cohesion.png": (
    <svg viewBox="0 0 500 210" className="w-full max-w-lg h-auto">
      {/* Tronçon gauche E1 de la poutre */}
      <rect x="60" y="80" width="200" height="50" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <line x1="60" y1="55" x2="60" y2="155" stroke="#334155" strokeWidth="4" />
      <text x="120" y="110" className="text-xs fill-slate-700 font-bold">Tronçon E₁ [0, x]</text>
      {/* Centre de surface G(x) et composantes N, Ty, Mfz en rouge */}
      <circle cx="260" cy="105" r="4.5" fill="#dc2626" />
      <text x="230" y="122" className="text-xs fill-slate-900 font-bold">G(x)</text>
      <line x1="260" y1="105" x2="340" y2="105" stroke="#dc2626" strokeWidth="2.5" />
      <text x="348" y="110" className="text-xs fill-red-600 font-bold">Effort normal N(x)</text>
      <line x1="260" y1="105" x2="260" y2="35" stroke="#dc2626" strokeWidth="2.5" />
      <text x="270" y="45" className="text-xs fill-red-600 font-bold">Effort tranchant T_y(x)</text>
      <path d="M 295 140 A 40 40 0 0 0 295 70" fill="none" stroke="#dc2626" strokeWidth="2.5" />
      <text x="310" y="75" className="text-xs fill-red-600 font-bold">Moment fléchissant M_fz(x)</text>
    </svg>
  ),

  // 16. SII Chap 4 : Modèle MCC et 4 Quadrants
  "/images/sii/modele-mcc-4-quadrants.png": (
    <svg viewBox="0 0 520 210" className="w-full max-w-lg h-auto">
      {/* Schéma électrique R-L-E à gauche */}
      <line x1="40" y1="50" x2="90" y2="50" stroke="#334155" strokeWidth="2" />
      <rect x="90" y="38" width="45" height="24" fill="#fff" stroke="#334155" strokeWidth="2" />
      <text x="108" y="55" className="text-xs fill-slate-800 font-bold">R</text>
      <line x1="135" y1="50" x2="180" y2="50" stroke="#334155" strokeWidth="2" />
      <circle cx="180" cy="110" r="26" fill="#fef2f2" stroke="#dc2626" strokeWidth="2" />
      <text x="158" y="114" className="text-xs fill-red-600 font-bold">E = K_Φ Ω</text>
      <line x1="180" y1="50" x2="180" y2="84" stroke="#334155" strokeWidth="2" />
      <line x1="180" y1="136" x2="180" y2="170" stroke="#334155" strokeWidth="2" />
      <line x1="40" y1="170" x2="180" y2="170" stroke="#334155" strokeWidth="2" />
      <text x="35" y="115" className="text-xs fill-slate-800 font-bold">u(t)</text>
      {/* Plan des 4 quadrants à droite */}
      <line x1="270" y1="110" x2="490" y2="110" stroke="#334155" strokeWidth="1.5" />
      <line x1="380" y1="25" x2="380" y2="195" stroke="#334155" strokeWidth="1.5" />
      <text x="475" y="128" className="text-xs fill-slate-800 font-bold">C_em</text>
      <text x="388" y="35" className="text-xs fill-slate-800 font-bold">Ω</text>
      <text x="400" y="75" className="text-xs fill-red-600 font-bold">Q1 : Moteur</text>
      <text x="285" y="75" className="text-xs fill-slate-600 font-semibold">Q2 : Frein</text>
      <text x="280" y="155" className="text-xs fill-red-600 font-bold">Q3 : Moteur</text>
      <text x="400" y="155" className="text-xs fill-slate-600 font-semibold">Q4 : Frein</text>
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
        /* 1. Affichage direct du schéma vectoriel SVG intégré */
        <div className="flex justify-center bg-slate-50/80 rounded-lg p-4 border border-slate-100">
          {builtInSvg}
        </div>
      ) : !imageError ? (
        /* 2. Si vous ajoutez une autre image personnalisée dans /public/images/... */
        <div className="flex justify-center bg-slate-50 rounded-lg p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="max-h-80 w-auto object-contain rounded"
          />
        </div>
      ) : (
        /* 3. Secours si une image externe personnalisée est manquante */
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