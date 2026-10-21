import React from "react";
import BodeStepSimulator from "@/components/interactive/BodeStepSimulator";
import { Activity } from "lucide-react";

export default function SimulateurBodePage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-sky-950/60 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/60 mb-3">
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
          Laboratoire Interactif SII & Électrocinétique
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Traceur de Diagrammes de Bode & Réponse Indicielle
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Faites varier le gain statique K, la constante de temps τ, le facteur d&apos;amortissement ξ (ou le facteur de qualité Q = 1/(2ξ)) et la pulsation propre ω₀ pour visualiser en temps réel l&apos;impact sur les performances temporelles et fréquentielles.
        </p>
      </div>

      <BodeStepSimulator />
    </div>
  );
}