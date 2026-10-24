"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import {
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Filter,
  AlertTriangle,
  BookOpen,
  Sparkles,
} from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

interface ExamItem {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  question: {
    id: string;
    difficulty?: string;
    questionText?: string;
    question?: string;
    options: Array<{
      id: string;
      label?: string;
      text?: string;
      latex?: string;
      isCorrect?: boolean;
    }>;
    correctOptionId?: string;
    correctIndex?: number;
    explanation?: {
      steps?: string[];
      keyFormula?: string;
      commonTrap?: string;
    };
  };
}

/**
 * Rendu sécurisé du texte contenant des formules LaTeX inline ($...$) ou une formule pure
 * Ne plante JAMAIS même si KaTeX rencontre un caractère inattendu
 */
function SafeMathText({
  content,
  displayMode = false,
}: {
  content?: string;
  displayMode?: boolean;
}) {
  if (!content || typeof content !== "string") return null;

  // Si c'est une formule pure (ex: keyFormula sans délimiteurs $)
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

  // Découpage des formules inline $...$ et $$...$$
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

export default function ExamenPage() {
  const [bank, setBank] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration de la session
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);

  // État de l'examen : "setup" | "running" | "finished"
  const [status, setStatus] = useState<"setup" | "running" | "finished">("setup");
  const [sessionQuestions, setSessionQuestions] = useState<ExamItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    fetch("/api/study-data")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.qcmBank)) {
          setBank(data.qcmBank);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Chronomètre
  useEffect(() => {
    if (status !== "running") return;
    if (secondsLeft <= 0) {
      setStatus("finished");
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, secondsLeft]);

  const filteredPool = useMemo(() => {
    if (selectedSubject === "all") return bank;
    return bank.filter((item) => item.subjectId === selectedSubject);
  }, [bank, selectedSubject]);

  const startExam = () => {
    if (filteredPool.length === 0) return;
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    setSessionQuestions(picked);
    setAnswers({});
    setCurrentIndex(0);
    setSecondsLeft(durationMinutes * 60);
    setStatus("running");
  };

  const selectOption = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }));
  };

  // Vérifie si une option est la bonne réponse (compatible avec tous les formats JSON)
  const isOptionCorrect = (q: ExamItem["question"], opt: any, idx: number) => {
    if (typeof opt?.isCorrect === "boolean") return opt.isCorrect;
    if (q.correctOptionId) return opt?.id === q.correctOptionId;
    if (typeof q.correctIndex === "number") return idx === q.correctIndex;
    return false;
  };

  // Calcul sécurisé des résultats globaux et par matière
  const results = useMemo(() => {
    if (status !== "finished" || sessionQuestions.length === 0) {
      return { score: 0, total: 0, bySubject: {} as Record<string, { title: string; ok: number; total: number }> };
    }

    let score = 0;
    const bySubject: Record<string, { title: string; ok: number; total: number }> = {};

    sessionQuestions.forEach((item, qIdx) => {
      const q = item.question;
      const chosenId = answers[qIdx];
      const options = Array.isArray(q?.options) ? q.options : [];
      const correctOpt = options.find((opt, oIdx) => isOptionCorrect(q, opt, oIdx));
      const isOk = Boolean(chosenId && correctOpt && chosenId === correctOpt.id);

      if (isOk) score += 1;

      const sId = item.subjectId || "autre";
      if (!bySubject[sId]) {
        bySubject[sId] = {
          title: item.subjectTitle || sId,
          ok: 0,
          total: 0,
        };
      }
      bySubject[sId].total += 1;
      if (isOk) bySubject[sId].ok += 1;
    });

    return { score, total: sessionQuestions.length, bySubject };
  }, [status, sessionQuestions, answers]);

  const formatTime = (sec: number) => {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Chargement de la banque de sujets ATS...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* ÉCRAN 1 : CONFIGURATION DE L'EXAMEN BLANC */}
      {status === "setup" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Entraînement Chronométré
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Mode Examen Blanc & Colle ATS
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tirage aléatoire parmi l'ensemble des chapitres du programme officiel ATS 2025 avec bilan détaillé et formules critiques en fin d'épreuve.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Choix de la matière */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                Matière ciblée
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="all">Toutes les matières ({bank.length} questions)</option>
                {ATS_CURRICULUM.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de questions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nombre de questions
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={5}>5 questions (Colle rapide)</option>
                <option value={10}>10 questions (Standard)</option>
                <option value={20}>20 questions (Épreuve complète)</option>
              </select>
            </div>

            {/* Durée */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                Temps imparti
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {filteredPool.length} questions disponibles dans cette sélection
            </span>
            <button
              type="button"
              onClick={startExam}
              disabled={filteredPool.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Lancer l'Examen Blanc</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ÉCRAN 2 : PASSATION DE L'ÉPREUVE */}
      {status === "running" && sessionQuestions[currentIndex] && (
        <div className="space-y-4">
          {/* Barre supérieure de progression et chrono */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300">
                Question {currentIndex + 1} / {sessionQuestions.length}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {sessionQuestions[currentIndex].subjectTitle} —{" "}
                {sessionQuestions[currentIndex].chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                  secondsLeft < 60
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {formatTime(secondsLeft)}
              </span>

              <button
                type="button"
                onClick={() => setStatus("finished")}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>

          {/* Carte de la question active */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              <SafeMathText
                content={
                  sessionQuestions[currentIndex].question.questionText ??
                  sessionQuestions[currentIndex].question.question ??
                  ""
                }
              />
            </div>

            <div className="space-y-2.5">
              {(sessionQuestions[currentIndex].question.options ?? []).map(
                (opt, idx) => {
                  const isSelected = answers[currentIndex] === opt.id;
                  const displayContent = opt.text || opt.latex || "";
                  return (
                    <button
                      key={opt.id ?? idx}
                      type="button"
                      onClick={() => selectOption(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 dark:border-sky-400 dark:bg-sky-950/50 text-blue-950 dark:text-white font-semibold"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white dark:bg-sky-400 dark:text-slate-950"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.label ?? opt.id.toUpperCase()}
                      </span>
                      <div className="pt-0.5 leading-relaxed">
                        <SafeMathText content={displayContent} />
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {/* Navigation Précédent / Suivant */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Question précédente
              </button>

              {currentIndex < sessionQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) =>
                      Math.min(sessionQuestions.length - 1, i + 1)
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  <span>Question suivante</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStatus("finished")}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider ma copie et voir le corrigé</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÉCRAN 3 : BILAN FINAL & CORRIGÉ DÉTAILLÉ (100% BLINDÉ TOUTES MATIÈRES) */}
      {status === "finished" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  Résultat de l'épreuve
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Note obtenue : {results.score} / {results.total} (
                  {results.total > 0
                    ? Math.round((results.score / results.total) * 20)
                    : 0}
                  /20)
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setStatus("setup")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nouvel examen blanc</span>
              </button>
            </div>

            {/* Détail par matière (Supporte Français-Philosophie et toute nouvelle matière) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(results.bySubject).map(([sId, stat]) => (
                <div
                  key={sId}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {stat.title}
                  </span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-sky-900/60 dark:text-sky-300 shrink-0">
                    {stat.ok} / {stat.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Correction détaillée question par question */}
          <div className="space-y-4">
            {sessionQuestions.map((item, qIdx) => {
              const q = item.question;
              const options = Array.isArray(q?.options) ? q.options : [];
              const chosenId = answers[qIdx];
              const correctOpt = options.find((opt, oIdx) =>
                isOptionCorrect(q, opt, oIdx)
              );
              const isOk = Boolean(
                chosenId && correctOpt && chosenId === correctOpt.id
              );
              const steps = Array.isArray(q?.explanation?.steps)
                ? q.explanation!.steps
                : [];
              const keyFormula = q?.explanation?.keyFormula;
              const commonTrap = q?.explanation?.commonTrap;

              return (
                <div
                  key={`${q.id}-${qIdx}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Question {qIdx + 1} • {item.subjectTitle} ({item.chapterTitle})
                    </span>
                    {isOk ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bonne réponse
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        <XCircle className="w-3.5 h-3.5" />
                        {chosenId ? "Réponse incorrecte" : "Non répondue"}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    <SafeMathText
                      content={q.questionText ?? q.question ?? ""}
                    />
                  </div>

                  {/* Réponse de l'étudiant vs Bonne réponse */}
                  <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        Réponse exacte :{" "}
                      </span>
                      <SafeMathText
                        content={correctOpt?.text || correctOpt?.latex || ""}
                      />
                    </div>
                  </div>

                  {/* Démarche de résolution */}
                  {steps.length > 0 && (
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        Démonstration & Méthode :
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {steps.map((step, sIdx) => (
                          <li key={sIdx}>
                            <SafeMathText content={step} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formule critique en rouge sémantique */}
                  {keyFormula && (
                    <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/25 p-3.5 text-xs">
                      <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                        Formule / Règle critique à retenir :
                      </span>
                      <div className="text-slate-900 dark:text-slate-100 overflow-x-auto">
                        <SafeMathText content={keyFormula} displayMode />
                      </div>
                    </div>
                  )}

                  {/* Piège classique éventuel */}
                  {commonTrap && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/25 p-3 text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Piège classique : </span>
                        <SafeMathText content={commonTrap} />
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/${item.subjectId}/${item.chapterId}/cours`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Revoir le cours de ce chapitre</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}