"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Layers, CheckSquare } from "lucide-react";

interface ChapterTabsProps {
  subjectId: string;
  chapterId: string;
  subjectTitle: string;
  chapterTitle: string;
  semester: number;
}

const PEDAGOGICAL_MODES = [
  {
    slug: "cours",
    label: "Cours Détaillé",
    icon: BookOpen,
    description: "Développements, théorèmes et schémas",
  },
  {
    slug: "synthese",
    label: "Fiche Synthèse",
    icon: FileText,
    description: "L'essentiel et formules clés",
  },
  {
    slug: "flashcards",
    label: "Flashcards",
    icon: Layers,
    description: "Mémorisation active recto-verso",
  },
  {
    slug: "qcm",
    label: "QCM & Corrections",
    icon: CheckSquare,
    description: "Entraînement minuté pas-à-pas",
  },
];

export default function ChapterTabs({
  subjectId,
  chapterId,
  subjectTitle,
  chapterTitle,
  semester,
}: ChapterTabsProps) {
  const pathname = usePathname();
  const baseUrl = `/${subjectId}/${chapterId}`;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-8 pt-5">
      {/* Fil d'Ariane supérieur */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="uppercase tracking-wider text-slate-400">
            {subjectTitle}
          </span>
          <span>/</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
            Semestre {semester}
          </span>
        </div>
      </div>

      {/* Titre du chapitre */}
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-5">
        {chapterTitle}
      </h1>

      {/* Barre d'onglets des 4 modules pédagogiques */}
      <div className="flex items-center gap-2 -mb-px overflow-x-auto">
        {PEDAGOGICAL_MODES.map((mode) => {
          const href = `${baseUrl}/${mode.slug}`;
          const isActive = pathname === href;
          const Icon = mode.icon;

          return (
            <Link
              key={mode.slug}
              href={href}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "border-red-600 text-red-600 bg-red-50/50 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-red-600" : "text-slate-400"}`} />
              <span>{mode.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}