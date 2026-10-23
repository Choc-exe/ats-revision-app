"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import SearchModal from "./SearchModal";
import {
  Atom,
  Sigma,
  Cpu,
  Terminal,
  BookMarked,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Trophy,
  Activity,
  Menu,
  X,
} from "lucide-react";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  "physique-chimie": Atom,
  mathematiques: Sigma,
  sii: Cpu,
  informatique: Terminal,
  "francais-philosophie": BookMarked,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({
    "physique-chimie": true,
    mathematiques: true,
    sii: false,
    informatique: false,
    "francais-philosophie": false,
  });

  // Ferme automatiquement le menu mobile lors d'un changement de page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Empêche le défilement de l'arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleSubject = (id: string) => {
    setOpenSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* 1. BARRE SUPÉRIEURE MOBILE (Visible uniquement sous 1024px) */}
      <header className="no-print lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
            Prépa ATS — Révision
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. VOILE SOMBRE D'ARRIÈRE-PLAN SUR MOBILE */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="no-print lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* 3. BARRE LATÉRALE (Coulissante sur mobile, fixe à gauche sur Desktop lg:) */}
      <aside
        className={`no-print fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* En-tête de la Sidebar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-none">
                Prépa ATS
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Programme Officiel 2025
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recherche + Outils globaux */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
          <SearchModal />

          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
            <span>Tableau de bord</span>
          </Link>

          <Link
            href="/examen"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith("/examen")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>Mode Examen Blanc / Colle</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-sky-900/60 dark:text-sky-300">
              Chrono
            </span>
          </Link>

          <Link
            href="/simulateur-bode"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith("/simulateur-bode")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>Traceur Bode & Indicielle</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700 dark:bg-sky-900/60 dark:text-sky-300">
              Labo
            </span>
          </Link>
        </div>

        {/* Arborescence des matières et chapitres */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {ATS_CURRICULUM.map((subject) => {
            const Icon = SUBJECT_ICONS[subject.id] || Atom;
            const isOpen = openSubjects[subject.id];

            return (
              <div key={subject.id}>
                <button
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate">{subject.shortTitle}</span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="mt-1 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-1">
                    {subject.chapters.map((chapter) => {
                      const isChapterActive = pathname.startsWith(
                        `/${subject.id}/${chapter.id}`
                      );
                      return (
                        <Link
                          key={chapter.id}
                          href={`/${subject.id}/${chapter.id}/cours`}
                          className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isChapterActive
                              ? "bg-blue-50 text-blue-700 dark:bg-sky-950/70 dark:text-sky-300 font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-950 dark:hover:text-white font-medium"
                          }`}
                        >
                          <span
                            className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              isChapterActive
                                ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950"
                                : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300"
                            }`}
                          >
                            {chapter.number}
                          </span>
                          <span className="truncate">{chapter.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Légende sémantique */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span>Encadrés rouges = Formules & points critiques</span>
          </div>
        </div>
      </aside>
    </>
  );
}