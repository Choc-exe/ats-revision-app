"use client";

import SearchModal from "./SearchModal";
import ThemeToggle from "./ThemeToggle";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
} from "lucide-react";

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  "physique-chimie": <Atom className="w-4 h-4" />,
  mathematiques: <Sigma className="w-4 h-4" />,
  sii: <Cpu className="w-4 h-4" />,
  informatique: <Terminal className="w-4 h-4" />,
  "francais-philosophie": <BookMarked className="w-4 h-4" />,
};

const MIN_WIDTH = 240;
const DEFAULT_WIDTH = 288; // w-72
const MAX_WIDTH = 520;
const COLLAPSED_WIDTH = 68;

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // États de dimensionnement et de rétractation sur Desktop
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Par défaut, on ouvre Physique-Chimie et Mathématiques
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({
    "physique-chimie": true,
    mathematiques: true,
    sii: false,
    informatique: false,
    "francais-philosophie": false,
  });

  // Restauration des préférences utilisateur (largeur + état replié)
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("ats-sidebar-width");
      const savedCollapsed = localStorage.getItem("ats-sidebar-collapsed");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
      if (savedCollapsed === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore erreurs localStorage
    }
  }, []);

  // Synchronise la largeur effective avec une variable CSS globale (--sidebar-width)
  const effectiveWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${effectiveWidth}px`
    );
  }, [effectiveWidth]);

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

  // Gestion du glisser-déposer (Drag to resize)
  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isCollapsed) setIsCollapsed(false);
      setIsResizing(true);
    },
    [isCollapsed]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Si l'utilisateur tire complètement à gauche (< 120px), on rétracte automatiquement !
      if (e.clientX < 120) {
        setIsCollapsed(true);
        localStorage.setItem("ats-sidebar-collapsed", "true");
        return;
      }

      setIsCollapsed(false);
      localStorage.setItem("ats-sidebar-collapsed", "false");
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
      localStorage.setItem("ats-sidebar-width", String(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ats-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const resetWidth = () => {
    setIsCollapsed(false);
    setSidebarWidth(DEFAULT_WIDTH);
    try {
      localStorage.setItem("ats-sidebar-collapsed", "false");
      localStorage.setItem("ats-sidebar-width", String(DEFAULT_WIDTH));
    } catch {}
  };

  const toggleSubject = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubjects((prev) => ({ ...prev, [id]: true }));
      return;
    }
    setOpenSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allExpanded = ATS_CURRICULUM.every((s) => openSubjects[s.id]);
  const toggleAllSubjects = () => {
    const nextState: Record<string, boolean> = {};
    ATS_CURRICULUM.forEach((s) => {
      nextState[s.id] = !allExpanded;
    });
    setOpenSubjects(nextState);
  };

  // Si la barre est élargie (>= 340px), on autorise le texte des chapitres à s'afficher en entier sur 2 lignes
  const showFullTitles = sidebarWidth >= 340;

  return (
    <>
      {/* Styles CSS injectés pour :
          1. Adapter automatiquement le décalage (padding-left / margin-left) du layout Desktop (lg:pl-72 / lg:ml-72)
          2. Remplacer la scrollbar native par une scrollbar fine et discrète */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .lg\\:pl-72 {
            padding-left: var(--sidebar-width, 288px) !important;
            transition: ${isResizing
              ? "none"
              : "padding-left 200ms cubic-bezier(0.4, 0, 0.2, 1)"};
          }
          .lg\\:ml-72 {
            margin-left: var(--sidebar-width, 288px) !important;
            transition: ${isResizing
              ? "none"
              : "margin-left 200ms cubic-bezier(0.4, 0, 0.2, 1)"};
          }
        }

        /* Scrollbar sur-mesure ultra-fine et élégante */
        .ats-custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .ats-custom-scroll:hover {
          scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
        }
        .dark .ats-custom-scroll:hover {
          scrollbar-color: rgba(71, 85, 105, 0.65) transparent;
        }
        .ats-custom-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .ats-custom-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 6px 0;
        }
        .ats-custom-scroll::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 9999px;
          transition: background-color 0.2s ease;
        }
        .ats-custom-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.5);
        }
        .dark .ats-custom-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(71, 85, 105, 0.7);
        }
        .ats-custom-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(59, 130, 246, 0.8) !important;
        }
      `}</style>

      {/* 1. BARRE SUPÉRIEURE MOBILE (Visible uniquement sous le breakpoint lg: 1024px) */}
      <header className="no-print lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
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

      {/* 3. BARRE LATÉRALE (Redimensionnable et rétractable sur Desktop) */}
      <aside
        ref={sidebarRef}
        style={{
          width: mobileOpen ? "288px" : `${effectiveWidth}px`,
        }}
        className={`no-print fixed inset-y-0 left-0 z-50 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col select-none ${
          isResizing
            ? "transition-none"
            : "transition-[transform,width] duration-200 ease-in-out"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* POIGNÉE DE REDIMENSIONNEMENT DROITE (Desktop uniquement) */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={resetWidth}
          title="Glisser pour élargir ou réduire • Double-clic pour réinitialiser"
          className="hidden lg:flex absolute top-0 -right-1.5 bottom-0 w-3 z-50 cursor-col-resize group items-center justify-center"
        >
          {/* Ligne lumineuse qui apparaît au survol ou pendant le redimensionnement */}
          <div
            className={`w-0.5 h-full transition-colors ${
              isResizing
                ? "bg-blue-600 dark:bg-sky-400"
                : "bg-transparent group-hover:bg-blue-500/60 dark:group-hover:bg-sky-400/60"
            }`}
          />
          {/* Pastille centrale de préhension */}
          <div
            className={`absolute w-1.5 h-10 rounded-full transition-all ${
              isResizing
                ? "bg-blue-600 dark:bg-sky-400 scale-110"
                : "bg-slate-300 dark:bg-slate-700 opacity-0 group-hover:opacity-100"
            }`}
          />
        </div>

        {/* EN-TÊTE DE L'APPLICATION */}
        <div
          className={`h-16 border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 ${
            isCollapsed && !mobileOpen
              ? "justify-center px-2"
              : "justify-between px-4 gap-2"
          }`}
        >
          {(!isCollapsed || mobileOpen) && (
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-[15px] leading-tight flex items-center gap-1.5">
                  Prépa ATS
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 animate-pulse" />
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
                  Ingénierie Industrielle
                </span>
              </div>
            </Link>
          )}

          {/* Bouton Rétracter / Déployer sur Desktop */}
          <button
            type="button"
            onClick={toggleCollapse}
            title={
              isCollapsed
                ? "Déployer la barre latérale"
                : "Rétracter la barre latérale"
            }
            aria-label="Rétracter ou déployer la barre latérale"
            className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Bouton Fermer sur Mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RECHERCHE + NAVIGATION GLOBALE */}
        <div
          className={`border-b border-slate-200 dark:border-slate-800 shrink-0 ${
            isCollapsed && !mobileOpen ? "p-2 space-y-2" : "p-3 space-y-1.5"
          }`}
        >
          {(!isCollapsed || mobileOpen) && <SearchModal />}

          <Link
            href="/"
            title="Tableau de bord"
            className={`flex items-center rounded-lg text-xs transition-colors ${
              isCollapsed && !mobileOpen
                ? "justify-center p-2.5"
                : "gap-2.5 px-3 py-2"
            } ${
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
            {(!isCollapsed || mobileOpen) && (
              <span className="truncate">Tableau de bord</span>
            )}
          </Link>

          <Link
            href="/examen"
            title="Mode Examen Blanc / Colle"
            className={`flex items-center rounded-lg text-xs transition-colors ${
              isCollapsed && !mobileOpen
                ? "justify-center p-2.5"
                : "justify-between px-3 py-2"
            } ${
              pathname.startsWith("/examen")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Trophy
                className={`w-4 h-4 shrink-0 ${
                  pathname.startsWith("/examen")
                    ? "text-blue-600 dark:text-sky-400"
                    : "text-blue-600/80 dark:text-sky-400/80"
                }`}
              />
              {(!isCollapsed || mobileOpen) && (
                <span className="truncate">Mode Examen Blanc / Colle</span>
              )}
            </span>
            {(!isCollapsed || mobileOpen) && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                  pathname.startsWith("/examen")
                    ? "bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Chrono
              </span>
            )}
          </Link>

          <Link
            href="/simulateur-bode"
            title="Traceur Bode & Indicielle"
            className={`flex items-center rounded-lg text-xs transition-colors ${
              isCollapsed && !mobileOpen
                ? "justify-center p-2.5"
                : "justify-between px-3 py-2"
            } ${
              pathname.startsWith("/simulateur-bode")
                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300 font-bold border border-blue-200/70 dark:border-sky-800/60"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-medium"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Activity
                className={`w-4 h-4 shrink-0 ${
                  pathname.startsWith("/simulateur-bode")
                    ? "text-blue-600 dark:text-sky-400"
                    : "text-blue-600/80 dark:text-sky-400/80"
                }`}
              />
              {(!isCollapsed || mobileOpen) && (
                <span className="truncate">Traceur Bode & Indicielle</span>
              )}
            </span>
            {(!isCollapsed || mobileOpen) && (
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                  pathname.startsWith("/simulateur-bode")
                    ? "bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Labo
              </span>
            )}
          </Link>
        </div>

        {/* BARRE D'OUTILS DU PROGRAMME (Tout déplier / Tout replier) */}
        {(!isCollapsed || mobileOpen) && (
          <div className="px-4 pt-2.5 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0">
            <span>Programme officiel</span>
            <button
              type="button"
              onClick={toggleAllSubjects}
              className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
              title={
                allExpanded
                  ? "Replier toutes les matières"
                  : "Déplier toutes les matières"
              }
            >
              <ChevronsUpDown className="w-3 h-3" />
              <span>{allExpanded ? "Tout replier" : "Tout déplier"}</span>
            </button>
          </div>
        )}

        {/* ARBORESCENCE DES MATIÈRES ET CHAPITRES (Avec Scrollbar personnalisée élégante) */}
        <nav
          className={`ats-custom-scroll flex-1 overflow-y-auto overflow-x-hidden ${
            isCollapsed && !mobileOpen ? "p-2 space-y-2" : "p-3 space-y-2.5"
          }`}
        >
          {ATS_CURRICULUM.map((subject) => {
            const isOpen = openSubjects[subject.id];
            const isSubjectActive = pathname.startsWith(`/${subject.id}`);

            return (
              <div key={subject.id} className="space-y-1">
                {/* Bouton Matière */}
                <button
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  title={`${subject.title} (${subject.chapters.length} chapitres)`}
                  className={`w-full flex items-center rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isCollapsed && !mobileOpen
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-2"
                  } ${
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
                    {(!isCollapsed || mobileOpen) && (
                      <span
                        className={
                          showFullTitles ? "text-left leading-snug" : "truncate"
                        }
                      >
                        {showFullTitles
                          ? subject.title
                          : subject.shortTitle ?? subject.title}
                      </span>
                    )}
                  </span>
                  {(!isCollapsed || mobileOpen) &&
                    (isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 ml-1" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0 ml-1" />
                    ))}
                </button>

                {/* Liste des chapitres de la matière (Masquée en mode rail rétracté) */}
                {isOpen && (!isCollapsed || mobileOpen) && (
                  <ul className="space-y-0.5 pl-2.5 border-l-2 border-slate-200/80 dark:border-slate-800 ml-4 mt-1">
                    {subject.chapters.map((chapter) => {
                      const isChapterActive = pathname.startsWith(
                        `/${subject.id}/${chapter.id}`
                      );
                      return (
                        <li key={chapter.id}>
                          <Link
                            href={`/${subject.id}/${chapter.id}/cours`}
                            title={`${chapter.number}. ${chapter.title}`}
                            className={`group flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                              isChapterActive
                                ? "bg-blue-50 text-blue-700 dark:bg-sky-950/70 dark:text-sky-300 font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-950 dark:hover:text-white font-medium"
                            }`}
                          >
                            <span
                              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                                isChapterActive
                                  ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950"
                                  : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-slate-300/80 dark:group-hover:bg-slate-700"
                              }`}
                            >
                              {chapter.number}
                            </span>
                            <span
                              className={
                                showFullTitles
                                  ? "leading-snug break-words"
                                  : "truncate pt-0.5"
                              }
                            >
                              {chapter.title}
                            </span>
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

        {/* PIED DE BARRE LATÉRALE */}
        <div
          className={`border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0 ${
            isCollapsed && !mobileOpen ? "p-2 flex justify-center" : "p-3.5 space-y-2.5"
          }`}
        >
          {(!isCollapsed || mobileOpen) ? (
            <>
              <ThemeToggle />
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span className="truncate">
                    Encadrés{" "}
                    <strong className="text-red-600 dark:text-red-400 font-bold">
                      rouges
                    </strong>{" "}
                    = Formules critiques
                  </span>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Déployer la barre"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}