import React from "react";
import Link from "next/link";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import { BookOpen, Layers, CheckSquare, ArrowUpRight, Flame } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
      {/* Bannière d'accueil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 mb-3">
          <Flame className="w-3.5 h-3.5" />
          Programme Officiel CPGE ATS — Ingénierie Industrielle
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          Environnement Local de Révision Intensive
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Sélectionnez un chapitre dans la barre latérale ou ci-dessous pour accéder au{" "}
          <strong className="text-slate-900">Cours détaillé</strong>, à la{" "}
          <strong className="text-slate-900">Fiche synthèse</strong>, aux{" "}
          <strong className="text-red-600">Flashcards</strong> et aux{" "}
          <strong className="text-red-600">QCM corrigés</strong>.
        </p>
      </div>

      {/* Grille des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ATS_CURRICULUM.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  {subject.title}
                </h2>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                  {subject.chapters.length} chapitres
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                {subject.chapters.slice(0, 4).map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/${subject.id}/${chapter.id}/cours`}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                          {chapter.number}
                        </span>
                        <span className="font-medium text-slate-700 group-hover:text-slate-900">
                          {chapter.title}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-red-600" /> MDX + KaTeX
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-red-600" /> Flashcards 3D
              </span>
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-red-600" /> QCM pas-à-pas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}