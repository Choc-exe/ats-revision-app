"use client";
import React, { useState } from "react";
import { FlashcardDeckData, FlashcardItem } from "@/types/pedagogy";
import MathText from "@/components/mdx/MathText";
import {
  RotateCw,
  CheckCircle2,
  XCircle,
  Flame,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface FlashcardDeckProps {
  deck: FlashcardDeckData;
}

export default function FlashcardDeck({ deck }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [toReviewIds, setToReviewIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const cards = deck.cards;
  const currentCard: FlashcardItem = cards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (status: "mastered" | "review") => {
    if (status === "mastered") {
      if (!masteredIds.includes(currentCard.id)) {
        setMasteredIds([...masteredIds, currentCard.id]);
      }
      setToReviewIds(toReviewIds.filter((id) => id !== currentCard.id));
    } else {
      if (!toReviewIds.includes(currentCard.id)) {
        setToReviewIds([...toReviewIds, currentCard.id]);
      }
      setMasteredIds(masteredIds.filter((id) => id !== currentCard.id));
    }

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds([]);
    setToReviewIds([]);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-sm max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Paquet terminé !
        </h2>
        <p className="text-sm text-slate-600 mb-8">
          Vous avez parcouru l'ensemble des cartes de ce chapitre. Voici votre bilan :
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="block text-2xl font-bold text-emerald-700">
              {masteredIds.length}
            </span>
            <span className="text-xs font-medium text-emerald-600">Maîtrisées</span>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="block text-2xl font-bold text-amber-700">
              {toReviewIds.length}
            </span>
            <span className="text-xs font-medium text-amber-600">À revoir</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Recommencer la session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Barre de progression */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Carte <strong className="text-slate-900">{currentIndex + 1}</strong> sur {cards.length}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
          Progression : {Math.round(((currentIndex + 1) / cards.length) * 100)}%
        </span>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Carte Flashcard 3D */}
      <div
        onClick={handleFlip}
        className="group relative min-h-[380px] w-full cursor-pointer perspective-1000"
      >
        <div
          className={`relative h-full w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 flex flex-col justify-between ${
            isFlipped ? "ring-2 ring-red-600/30" : "hover:border-slate-300"
          }`}
        >
          {/* En-tête de la carte */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
              {currentCard.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <RotateCw className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
              {isFlipped ? "Voir la question" : "Cliquer pour retourner"}
            </span>
          </div>

          {/* Contenu Recto / Verso avec MathText */}
          <div className="py-8 text-center my-auto">
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                  Question / Énoncé
                </span>
                <p className="text-lg font-semibold text-slate-900 leading-relaxed">
                  <MathText text={currentCard.front} />
                </p>
              </div>
            ) : (
              <div className="space-y-6 text-left">
                <div>
                  <span className="text-xs uppercase tracking-wider text-red-600 font-bold block mb-1">
                    Réponse détaillée
                  </span>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    <MathText text={currentCard.back.mainAnswer} />
                  </p>
                </div>

                {currentCard.back.criticalFormula && (
                  <div className="rounded-xl bg-red-50 border-l-4 border-red-600 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Formule Critique</span>
                    </div>
                    <p className="font-mono text-sm font-bold text-slate-900">
                      <MathText text={currentCard.back.criticalFormula} />
                    </p>
                  </div>
                )}

                {currentCard.back.mnemonicOrTip && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>Astuce :</strong> <MathText text={currentCard.back.mnemonicOrTip} />
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pied de carte */}
          <div className="text-center border-t border-slate-100 pt-4 text-xs text-slate-400">
            {isFlipped ? "Évaluez votre mémorisation ci-dessous" : "Testez votre réponse mentalement avant de retourner"}
          </div>
        </div>
      </div>

      {/* Boutons d'évaluation */}
      {isFlipped ? (
        <div className="grid grid-cols-2 gap-4 animate-fade-in">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate("review");
            }}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-800 font-semibold text-sm hover:bg-amber-100 transition-colors shadow-sm"
          >
            <XCircle className="w-4 h-4 text-amber-600" />
            <span>À revoir</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRate("mastered");
            }}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Maîtrisé</span>
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={handleFlip}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RotateCw className="w-4 h-4" />
            Voir la réponse au dos
          </button>
        </div>
      )}
    </div>
  );
}