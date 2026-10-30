"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Layers,
  CheckSquare,
  ChevronRight,
} from "lucide-react";

export type ChapterTabId = "cours" | "synthese" | "flashcards" | "qcm";

interface ChapterWorkspaceProps {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  courseNode: React.ReactNode;
  summaryNode: React.ReactNode;
  flashcardsNode: React.ReactNode;
  qcmNode: React.ReactNode;
}

const TABS: Array<{
  id: ChapterTabId;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "cours",
    label: "Cours détaillé",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: "synthese",
    label: "Fiche Synthèse",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "qcm",
    label: "QCM & Annales",
    icon: <CheckSquare className="w-4 h-4" />,
  },
];

export default function ChapterWorkspace({
  subjectId,
  subjectTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
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

  const handleSwitchTab = (tab: ChapterTabId) => {
    setActiveTab(tab);
    const newUrl = `/${subjectId}/${chapterId}/${tab}`;
    if (typeof window !== "undefined" && window.location.pathname !== newUrl) {
      window.history.pushState(null, "", newUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête d'origine du chapitre */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
              {subjectTitle}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Chapitre {chapterNumber}</span>
          </div>

          {/* Titre du chapitre */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <span className="font-mono text-red-600 dark:text-red-400 mr-2.5">
              {chapterNumber}.
            </span>
            {chapterTitle}
          </h1>

          {/* Barre d'onglets d'origine (commutation 0 ms) */}
          <nav className="flex items-center gap-1 pt-2 overflow-x-auto border-b border-slate-200 dark:border-slate-800 -mb-5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400 bg-red-50/40 dark:bg-red-950/20"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Contenu des 4 vues gardées en mémoire avec le graphisme d'origine */}
      <div className="max-w-5xl mx-auto">
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