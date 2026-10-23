"use client";

import SearchModal from "./SearchModal";
import ThemeToggle from "./ThemeToggle";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ATS_CURRICULUM } from "@/lib/curriculum";
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

// Association d'une icône Lucide par matière (inclut Français-Philosophie)
const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  "physique-chimie": <Atom className="w-4 h-4" />,
  mathematiques: <Sigma className="w-4 h-4" />,
  sii: <Cpu className="w-4 h-4" />,
  informatique: <Terminal className="w-4 h-4" />,
  "francais-philosophie": <BookMarked className="w-4 h-4" />,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Par défaut, on ouvre Physique-Chimie et Mathématiques
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({
    "physique-chimie": true,
    mathematiques: true,
    sii: false,
    informatique: false,
    "francais-philosophie": false,
  });

  // Ferme automatiquement le tiroir mobile dès qu'on navigue vers une nouvelle page
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Verrouille le scroll de la page d'arrière-plan quand le menu mobile est ouvert
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
      {/* 1. BARRE SUPÉRIEURE MOBILE (Visible uniquement sous le breakpoint lg: 1024px) */}
      <header className="no-print lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
            Prépa ATS
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 2. VOILE D'ARRIÈRE-PLAN SUR MOBILE */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="no-print lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* 3. BARRE LATÉRALE (Repliable sur mobile, fixe à gauche sur Desktop lg:) */}
      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* En-tête de l'application */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[15px] leading-tight flex items-center gap-1.5">
                Prépa ATS
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
                Ingénierie Industrielle
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recherche instantanée + Navigation globale (Dashboard, Examen Blanc, Traceur Bode) */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
          <SearchModal />

          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname === "/"
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 shrink-0 ${
                pathname === "/"
                  ? "text-blue-600 dark:text-sky-400"
                  : "text-blue-600/80 dark:text-sky-400/80"
              }`}
            />
            <span>Tableau de bord</span>
          </Link>

          <Link
            href="/examen"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith("/examen")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Trophy
                className={`w-4 h-4 shrink-0 ${
                  pathname.startsWith("/examen")
                    ? "text-blue-600 dark:text-sky-400"
                    : "text-blue-600/80 dark:text-sky-400/80"
                }`}
              />
              <span>Mode Examen Blanc / Colle</span>
            </span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                pathname.startsWith("/examen")
                  ? "bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Chrono
            </span>
          </Link>

          <Link
            href="/simulateur-bode"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
              pathname.startsWith("/simulateur-bode")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity
                className={`w-4 h-4 shrink-0 ${
                  pathname.startsWith("/simulateur-bode")
                    ? "text-blue-600 dark:text-sky-400"
                    : "text-blue-600/80 dark:text-sky-400/80"
                }`}
              />
              <span>Traceur Bode & Indicielle</span>
            </span>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                pathname.startsWith("/simulateur-bode")
                  ? "bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Labo
            </span>
          </Link>
        </div>

        {/* Arborescence des matières et chapitres */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          {ATS_CURRICULUM.map((subject) => {
            const isOpen = openSubjects[subject.id];
            const isSubjectActive = pathname.startsWith(`/${subject.id}`);

            return (
              <div key={subject.id} className="space-y-1">
                {/* Bouton Matière */}
                <button
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isSubjectActive
                      ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/90"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={`shrink-0 ${
                        isSubjectActive
                          ? "text-blue-600 dark:text-sky-400"
                          : "text-blue-600/80 dark:text-sky-400/80"
                      }`}
                    >
                      {SUBJECT_ICONS[subject.id] ?? <Atom className="w-4 h-4" />}
                    </span>
                    <span className="truncate">
                      {subject.shortTitle ?? subject.title}
                    </span>
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Liste des chapitres de la matière */}
                {isOpen && (
                  <ul className="space-y-0.5 pl-3 border-l border-slate-200 dark:border-slate-800 ml-4 mt-1">
                    {subject.chapters.map((chapter) => {
                      const isChapterActive = pathname.startsWith(
                        `/${subject.id}/${chapter.id}`
                      );
                      return (
                        <li key={chapter.id}>
                          <Link
                            href={`/${subject.id}/${chapter.id}/cours`}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                              isChapterActive
                                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/70 dark:text-sky-300 font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-950 dark:hover:text-white font-medium"
                            }`}
                          >
                            {/* Badge 01..11 : Bleu quand actif, Ardoise contrasté (WCAG AA) quand inactif */}
                            <span
                              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isChapterActive
                                  ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950"
                                  : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300/80 dark:group-hover:bg-slate-700"
                              }`}
                            >
                              {chapter.number}
                            </span>
                            <span className="truncate">{chapter.title}</span>
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

        {/* Pied de barre latérale : Bouton Dark Mode + Rappel visuel sémantique */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          <ThemeToggle />
          <div className="space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              <span>
                Encadrés <strong className="text-red-600 dark:text-red-400 font-bold">rouges</strong> = Formules & points critiques
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}