"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QcmModuleData, QcmQuestion } from "@/types/pedagogy";
import { generateDynamicQcmBank } from "@/lib/dynamic-qcm";
import { recordQcmMistake, resolveQcmMistake } from "@/lib/srs-storage";
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
  Shuffle,
  Sparkles,
} from "lucide-react";

interface QcmEngineProps {
  qcm: QcmModuleData;
}

/**
 * Mélange un tableau selon Fisher-Yates
 */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Mélange aléatoirement les 4 propositions (A, B, C, D) d'une question
 * et met à jour correctOptionId pour que la bonne réponse change toujours de place.
 */
function shuffleQuestionOptions(q: QcmQuestion): QcmQuestion {
  const letters = ["A", "B", "C", "D"];
  const rawOptions = Array.isArray(q.options) ? q.options : [];
  if (rawOptions.length === 0) return q;

  const tagged = rawOptions.map((opt: any, idx: number) => {
    const isCorrect =
      typeof opt.isCorrect === "boolean"
        ? opt.isCorrect
        : String(opt.id).toLowerCase() ===
          String(q.correctOptionId).toLowerCase();
    return {
      text: opt.text ?? opt.latex ?? "",
      isCorrect,
      origIdx: idx,
    };
  });

  const mixed = shuffleArray(tagged);
  let newCorrectId = "A";

  const newOptions = mixed.map((item, idx) => {
    const letter = letters[idx] ?? String(idx + 1);
    if (item.isCorrect) {
      newCorrectId = letter;
    }
    return {
      id: letter,
      text: item.text,
      isCorrect: item.isCorrect,
    };
  });

  return {
    ...q,
    options: newOptions as any,
    correctOptionId: newCorrectId as any,
  };
}

/**
 * Garantit qu'une formule pure (ex: keyFormula sans $) est bien entourée de $...$
 * pour que MathText la compile en KaTeX.
 */
function ensureMathDelimiters(str?: string): string {
  if (!str) return "";
  const trimmed = str.trim();
  if (trimmed.includes("$")) return trimmed;
  return `$$${trimmed}$$`;
}

export default function QcmEngine({ qcm }: QcmEngineProps) {
  const [questions, setQuestions] = useState<QcmQuestion[]>(() =>
    qcm.questions.map(shuffleQuestionOptions)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<
    Record<string, { selected: string; isCorrect: boolean }>
  >({});
  const [isFinished, setIsFinished] = useState(false);

  // Construit un paquet frais : questions statiques du chapitre + nouvelles questions à nombres aléatoires,
  // puis mélange l'ordre des questions ET l'emplacement A/B/C/D de chaque option !
  const buildFreshDeck = useCallback(() => {
    const chapterPrefix = qcm.chapterId.slice(0, 2);

    // On conserve les questions de base non-dynamiques du chapitre
    const staticBase = qcm.questions.filter(
      (q) => !String(q.id).startsWith("dyn-")
    );

    // On génère 3 séries neuves de questions calculatoires avec de nouveaux nombres aléatoires
    const freshDynamic = generateDynamicQcmBank(3)
      .filter(
        (d) =>
          d.subjectId === qcm.subject &&
          d.chapterId.slice(0, 2) === chapterPrefix
      )
      .map((d) => d.question);

    const combined = [...staticBase, ...freshDynamic].map(
      shuffleQuestionOptions
    );
    return shuffleArray(combined);
  }, [qcm]);

  // Au montage côté client, on applique un premier mélange complet pour éviter tout cache statique
  useEffect(() => {
    setQuestions(buildFreshDeck());
  }, [buildFreshDeck]);

  const currentQuestion: QcmQuestion | undefined = questions[currentIndex];
  if (!currentQuestion) return null;

  // Couleur du badge selon le niveau de difficulté
  const getDifficultyStyle = (difficulty: QcmQuestion["difficulty"] | string) => {
    switch (difficulty) {
      case "Application directe":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      case "Calculatoire":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
      case "Type Concours":
      case "Concours ATS":
      default:
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800";
    }
  };

  // Sélection et validation immédiate d'une option + synchronisation avec le Carnet d'Erreurs
  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;

    setSelectedOptionId(optionId);
    setIsSubmitted(true);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      resolveQcmMistake(currentQuestion.id);
    } else {
      const correctOpt = currentQuestion.options.find(
        (o) => o.id === currentQuestion.correctOptionId
      );
      recordQcmMistake({
        questionId: currentQuestion.id,
        subjectId: qcm.subject,
        subjectTitle: qcm.subject,
        chapterId: qcm.chapterId,
        chapterTitle: qcm.title,
        questionText: currentQuestion.questionText,
        correctAnswerText: correctOpt?.text ?? "",
        keyFormula: currentQuestion.explanation?.keyFormula,
      });
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

  // Réinitialisation complète du QCM avec nouveau mélange et nouveaux nombres aléatoires !
  const handleRestart = () => {
    setQuestions(buildFreshDeck());
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Évaluation terminée !
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Score final obtenu sur le chapitre{" "}
          <strong className="text-slate-900 dark:text-white">{qcm.title}</strong> :
        </p>

        <div className="inline-flex items-baseline gap-2 px-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
          <span className="text-4xl font-extrabold text-red-600 dark:text-red-400">
            {score} / {questions.length}
          </span>
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
            ({percentage}%)
          </span>
        </div>

        {/* Récapitulatif rapide par question */}
        <div className="text-left space-y-2 mb-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Détail de vos réponses
          </h3>
          {questions.map((q, idx) => {
            const result = answersHistory[q.id];
            return (
              <div
                key={q.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-lg">
                  <strong>Q{idx + 1}.</strong> <MathText text={q.questionText} />
                </span>
                {result?.isCorrect ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct ({result.selected})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-md shrink-0">
                    <XCircle className="w-3.5 h-3.5" /> Erreur ({result?.selected} → Rép. {q.correctOptionId})
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Nouveau tirage (Remélanger & Nouveaux nombres)</span>
        </button>
      </div>
    );
  }

  const isDynamicQuestion = String(currentQuestion.id).startsWith("dyn-");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barre de progression, bouton de remélange et score en direct */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Question{" "}
            <strong className="text-slate-900 dark:text-white">
              {currentIndex + 1}
            </strong>{" "}
            sur {questions.length}
          </span>
          <button
            type="button"
            onClick={handleRestart}
            title="Mélanger l'ordre des questions, les options A/B/C/D et tirer de nouveaux nombres"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>Remélanger & Nouveaux nombres</span>
          </button>
        </div>

        <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-mono shadow-2xs">
          Score actuel :{" "}
          <strong className="text-red-600 dark:text-red-400">{score}</strong> /{" "}
          {currentIndex + (isSubmitted ? 1 : 0)}
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Carte principale de la question */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        {/* En-tête de la question */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyStyle(
                currentQuestion.difficulty
              )}`}
            >
              {currentQuestion.difficulty}
            </span>
            {isDynamicQuestion && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-sky-950/70 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                <Sparkles className="w-3 h-3" />
                Valeurs aléatoires
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400">
            Q{currentIndex + 1}
          </span>
        </div>

        {/* Énoncé */}
        <div className="text-base md:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          <MathText text={currentQuestion.questionText} />
        </div>

        {/* Grille des 4 propositions (Mélangées aléatoirement) */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrectOption = option.id === currentQuestion.correctOptionId;

            let optionStyle =
              "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-100";

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle =
                  "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold";
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  "border-red-500 bg-red-50/90 dark:bg-red-950/50 text-red-950 dark:text-red-200 ring-2 ring-red-500/20";
              } else {
                optionStyle =
                  "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-slate-400 opacity-70";
              }
            }

            return (
              <button
                key={option.id}
                type="button"
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
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {option.id}
                  </span>
                  <span className="text-sm md:text-base">
                    <MathText text={option.text} />
                  </span>
                </div>

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

      {/* Bloc de Correction Détaillée */}
      {isSubmitted && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              {selectedOptionId === currentQuestion.correctOptionId ? (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Bonne réponse !</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
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
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ListChecks className="w-4 h-4 text-slate-400" />
              <span>Correction méthodique étape par étape</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {currentQuestion.explanation.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <MathText text={step} />
                </li>
              ))}
            </ul>
          </div>

          {/* Formule maîtresse en rouge */}
          {currentQuestion.explanation.keyFormula && (
            <div className="rounded-r-xl border-l-4 border-red-600 bg-red-50/80 dark:bg-red-950/30 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                <Flame className="w-4 h-4" />
                <span>Formule / Relation Clé utilisée</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white overflow-x-auto">
                <MathText
                  text={ensureMathDelimiters(
                    currentQuestion.explanation.keyFormula
                  )}
                />
              </div>
            </div>
          )}

          {/* Piège classique à éviter */}
          {currentQuestion.explanation.commonTrap && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-red-600 dark:text-red-400 block mb-0.5">
                  Piège classique aux concours :
                </strong>
                <MathText text={currentQuestion.explanation.commonTrap} />
              </div>
            </div>
          )}

          {/* Bouton Question Suivante */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
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