"use client";

import SearchModal from "./SearchModal";
import ThemeToggle from "./ThemeToggle";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import { SubjectId } from "@/types/pedagogy";
import {
  Atom,
  Sigma,
  Cpu,
  Terminal,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  Activity,
} from "lucide-react";

// Association d'une icône Lucide par matière
const SUBJECT_ICONS: Record<SubjectId, React.ReactNode> = {
  "physique-chimie": <Atom className="w-4 h-4" />,
  mathematiques: <Sigma className="w-4 h-4" />,
  sii: <Cpu className="w-4 h-4" />,
  informatique: <Terminal className="w-4 h-4" />,
};

export default function Sidebar() {
  const pathname = usePathname();

  // Par défaut, on ouvre la matière active dans l'URL (ou Physique-Chimie par défaut)
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({
    "physique-chimie": true,
    mathematiques: true,
    sii: false,
    informatique: false,
  });

  const toggleSubject = (id: string) => {
    setOpenSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col">
      {/* En-tête de l'application */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="flex flex-col truncate">
          <span className="font-extrabold text-slate-900 tracking-tight text-[15px] leading-tight flex items-center gap-1.5">
            Prépa ATS
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          </span>
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider truncate">
            Ingénierie Industrielle
          </span>
        </div>
      </div>

      {/* Recherche instantanée + Navigation globale (Dashboard & Examen Blanc) */}
      <div className="p-3 border-b border-slate-100 space-y-1.5">
        <SearchModal />

        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            pathname === "/"
              ? "bg-blue-50 text-blue-600 dark:bg-sky-950/50 dark:text-sky-400 font-semibold font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Tableau de bord
        </Link>

        <Link
          href="/examen"
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            pathname.startsWith("/examen")
              ? "bg-blue-50 text-blue-600 dark:bg-sky-950/50 dark:text-sky-400 font-semibold font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-red-600" />
            <span>Mode Examen Blanc / Colle</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700">
            Chrono
          </span>
        </Link>
        <Link
          href="/simulateur-bode"
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            pathname.startsWith("/simulateur-bode")
              ? "bg-blue-50 text-blue-600 dark:bg-sky-950/50 dark:text-sky-400 font-semibold border border-blue-200/70 dark:border-sky-800/60"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Activity
              className={`w-4 h-4 ${
                pathname.startsWith("/simulateur-bode")
                  ? "text-blue-600 dark:text-sky-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            />
            <span>Traceur Bode & Indicielle</span>
          </span>
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
              pathname.startsWith("/simulateur-bode")
                ? "bg-blue-100 text-blue-700 dark:bg-sky-900/60 dark:text-sky-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Labo
          </span>
        </Link>
      </div>

      {/* Arborescence des matières et chapitres */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {ATS_CURRICULUM.map((subject) => {
          const isOpen = openSubjects[subject.id];
          const isSubjectActive = pathname.startsWith(`/${subject.id}`);

          return (
            <div key={subject.id} className="space-y-1">
              {/* Bouton Matière */}
              <button
                onClick={() => toggleSubject(subject.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isSubjectActive
                    ? "text-slate-900 bg-slate-100/80"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={isSubjectActive ? "text-red-600" : "text-slate-400"}>
                    {SUBJECT_ICONS[subject.id]}
                  </span>
                  {subject.title}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Liste des chapitres de la matière */}
              {isOpen && (
                <ul className="space-y-0.5 pl-3 border-l border-slate-200 ml-4 mt-1">
                  {subject.chapters.map((chapter) => {
  const isChapterActive = pathname.startsWith(`/${subject.id}/${chapter.id}`);
  return (
    <Link
      key={chapter.id}
      href={`/${subject.id}/${chapter.id}/cours`}
      className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
        isChapterActive
          ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
      }`}
    >
      {/* Badge 01..07 : Bleu quand actif, Ardoise contrasté (WCAG AA) quand inactif */}
      <span
        className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
          isChapterActive
            ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950"
            : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300/80"
        }`}
      >
        {chapter.number}
      </span>
      <span className="truncate">{chapter.title}</span>
    </Link>
  );
})}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Pied de barre latérale : Bouton Dark Mode + Rappel visuel */}
   <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
     <ThemeToggle />
     <div className="flex items-center gap-2 text-xs text-slate-500">
       <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
       <span>
         Accents <strong className="text-red-600">rouges</strong> = Formules & points critiques
       </span>
     </div>
   </div>
    </aside>
  );
}