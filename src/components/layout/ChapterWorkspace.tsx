"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Layers,
  CheckSquare,
  Printer,
  GraduationCap,
} from "lucide-react";

export type ChapterTabId = "cours" | "synthese" | "flashcards" | "qcm";

interface ChapterWorkspaceProps {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  semester?: number;
  flashcardsCount: number;
  qcmCount: number;
  courseNode: React.ReactNode;
  summaryNode: React.ReactNode;
  flashcardsNode: React.ReactNode;
  qcmNode: React.ReactNode;
}

export default function ChapterWorkspace({
  subjectId,
  subjectTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
  semester = 1,
  flashcardsCount,
  qcmCount,
  courseNode,
  summaryNode,
  flashcardsNode,
  qcmNode,
}: ChapterWorkspaceProps) {
  const pathname = usePathname();

  const detectTabFromPath = (path: string): ChapterTabId => {
    if (path.endsWith("/synthese")) return "synthese";
    if (path.endsWith("/flashcards")) return "flashcards";
    if (path.endsWith("/qcm")) return "qcm";
    return "cours";
  };

  const [activeTab, setActiveTab] = useState<ChapterTabId>(() =>
    detectTabFromPath(pathname)
  );

  // Synchronise l'onglet si l'utilisateur navigue depuis la Sidebar ou les boutons Précédent/Suivant du navigateur
  useEffect(() => {
    setActiveTab(detectTabFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      setActiveTab(detectTabFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Bascule instantanée (0 ms) sans déclencher de rechargement serveur Next.js
  const handleSwitchTab = (tab: ChapterTabId) => {
    setActiveTab(tab);
    const newUrl = `/${subjectId}/${chapterId}/${tab}`;
    if (typeof window !== "undefined" && window.location.pathname !== newUrl) {
      window.history.pushState(null, "", newUrl);
    }
  };

  const tabs: Array<{
    id: ChapterTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: "cours",
      label: "Cours complet",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "synthese",
      label: "Fiche Synthèse",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "flashcards",
      label: "Flashcards SRS",
      icon: <Layers className="w-4 h-4" />,
      badge: flashcardsCount,
    },
    {
      id: "qcm",
      label: "QCM Concours",
      icon: <CheckSquare className="w-4 h-4" />,
      badge: qcmCount,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* EN-TÊTE DU CHAPITRE + BARRE D'ONGLETS INSTANTANÉE */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-sky-950/80 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60">
                <GraduationCap className="w-3.5 h-3.5" />
                {subjectTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Chapitre {chapterNumber} • Semestre {semester}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {chapterTitle}
            </h1>
          </div>

          {(activeTab === "cours" || activeTab === "synthese") && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
          )}
        </div>

        {/* Barre des 4 onglets (commutation en mémoire 0 ms) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENU DES 4 ONGLETS PRÉ-CHARGÉS EN MÉMOIRE (ZÉRO LATENCE) */}
      <div>
        <div className={activeTab === "cours" ? "block" : "hidden"}>
          {courseNode}
        </div>
        <div className={activeTab === "synthese" ? "block" : "hidden"}>
          {summaryNode}
        </div>
        <div className={activeTab === "flashcards" ? "block" : "hidden"}>
          {flashcardsNode}
        </div>
        <div className={activeTab === "qcm" ? "block" : "hidden"}>
          {qcmNode}
        </div>
      </div>
    </div>
  );
}