"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FlashcardItem, SubjectId } from "@/types/pedagogy";
import {
  getSrsRecords,
  rateFlashcardSrs,
  SrsCardRecord,
  SrsRating,
} from "@/lib/srs-storage";
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  Shuffle,
  Filter,
} from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

export interface FlashcardDeckData {
  subject: SubjectId;
  chapterId: string;
  title: string;
  cards: FlashcardItem[];
}

export interface FlashcardDeckProps {
  deck: FlashcardDeckData;
}

function SafeMathText({
  content,
  displayMode = false,
}: {
  content?: string;
  displayMode?: boolean;
}) {
  if (!content || typeof content !== "string") return null;

  if (displayMode && !content.includes("$")) {
    try {
      const html = katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <span>{content}</span>;
    }
  }

  const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{math}</span>;
          }
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={i}>{math}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function FlashcardDeck({ deck }: FlashcardDeckProps) {
  const [srsMap, setSrsMap] = useState<Record<string, SrsCardRecord>>({});
  const [filterMode, setFilterMode] = useState<"all" | "due">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffledIds, setShuffledIds] = useState<string[] | null>(null);

  useEffect(() => {
    setSrsMap(getSrsRecords());
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    (deck.cards ?? []).forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [deck.cards]);

  const isCardDue = useCallback(
    (cardId: string) => {
      const rec = srsMap[cardId];
      if (!rec) return true; // Jamais étudiée = à réviser
      return rec.dueTimestamp <= Date.now();
    },
    [srsMap]
  );

  const dueCount = useMemo(() => {
    return (deck.cards ?? []).filter((c) => isCardDue(c.id)).length;
  }, [deck.cards, isCardDue]);

  const masteredCount = useMemo(() => {
    return (deck.cards ?? []).filter(
      (c) => (srsMap[c.id]?.intervalDays ?? 0) >= 5
    ).length;
  }, [deck.cards, srsMap]);

  const activeCards = useMemo(() => {
    let list = [...(deck.cards ?? [])];

    if (shuffledIds) {
      const orderMap = new Map(shuffledIds.map((id, idx) => [id, idx]));
      list.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    }

    if (filterMode === "due") {
      list = list.filter((c) => isCardDue(c.id));
    }

    if (categoryFilter !== "all") {
      list = list.filter((c) => c.category === categoryFilter);
    }

    return list;
  }, [deck.cards, shuffledIds, filterMode, categoryFilter, isCardDue]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode, categoryFilter]);

  const currentCard = activeCards[currentIndex];

  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(
      (prev) => (prev - 1 + activeCards.length) % activeCards.length
    );
  }, [activeCards.length]);

  const handleRate = useCallback(
    (rating: SrsRating) => {
      if (!currentCard) return;
      const updated = rateFlashcardSrs({
        cardId: currentCard.id,
        subjectId: deck.subject,
        chapterId: deck.chapterId,
        rating,
      });
      setSrsMap((prev) => ({ ...prev, [currentCard.id]: updated }));
      setIsFlipped(false);
      if (currentIndex < activeCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    },
    [currentCard, deck.subject, deck.chapterId, currentIndex, activeCards.length]
  );

  const handleShuffle = () => {
    const ids = (deck.cards ?? []).map((c) => c.id);
    ids.sort(() => Math.random() - 0.5);
    setShuffledIds(ids);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Raccourcis clavier (Espace, Flèches, 1/2/3)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      } else if (isFlipped && e.key === "1") {
        handleRate("again");
      } else if (isFlipped && e.key === "2") {
        handleRate("good");
      } else if (isFlipped && e.key === "3") {
        handleRate("easy");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFlipped, handleNext, handlePrev, handleRate]);

  if (!currentCard) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Toutes les cartes de cette sélection sont à jour !
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Vous avez terminé vos révisions espacées prévues pour aujourd'hui sur ce filtre. Vous pouvez repasser en mode « Toutes les cartes » pour un entraînement libre.
        </p>
        <button
          type="button"
          onClick={() => {
            setFilterMode("all");
            setCategoryFilter("all");
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
        >
          Afficher toutes les cartes ({deck.cards.length})
        </button>
      </div>
    );
  }

  const frontText =
    typeof currentCard.front === "string"
      ? currentCard.front
      : (currentCard as any).question ?? "";

  const backObj =
    currentCard.back && typeof currentCard.back === "object"
      ? currentCard.back
      : {
          mainAnswer:
            typeof currentCard.back === "string"
              ? currentCard.back
              : (currentCard as any).answer ?? "",
          criticalFormula: (currentCard as any).criticalFormula,
          commonTrap: (currentCard as any).commonTrap,
        };

  const cardSrs = srsMap[currentCard.id];

  return (
    <div className="space-y-5">
      {/* BARRE DE PILOTAGE SRS & FILTRES */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterMode === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            Toutes ({deck.cards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("due")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filterMode === "due"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>À réviser aujourd'hui ({dueCount})</span>
          </button>

          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 ml-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
            Maîtrisées : {masteredCount} / {deck.cards.length}
          </span>
          <button
            type="button"
            onClick={handleShuffle}
            title="Mélanger le paquet"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mélanger</span>
          </button>
        </div>
      </div>

      {/* CARTE PRINCIPALE INTERACTIVE */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-sky-500 p-6 sm:p-10 min-h-[300px] flex flex-col justify-between transition-all cursor-pointer shadow-sm select-none"
      >
        {/* En-tête de la carte */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-sky-950/80 text-blue-700 dark:text-sky-300">
              Carte {currentIndex + 1} / {activeCards.length}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {currentCard.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cardSrs && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                Intervalle : {cardSrs.intervalDays}j
              </span>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              {isFlipped ? "Verso (Réponse)" : "Recto (Question)"}
            </span>
          </div>
        </div>

        {/* Corps de la carte (Recto ou Verso) */}
        <div className="py-6 my-auto">
          {!isFlipped ? (
            <div className="text-center space-y-4">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed max-w-2xl mx-auto">
                <SafeMathText content={frontText} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
                Cliquez sur la carte ou appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Espace</kbd> pour révéler la réponse
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                <SafeMathText content={backObj.mainAnswer} />
              </div>

              {backObj.criticalFormula && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/25 p-4">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 block mb-1">
                    Formule / Règle critique à retenir :
                  </span>
                  <div className="text-sm text-slate-900 dark:text-white overflow-x-auto">
                    <SafeMathText content={backObj.criticalFormula} displayMode />
                  </div>
                </div>
              )}

              {(backObj as any).commonTrap && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 text-xs flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Piège classique en concours : </span>
                    <SafeMathText content={(backObj as any).commonTrap} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied de carte : Boutons SRS Anki (si retournée) ou Navigation simple */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
        >
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédente</span>
          </button>

          {isFlipped ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRate("again")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                title="Raccourci : Touche 1"
              >
                1 • À revoir (&lt; 1j)
              </button>
              <button
                type="button"
                onClick={() => handleRate("good")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                title="Raccourci : Touche 2"
              >
                2 • Correct (2j+)
              </button>
              <button
                type="button"
                onClick={() => handleRate("easy")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                title="Raccourci : Touche 3"
              >
                3 • Maîtrisé (5j+)
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Révéler la réponse</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span>Suivante</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}