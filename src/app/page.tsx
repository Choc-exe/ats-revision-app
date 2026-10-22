import React from "react";
import Link from "next/link";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import { BookOpen, Layers, CheckSquare, ArrowRight, Flame } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
      {/* Bannière d'accueil */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 dark:bg-sky-950/60 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/60 mb-3">
          <Flame className="w-3.5 h-3.5" />
          Programme Officiel CPGE ATS — Ingénierie Industrielle
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Environnement Local de Révision Intensive
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Sélectionnez un chapitre dans la barre latérale ou ci-dessous pour accéder au{" "}
          <strong className="text-slate-900 dark:text-slate-100">Cours détaillé</strong>, à la{" "}
          <strong className="text-slate-900 dark:text-slate-100">Fiche synthèse</strong>, aux{" "}
          <strong className="text-blue-600 dark:text-sky-400">Flashcards</strong> et aux{" "}
          <strong className="text-blue-600 dark:text-sky-400">QCM corrigés</strong>.
        </p>
      </div>

      {/* Grille des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ATS_CURRICULUM.map((subject) => (
          <div
            key={subject.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {subject.title}
                </h2>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {subject.chapters.length} chapitres
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {/* Suppression de .slice(0, 4) pour afficher TOUS les chapitres */}
                {subject.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/${subject.id}/${chapter.id}/cours`}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono font-bold text-blue-600 dark:text-sky-400 shrink-0">
                          {chapter.number}.
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                          {chapter.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Badges descriptifs en bas de carte */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500/70" /> MDX + KaTeX
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-500/70" /> Flashcards 3D
              </span>
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500/70" /> QCM pas-à-pas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}