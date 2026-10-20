"use client";

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

      {/* Lien vers le Tableau de bord */}
      <div className="p-3 border-b border-slate-100">
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-red-50 text-red-600 font-semibold"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Tableau de bord
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
                    const chapterBasePath = `/${subject.id}/${chapter.id}`;
                    const isChapterActive = pathname.startsWith(chapterBasePath);

                    return (
                      <li key={chapter.id}>
                        <Link
                          href={`${chapterBasePath}/cours`}
                          className={`group flex items-start gap-2.5 px-3 py-2 rounded-md text-xs transition-all ${
                            isChapterActive
                              ? "bg-red-50 text-red-600 font-semibold border-l-2 border-red-600 -ml-[13px] pl-[23px]"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <span
                            className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                              isChapterActive
                                ? "bg-red-100 text-red-700 font-bold"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}
                          >
                            {chapter.number}
                          </span>
                          <span className="leading-snug">{chapter.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Pied de barre latérale : Rappel de la règle visuelle */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
          <span>
            Accents <strong className="text-red-600">rouges</strong> = Formules & points critiques concours
          </span>
        </div>
      </div>
    </aside>
  );
}