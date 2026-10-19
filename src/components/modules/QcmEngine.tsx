"use client";

import React, { useState } from "react";
import { QcmModuleData, QcmQuestion } from "@/types/pedagogy";
import MathText from "@/components/mdx/MathText";
import {
  CheckCircle2,
  XCircle,
  Flame,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Trophy,
  ListChecks,
} from "lucide-react";

interface QcmEngineProps {
  qcm: QcmModuleData;
}

export default function QcmEngine({ qcm }: QcmEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<
    Record<string, { selected: string; isCorrect: boolean }>
  >({});
  const [isFinished, setIsFinished] = useState(false);

  const questions = qcm.questions;
  const currentQuestion: QcmQuestion = questions[currentIndex];

  // Couleur du badge selon le niveau de difficulté
  const getDifficultyStyle = (difficulty: QcmQuestion["difficulty"]) => {
    switch (difficulty) {
      case "Application directe":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Calculatoire":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Type Concours":
        return "bg-red-50 text-red-600 border-red-200";
    }
  };

  // Sélection et validation immédiate d'une option
  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;

    setSelectedOptionId(optionId);
    setIsSubmitted(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswersHistory((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: optionId, isCorrect },
    }));
  };

  // Passage à la question suivante
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  // Réinitialisation complète du QCM
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setScore(0);
    setAnswersHistory({});
    setIsFinished(false);
  };

  // Écran de bilan final
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Évaluation terminée !
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Score final obtenu sur le chapitre{" "}
          <strong className="text-slate-900">{qcm.title}</strong> :
        </p>

        <div className="inline-flex items-baseline gap-2 px-8 py-4 rounded-2xl bg-slate-50 border border-slate-200 mb-8">
          <span className="text-4xl font-extrabold text-red-600">
            {score} / {questions.length}
          </span>
          <span className="text-sm font-mono text-slate-500">
            ({percentage}%)
          </span>
        </div>

        {/* Récapitulatif rapide par question */}
        <div className="text-left space-y-2 mb-8 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Détail de vos réponses
          </h3>
          {questions.map((q, idx) => {
            const result = answersHistory[q.id];
            return (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <span className="font-medium text-slate-700 truncate max-w-lg">
                  <strong>Q{idx + 1}.</strong> <MathText text={q.questionText} />
                </span>
                {result?.isCorrect ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct ({result.selected})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md shrink-0">
                    <XCircle className="w-3.5 h-3.5" /> Erreur ({result?.selected} → Rép. {q.correctOptionId})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Recommencer le QCM
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barre de progression et score en direct */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Question <strong className="text-slate-900">{currentIndex + 1}</strong> sur{" "}
          {questions.length}
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-mono shadow-2xs">
          Score actuel : <strong className="text-red-600">{score}</strong> / {currentIndex + (isSubmitted ? 1 : 0)}
        </span>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Carte principale de la question */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        {/* En-tête de la question */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyStyle(
              currentQuestion.difficulty
            )}`}
          >
            {currentQuestion.difficulty}
          </span>
          <span className="text-xs font-mono text-slate-400">
            ID : {currentQuestion.id}
          </span>
        </div>

        {/* Énoncé */}
        <div className="text-base md:text-lg font-semibold text-slate-900 leading-relaxed">
          <MathText text={currentQuestion.questionText} />
        </div>

        {/* Grille des 4 propositions */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;

            // Style dynamique selon l'état de validation
            let optionStyle =
              "border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 text-slate-800";

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle =
                  "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 font-semibold";
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  "border-red-500 bg-red-50/90 text-red-950 ring-2 ring-red-500/20";
              } else {
                optionStyle = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-70";
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={isSubmitted}
                className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-all ${optionStyle} ${
                  !isSubmitted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSubmitted && isCorrectOption
                        ? "bg-emerald-600 text-white"
                        : isSubmitted && isSelected && !isCorrectOption
                        ? "bg-red-600 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className="text-sm md:text-base">
                    <MathText text={option.text} />
                  </span>
                </div>

                {/* Icône de statut après réponse */}
                {isSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloc de Correction Détaillée (Affiché immédiatement après validation) */}
      {isSubmitted && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              {selectedOptionId === currentQuestion.correctOptionId ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Bonne réponse !</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                  <XCircle className="w-5 h-5" />
                  <span>
                    Réponse incorrecte — La bonne réponse était la proposition{" "}
                    {currentQuestion.correctOptionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Étapes de résolution pas-à-pas */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ListChecks className="w-4 h-4 text-slate-400" />
              <span>Correction méthodique étape par étape</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {currentQuestion.explanation.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <MathText text={step} />
                </li>
              ))}
            </ul>
          </div>

          {/* Formule maîtresse en rouge (selon les directives UI/UX) */}
          <div className="rounded-r-xl border-l-4 border-red-600 bg-red-50/80 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
              <Flame className="w-4 h-4" />
              <span>Formule / Relation Clé utilisée</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              <MathText text={currentQuestion.explanation.keyFormula} />
            </div>
          </div>

          {/* Piège classique à éviter */}
          {currentQuestion.explanation.commonTrap && (
            <div className="rounded-xl border border-red-200 bg-white p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-red-600 block mb-0.5">
                  Piège classique aux concours :
                </strong>
                <MathText text={currentQuestion.explanation.commonTrap} />
              </div>
            </div>
          )}

          {/* Bouton Question Suivante */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <span>
                {currentIndex < questions.length - 1
                  ? "Question suivante"
                  : "Voir le bilan final"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}