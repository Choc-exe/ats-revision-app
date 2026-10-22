"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, BookOpen, Layers, CheckSquare, ArrowRight } from "lucide-react";

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [indexData, setIndexData] = useState<any[]>([]);
  const router = useRouter();

  // Raccourci clavier Ctrl+K / Cmd+K et touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Chargement de l'index à la première ouverture
  useEffect(() => {
    if (isOpen && indexData.length === 0) {
      fetch("/api/study-data")
        .then((res) => res.json())
        .then((data) => {
          if (data.searchIndex) setIndexData(data.searchIndex);
        });
    }
  }, [isOpen, indexData.length]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return indexData.slice(0, 8);
    return indexData
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.chapterTitle.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [query, indexData]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* Bouton déclencheur dans la Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer border border-slate-200/80"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-red-600" />
          <span>Rechercher un concept...</span>
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-700">
  Ctrl K
</kbd>
      </button>

      {/* Fenêtre modale de recherche */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Champ de saisie */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
              <Search className="w-5 h-5 text-red-600 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : Bernoulli, Laplace, Gauss, Hacheur, Dichotomie, PFD..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
              {results.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  Aucun résultat trouvé pour « <strong>{query}</strong> ».
                </div>
              ) : (
                results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.href)}
                    className="w-full flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600">
                          {item.type === "Chapitre" && <BookOpen className="w-3 h-3" />}
                          {item.type === "Flashcard" && <Layers className="w-3 h-3" />}
                          {item.type === "QCM" && <CheckSquare className="w-3 h-3" />}
                          {item.type}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 truncate">
                          {item.subjectTitle} • {item.chapterTitle}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.snippet}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 shrink-0 mt-2" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}