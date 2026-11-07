"use client";

import { generateDynamicQcmBank } from "@/lib/dynamic-qcm";
import { recordQcmMistake } from "@/lib/srs-storage";
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
  PieChart,
  BarChart3,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Flag,
  Sliders,
  Timer,
  Award,
  Target,
  MinusCircle,
} from "lucide-react";
import MathText from "@/components/mdx/MathText";
import "katex/dist/katex.min.css";

interface ExamOption {
  id: string;
  label?: string;
  text?: string;
  latex?: string;
  isCorrect?: boolean;
}

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
    options: ExamOption[];
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
 * Camembert / Donut Chart vectoriel SVG natif (sans librairie externe)
 */
function ExamDonutChart({
  correct,
  wrong,
  unanswered,
  score20,
}: {
  correct: number;
  wrong: number;
  unanswered: number;
  score20: number;
}) {
  const total = Math.max(1, correct + wrong + unanswered);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    {
      label: "Bonnes rÃ©ponses",
      value: correct,
      pct: Math.round((correct / total) * 100),
      stroke: "#10b981", // emerald-500
      dotClass: "bg-emerald-500",
    },
    {
      label: "RÃ©ponses fausses",
      value: wrong,
      pct: Math.round((wrong / total) * 100),
      stroke: "#ef4444", // red-500
      dotClass: "bg-red-500",
    },
    {
      label: "Omissions (Non rÃ©pondues)",
      value: unanswered,
      pct: Math.round((unanswered / total) * 100),
      stroke: "#94a3b8", // slate-400
      dotClass: "bg-slate-400",
    },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="18"
            className="text-slate-100 dark:text-slate-800"
          />
          {segments.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const frac = seg.value / total;
            const dashLength = frac * circumference;
            const dashOffset = -accumulatedPercent * circumference;
            accumulatedPercent += frac;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.stroke}
                strokeWidth="18"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Note / 20
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {score20.toFixed(1)}
          </span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-sky-400">
            {Math.round((correct / total) * 100)}% rÃ©ussite
          </span>
        </div>
      </div>

      {/* LÃ©gende dÃ©taillÃ©e du camembert */}
      <div className="flex-1 w-full space-y-2.5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full shrink-0 ${seg.dotClass}`} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {seg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                {seg.value}
              </span>
              <span className="text-slate-400">({seg.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExamenPage() {
  const [bank, setBank] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================================================================
  // 1. PARAMÃˆTRES AVANCÃ‰S DE CONFIGURATION
  // =========================================================================
  // ClÃ©s de chapitres sÃ©lectionnÃ©s sous la forme `${subjectId}/${chapterId}`
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
    new Set()
  );
  // AccordÃ©ons ouverts pour choisir les thÃ¨mes d'une matiÃ¨re
  const [expandedSubjects, setExpandedSubjects] = useState<
    Record<string, boolean>
  >({
    "physique-chimie": true,
    mathematiques: true,
  });

  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [scoringMode, setScoringMode] = useState<"standard" | "strict">(
    "standard"
  );
  const [feedbackMode, setFeedbackMode] = useState<"end" | "instant">("end");
  const [shuffleChoices, setShuffleChoices] = useState<boolean>(false);

  // =========================================================================
  // 2. Ã‰TATS DE LA SESSION D'EXAMEN
  // =========================================================================
  const [status, setStatus] = useState<"setup" | "running" | "finished">(
    "setup"
  );
  const [sessionQuestions, setSessionQuestions] = useState<ExamItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Filtre du corrigÃ© final : "all" | "wrong" | "unanswered" | "flagged"
  const [correctionFilter, setCorrectionFilter] = useState<
    "all" | "wrong" | "unanswered" | "flagged"
  >("all");

  // Chargement initial de la banque et sÃ©lection de tous les chapitres par dÃ©faut
  useEffect(() => {
    const allKeys = new Set<string>();
    ATS_CURRICULUM.forEach((subj) => {
      subj.chapters.forEach((ch) => {
        allKeys.add(`${subj.id}/${ch.id}`);
      });
    });
    setSelectedChapters(allKeys);

    fetch("/api/study-data")
      .then((res) => res.json())
      .then((data) => {
        const staticBank = Array.isArray(data?.qcmBank) ? data.qcmBank : [];
        const dynamicBank = generateDynamicQcmBank(2); // GÃ©nÃ¨re 16 QCM Ã  nombres alÃ©atoires !
        setBank([...dynamicBank, ...staticBank]);
      })
      .catch(() => {
        setBank(generateDynamicQcmBank(2));
      })
      .finally(() => setLoading(false));
  }, []);

  // ChronomÃ¨tre (avec mode illimitÃ© si durationMinutes === 0)
  useEffect(() => {
    if (status !== "running") return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (durationMinutes > 0) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setStatus("finished");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, durationMinutes]);

  // Enregistrement des erreurs au carnet quand l'examen se termine
  useEffect(() => {
    if (status !== "finished") return;
    sessionQuestions.forEach((item, qIdx) => {
      const q = item.question;
      const chosenId = answers[qIdx];
      const options = Array.isArray(q?.options) ? q.options : [];
      const correctOpt = options.find((opt: any, oIdx: number) =>
        isOptionCorrect(q, opt, oIdx)
      );
      const isOk = Boolean(
        chosenId && correctOpt && chosenId === correctOpt.id
      );
      if (!isOk && correctOpt) {
        recordQcmMistake({
          questionId: q.id,
          subjectId: item.subjectId,
          subjectTitle: item.subjectTitle,
          chapterId: item.chapterId,
          chapterTitle: `${item.chapterNumber}. ${item.chapterTitle}`,
          questionText: q.questionText ?? q.question ?? "",
          correctAnswerText: correctOpt.text || correctOpt.latex || "",
          keyFormula: q.explanation?.keyFormula,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Comptage du nombre de questions disponibles par chapitre et par matiÃ¨re
  const countByChapterKey = useMemo(() => {
    const counts: Record<string, number> = {};
    bank.forEach((item) => {
      const key = `${item.subjectId}/${item.chapterId}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [bank]);

  // Pool filtrÃ© selon les thÃ¨mes cochÃ©s par l'Ã©tudiant
  const filteredPool = useMemo(() => {
    return bank.filter((item) =>
      selectedChapters.has(`${item.subjectId}/${item.chapterId}`)
    );
  }, [bank, selectedChapters]);

  // Helpers de sÃ©lection des thÃ¨mes
  const toggleChapter = (subjectId: string, chapterId: string) => {
    const key = `${subjectId}/${chapterId}`;
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleWholeSubject = (subjectId: string) => {
    const subj = ATS_CURRICULUM.find((s) => s.id === subjectId);
    if (!subj) return;
    const keys = subj.chapters.map((c) => `${subjectId}/${c.id}`);
    const allSelected = keys.every((k) => selectedChapters.has(k));

    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        keys.forEach((k) => next.delete(k));
      } else {
        keys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const selectByPreset = (mode: "all" | "none" | "s1" | "s2") => {
    const next = new Set<string>();
    if (mode !== "none") {
      ATS_CURRICULUM.forEach((subj) => {
        subj.chapters.forEach((ch) => {
          if (
            mode === "all" ||
            (mode === "s1" && (ch.semester ?? 1) === 1) ||
            (mode === "s2" && ch.semester === 2)
          ) {
            next.add(`${subj.id}/${ch.id}`);
          }
        });
      });
    }
    setSelectedChapters(next);
  };

  // DÃ©marrage de l'examen blanc
  const startExam = () => {
    // 1. GÃ©nÃ¨re un nouveau jeu de questions Ã  nombres alÃ©atoires
    const freshDynamic = generateDynamicQcmBank(2);
    const staticOnly = bank.filter((item) => !(item as any).isDynamic);
    const updatedBank = [...freshDynamic, ...staticOnly];
    setBank(updatedBank);

    // 2. Ne garde que les questions des thÃ¨mes cochÃ©s par l'utilisateur
    const activePool = updatedBank.filter((item) =>
      selectedChapters.has(`${item.subjectId}/${item.chapterId}`)
    );
    if (activePool.length === 0) return;

    // 3. MÃ©lange les questions et applique la limite choisie (ex: 10 questions)
    const shuffled = [...activePool].sort(() => Math.random() - 0.5);
    const limit =
      questionCount === 0
        ? shuffled.length
        : Math.min(questionCount, shuffled.length);

    const picked = shuffled.slice(0, limit).map((item) => {
      if (!shuffleChoices || !Array.isArray(item.question.options)) {
        return item;
      }
      const letters = ["A", "B", "C", "D", "E", "F"];
      const mixedOptions = [...item.question.options]
        .sort(() => Math.random() - 0.5)
        .map((opt: any, idx) => ({
          ...opt,
          label: letters[idx] ?? opt.label ?? opt.id?.toUpperCase(),
        }));
      return {
        ...item,
        question: {
          ...item.question,
          options: mixedOptions,
        },
      };
    });

    // 4. RÃ©initialise et dÃ©marre la session
    setSessionQuestions(picked);
    setAnswers({});
    setFlagged({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setSecondsLeft(durationMinutes * 60);
    setCorrectionFilter("all");
    setStatus("running");
  };

  const isOptionCorrect = (q: ExamItem["question"], opt: any, idx: number) => {
    if (typeof opt?.isCorrect === "boolean") return opt.isCorrect;
    if (q.correctOptionId) return opt?.id === q.correctOptionId;
    if (typeof q.correctIndex === "number") return idx === q.correctIndex;
    return false;
  };

  // =========================================================================
  // 3. ANALYSE STATISTIQUE COMPLÃˆTE EN FIN D'Ã‰PREUVE
  // =========================================================================
  const results = useMemo(() => {
    if (sessionQuestions.length === 0) {
      return {
        correct: 0,
        wrong: 0,
        unanswered: 0,
        total: 0,
        rawPoints: 0,
        score20: 0,
        bySubject: {} as Record<
          string,
          {
            title: string;
            correct: number;
            wrong: number;
            unanswered: number;
            total: number;
          }
        >,
        byChapter: {} as Record<
          string,
          {
            subjectId: string;
            subjectTitle: string;
            chapterId: string;
            chapterTitle: string;
            correct: number;
            wrong: number;
            unanswered: number;
            total: number;
          }
        >,
      };
    }

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const bySubject: Record<
      string,
      {
        title: string;
        correct: number;
        wrong: number;
        unanswered: number;
        total: number;
      }
    > = {};

    const byChapter: Record<
      string,
      {
        subjectId: string;
        subjectTitle: string;
        chapterId: string;
        chapterTitle: string;
        correct: number;
        wrong: number;
        unanswered: number;
        total: number;
      }
    > = {};

    sessionQuestions.forEach((item, qIdx) => {
      const q = item.question;
      const chosenId = answers[qIdx];
      const options = Array.isArray(q?.options) ? q.options : [];
      const correctOpt = options.find((opt, oIdx) =>
        isOptionCorrect(q, opt, oIdx)
      );

      const isUnanswered = !chosenId;
      const isOk = Boolean(
        !isUnanswered && correctOpt && chosenId === correctOpt.id
      );

      if (isUnanswered) unanswered += 1;
      else if (isOk) correct += 1;
      else wrong += 1;

      const sId = item.subjectId || "autre";
      if (!bySubject[sId]) {
        bySubject[sId] = {
          title: item.subjectTitle || sId,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          total: 0,
        };
      }
      bySubject[sId].total += 1;
      if (isUnanswered) bySubject[sId].unanswered += 1;
      else if (isOk) bySubject[sId].correct += 1;
      else bySubject[sId].wrong += 1;

      const cKey = `${item.subjectId}/${item.chapterId}`;
      if (!byChapter[cKey]) {
        byChapter[cKey] = {
          subjectId: item.subjectId,
          subjectTitle: item.subjectTitle,
          chapterId: item.chapterId,
          chapterTitle: `${item.chapterNumber}. ${item.chapterTitle}`,
          correct: 0,
          wrong: 0,
          unanswered: 0,
          total: 0,
        };
      }
      byChapter[cKey].total += 1;
      if (isUnanswered) byChapter[cKey].unanswered += 1;
      else if (isOk) byChapter[cKey].correct += 1;
      else byChapter[cKey].wrong += 1;
    });

    const total = sessionQuestions.length;
    const rawPoints =
      scoringMode === "strict"
        ? Math.max(0, correct - wrong * 0.25)
        : correct;
    const score20 = total > 0 ? (rawPoints / total) * 20 : 0;

    return {
      correct,
      wrong,
      unanswered,
      total,
      rawPoints,
      score20,
      bySubject,
      byChapter,
    };
  }, [sessionQuestions, answers, scoringMode]);

  const formatTime = (sec: number) => {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Chargement de la banque de sujets et des thÃ¨mes ATS...
        </div>
      </div>
    );
  }

  const currentItem = sessionQuestions[currentIndex];
  const currentChosenId = answers[currentIndex];
  const showInstantFeedback =
    feedbackMode === "instant" && Boolean(currentChosenId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* =====================================================================
          Ã‰CRAN 1 : CONFIGURATION SUR MESURE (THÃˆMES + PARAMÃˆTRES D'Ã‰PREUVE)
         ===================================================================== */}
      {status === "setup" && (
        <div className="space-y-6">
          {/* En-tÃªte */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                    Simulateur d'Ã‰preuve sur Mesure
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Configurateur d'Examen Blanc & Colle ATS
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    SÃ©lectionnez prÃ©cisÃ©ment vos matiÃ¨res et vos chapitres, configurez le barÃ¨me et analysez vos rÃ©sultats par thÃ¨me.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 bg-blue-50/70 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-900 px-4 py-3 rounded-xl">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-sky-300">
                  Banque sÃ©lectionnÃ©e
                </span>
                <span className="text-xl font-extrabold font-mono text-blue-900 dark:text-white">
                  {filteredPool.length} questions
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  sur {selectedChapters.size} chapitres cochÃ©s
                </span>
              </div>
            </div>
          </div>

          {/* BLOC A : SÃ‰LECTION DES MATIÃˆRES ET DES THÃˆMES (CHAPITRES) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Programme de rÃ©vision : MatiÃ¨res & Chapitres
                </h2>
              </div>

              {/* Boutons de sÃ©lection rapide par semestre */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectByPreset("all")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Tout cocher
                </button>
                <button
                  type="button"
                  onClick={() => selectByPreset("s1")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 cursor-pointer"
                >
                  Semestre 1 uniquement
                </button>
                <button
                  type="button"
                  onClick={() => selectByPreset("s2")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 cursor-pointer"
                >
                  Semestre 2 uniquement
                </button>
                <button
                  type="button"
                  onClick={() => selectByPreset("none")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 cursor-pointer"
                >
                  Tout dÃ©cocher
                </button>
              </div>
            </div>

            {/* Liste des matiÃ¨res avec accordÃ©on des thÃ¨mes */}
            <div className="space-y-3">
              {ATS_CURRICULUM.map((subj) => {
                const chapterKeys = subj.chapters.map(
                  (c) => `${subj.id}/${c.id}`
                );
                const selectedInSubj = chapterKeys.filter((k) =>
                  selectedChapters.has(k)
                ).length;
                const allChecked =
                  selectedInSubj === chapterKeys.length &&
                  chapterKeys.length > 0;
                const isExpanded = Boolean(expandedSubjects[subj.id]);

                const questionsInSubj = chapterKeys.reduce(
                  (acc, k) => acc + (countByChapterKey[k] || 0),
                  0
                );

                return (
                  <div
                    key={subj.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    {/* Barre de la matiÃ¨re */}
                    <div className="bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleWholeSubject(subj.id)}
                        className="flex items-center gap-3 text-left cursor-pointer"
                      >
                        {allChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {subj.title}
                          </span>
                          <span className="ml-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                            ({selectedInSubj}/{subj.chapters.length} thÃ¨mes â€¢{" "}
                            {questionsInSubj} QCM)
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSubjects((prev) => ({
                            ...prev,
                            [subj.id]: !prev[subj.id],
                          }))
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer shrink-0"
                      >
                        <span>
                          {isExpanded ? "Masquer les thÃ¨mes" : "Choisir les thÃ¨mes"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Grille des chapitres (ThÃ¨mes) de la matiÃ¨re */}
                    {isExpanded && (
                      <div className="p-3 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subj.chapters.map((ch) => {
                          const key = `${subj.id}/${ch.id}`;
                          const checked = selectedChapters.has(key);
                          const qCount = countByChapterKey[key] || 0;

                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => toggleChapter(subj.id, ch.id)}
                              className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                checked
                                  ? "border-blue-500/60 bg-blue-50/40 dark:border-sky-500/50 dark:bg-sky-950/30"
                                  : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                {checked ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <div className="text-xs leading-snug">
                                  <span className="font-mono font-bold text-blue-600 dark:text-sky-400 mr-1">
                                    {ch.number}.
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {ch.title}
                                  </span>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                                {qCount} Q
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* BLOC B : PARAMÃˆTRES AVANCÃ‰S DE L'Ã‰PREUVE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                2. ParamÃ¨tres & ModalitÃ©s de l'Ã©preuve
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Nombre de questions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Nombre de questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value={5}>5 questions (Flash)</option>
                  <option value={10}>10 questions (Colle)</option>
                  <option value={15}>15 questions (Demi-DS)</option>
                  <option value={20}>20 questions (Concours)</option>
                  <option value={30}>30 questions (Marathon)</option>
                  <option value={0}>
                    Toutes les questions ({filteredPool.length})
                  </option>
                </select>
              </div>

              {/* Temps imparti */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  ChronomÃ¨tre
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value={5}>5 minutes (Sprint)</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes (Standard)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={0}>Sans limite de temps</option>
                </select>
              </div>

              {/* BarÃ¨me de notation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  BarÃ¨me de notation
                </label>
                <select
                  value={scoringMode}
                  onChange={(e) =>
                    setScoringMode(e.target.value as "standard" | "strict")
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="standard">Standard (+1 pt / 0 pt)</option>
                  <option value="strict">
                    Concours strict (+1 / -0,25 erreur / 0 omission)
                  </option>
                </select>
              </div>

              {/* Mode de correction */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Affichage des corrections
                </label>
                <select
                  value={feedbackMode}
                  onChange={(e) =>
                    setFeedbackMode(e.target.value as "end" | "instant")
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="end">En fin d'Ã©preuve (Conditions examen)</option>
                  <option value="instant">
                    ImmÃ©diat aprÃ¨s chaque rÃ©ponse (EntraÃ®nement)
                  </option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleChoices}
                  onChange={(e) => setShuffleChoices(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>MÃ©langer alÃ©atoirement l'ordre des rÃ©ponses (A, B, C, D)</span>
              </label>

              <button
                type="button"
                onClick={startExam}
                disabled={filteredPool.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <span>
                  Lancer l'Ã©preuve (
                  {questionCount === 0
                    ? filteredPool.length
                    : Math.min(questionCount, filteredPool.length)}{" "}
                  questions)
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          Ã‰CRAN 2 : PASSATION DE L'Ã‰PREUVE (AVEC GRILLE DE NAVIGATION & DRAPEAU)
         ===================================================================== */}
      {status === "running" && currentItem && (
        <div className="space-y-4">
          {/* Barre supÃ©rieure */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300">
                Q {currentIndex + 1} / {sessionQuestions.length}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
                {currentItem.subjectTitle} â€” {currentItem.chapterNumber}.{" "}
                {currentItem.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Bouton Drapeau (Ã€ revoir) */}
              <button
                type="button"
                onClick={() =>
                  setFlagged((prev) => ({
                    ...prev,
                    [currentIndex]: !prev[currentIndex],
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  flagged[currentIndex]
                    ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentIndex] ? "MarquÃ©e" : "Marquer"}</span>
              </button>

              {/* ChronomÃ¨tre */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold ${
                  durationMinutes > 0 && secondsLeft < 60
                    ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {durationMinutes > 0
                  ? formatTime(secondsLeft)
                  : formatTime(elapsedSeconds)}
              </span>

              <button
                type="button"
                onClick={() => setStatus("finished")}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Rendre ma copie
              </button>
            </div>
          </div>

          {/* Grille de navigation rapide par numÃ©ro de question */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center gap-1.5">
            {sessionQuestions.map((_, idx) => {
              const isAnswered = Boolean(answers[idx]);
              const isCurrent = idx === currentIndex;
              const isFlagged = Boolean(flagged[idx]);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                    isCurrent
                      ? "ring-2 ring-blue-600 dark:ring-sky-400 bg-blue-600 text-white"
                      : isAnswered
                      ? "bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Carte de la question active */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              <MathText
                content={
                  currentItem.question.questionText ??
                  currentItem.question.question ??
                  ""
                }
              />
            </div>

            <div className="space-y-2.5">
              {(currentItem.question.options ?? []).map((opt, idx) => {
                const isSelected = currentChosenId === opt.id;
                const isRight = isOptionCorrect(currentItem.question, opt, idx);
                const displayContent = opt.text || opt.latex || "";

                let cardStyle =
                  "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200";
                if (showInstantFeedback) {
                  if (isRight) {
                    cardStyle =
                      "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-semibold";
                  } else if (isSelected) {
                    cardStyle =
                      "border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-950 dark:text-red-200 font-semibold";
                  }
                } else if (isSelected) {
                  cardStyle =
                    "border-blue-600 bg-blue-50/70 dark:border-sky-400 dark:bg-sky-950/50 text-blue-950 dark:text-white font-semibold";
                }

                return (
                  <button
                    key={opt.id ?? idx}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentIndex]:
                          prev[currentIndex] === opt.id ? "" : opt.id,
                      }))
                    }
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${cardStyle}`}
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
                    <div className="pt-0.5 leading-relaxed flex-1">
                      <MathText content={displayContent} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explication immÃ©diate si le mode EntraÃ®nement est activÃ© */}
            {showInstantFeedback && currentItem.question.explanation && (
              <div className="rounded-xl border border-blue-200 dark:border-sky-900 bg-blue-50/40 dark:bg-sky-950/30 p-4 space-y-2 text-xs">
                <div className="font-bold text-blue-900 dark:text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Correction immÃ©diate :
                </div>
                {Array.isArray(currentItem.question.explanation.steps) && (
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {currentItem.question.explanation.steps.map((st, sIdx) => (
                      <li key={sIdx}>
                        <MathText content={st} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Navigation bas de carte */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Question prÃ©cÃ©dente
              </button>

              <span className="text-[11px] text-slate-400">
                Astuce : cliquez Ã  nouveau sur une rÃ©ponse pour l'annuler (omission)
              </span>

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
                  <span>Valider et afficher le bilan analytique</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          Ã‰CRAN 3 : BILAN ANALYTIQUE AVEC CAMEMBERT, BARRES PAR THÃˆME & CORRIGÃ‰
         ===================================================================== */}
      {status === "finished" && (
        <div className="space-y-6">
          {/* Carte principale : Camembert + Indicateurs ClÃ©s */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                    Rapport Analytique de Fin d'Ã‰preuve
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    SynthÃ¨se de performance & RÃ©partition
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startExam}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retenter ce tirage</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("setup")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Modifier les thÃ¨mes</span>
                </button>
              </div>
            </div>

            {/* Grille Camembert + 3 KPI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7">
                <ExamDonutChart
                  correct={results.correct}
                  wrong={results.wrong}
                  unanswered={results.unanswered}
                  score20={results.score20}
                />
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Award className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    Score brut
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {results.rawPoints} / {results.total}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {scoringMode === "strict"
                      ? "BarÃ¨me strict (-0,25/erreur)"
                      : "BarÃ¨me standard (+1/0)"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Timer className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                    Cadence moyenne
                  </div>
                  <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
                    {results.total > 0
                      ? Math.round(elapsedSeconds / results.total)
                      : 0}
                    s / Q
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    DurÃ©e totale : {formatTime(elapsedSeconds)}
                  </div>
                </div>

                <div className="col-span-2 p-4 rounded-xl bg-blue-50/60 dark:bg-sky-950/40 border border-blue-200/80 dark:border-sky-900">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-sky-300">
                    <Target className="w-4 h-4" />
                    ApprÃ©ciation du jury ATS :
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {results.score20 >= 16
                      ? "Excellente maÃ®trise thÃ©orique et opÃ©ratoire. Vous Ãªtes au niveau des meilleures Ã©coles du concours ATS."
                      : results.score20 >= 12
                      ? "Bon socle de connaissances. Consolidez les formules critiques des chapitres signalÃ©s ci-dessous pour viser le top 100."
                      : results.score20 >= 8
                      ? "Ensemble fragile : reprenez les fiches synthÃ¨ses des chapitres oÃ¹ le taux de rÃ©ussite est infÃ©rieur Ã  50 %."
                      : "Attention : des rÃ©visions prioritaires du cours et des flashcards s'imposent sur les thÃ¨mes sÃ©lectionnÃ©s."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ANALYSE DÃ‰TAILLÃ‰E PAR MATIÃˆRE ET PAR THÃˆME (CHAPITRE) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance par MatiÃ¨re */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  MaÃ®trise par MatiÃ¨re
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(results.bySubject).map(([sId, stat]) => {
                  const pct =
                    stat.total > 0
                      ? Math.round((stat.correct / stat.total) * 100)
                      : 0;
                  return (
                    <div key={sId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {stat.title}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {stat.correct}/{stat.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                        <div
                          style={{
                            width: `${(stat.correct / stat.total) * 100}%`,
                          }}
                          className="bg-emerald-500 h-full"
                        />
                        <div
                          style={{
                            width: `${(stat.wrong / stat.total) * 100}%`,
                          }}
                          className="bg-red-500 h-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance par Chapitre (ThÃ¨me) + Recommandations */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  DÃ©tail par ThÃ¨me & RÃ©visions ciblÃ©es
                </h3>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {Object.entries(results.byChapter).map(([cKey, cStat]) => {
                  const pct =
                    cStat.total > 0
                      ? Math.round((cStat.correct / cStat.total) * 100)
                      : 0;
                  const needsReview = pct < 60;

                  return (
                    <div
                      key={cKey}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {cStat.chapterTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{cStat.subjectTitle}</span>
                          {needsReview && (
                            <Link
                              href={`/${cStat.subjectId}/${cStat.chapterId}/synthese`}
                              className="text-red-600 dark:text-red-400 font-bold hover:underline"
                            >
                              â†’ Revoir la fiche synthÃ¨se
                            </Link>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold shrink-0 ${
                          pct >= 75
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : pct >= 50
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                        }`}
                      >
                        {cStat.correct}/{cStat.total} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FILTRE DU CORRIGÃ‰ DÃ‰TAILLÃ‰ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              CorrigÃ© dÃ©taillÃ© pas-Ã -pas :
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCorrectionFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  correctionFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Toutes ({results.total})
              </button>
              <button
                type="button"
                onClick={() => setCorrectionFilter("wrong")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  correctionFilter === "wrong"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Mes erreurs ({results.wrong})
              </button>
              <button
                type="button"
                onClick={() => setCorrectionFilter("unanswered")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  correctionFilter === "unanswered"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Omissions ({results.unanswered})
              </button>
            </div>
          </div>

          {/* LISTE DES CORRECTIONS DÃ‰TAILLÃ‰ES */}
          <div className="space-y-4">
            {sessionQuestions.map((item, qIdx) => {
              const q = item.question;
              const options = Array.isArray(q?.options) ? q.options : [];
              const chosenId = answers[qIdx];
              const correctOpt = options.find((opt, oIdx) =>
                isOptionCorrect(q, opt, oIdx)
              );
              const chosenOpt = options.find((opt) => opt.id === chosenId);
              const isUnanswered = !chosenId;
              const isOk = Boolean(
                !isUnanswered && correctOpt && chosenId === correctOpt.id
              );

              if (correctionFilter === "wrong" && (isOk || isUnanswered)) {
                return null;
              }
              if (correctionFilter === "unanswered" && !isUnanswered) {
                return null;
              }

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
                      Question {qIdx + 1} â€¢ {item.subjectTitle} (
                      {item.chapterNumber}. {item.chapterTitle})
                    </span>
                    {isOk ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Exact (+1 pt)
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <MinusCircle className="w-3.5 h-3.5" />
                        Omission (0 pt)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        <XCircle className="w-3.5 h-3.5" />
                        Erreur ({scoringMode === "strict" ? "-0,25 pt" : "0 pt"})
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    <MathText
                      content={q.questionText ?? q.question ?? ""}
                    />
                  </div>

                  {/* Comparaison RÃ©ponse choisie vs Bonne rÃ©ponse */}
                  <div className="text-xs space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {!isOk && chosenOpt && (
                      <div className="text-red-700 dark:text-red-400">
                        <span className="font-bold">Votre rÃ©ponse : </span>
                        <MathText
                          content={chosenOpt.text || chosenOpt.latex || ""}
                        />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        RÃ©ponse exacte :{" "}
                      </span>
                      <MathText
                        content={correctOpt?.text || correctOpt?.latex || ""}
                      />
                    </div>
                  </div>

                  {/* DÃ©marche de rÃ©solution */}
                  {steps.length > 0 && (
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                        DÃ©monstration & MÃ©thode :
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {steps.map((step, sIdx) => (
                          <li key={sIdx}>
                            <MathText content={step} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Formule critique en rouge sÃ©mantique */}
                  {keyFormula && (
                    <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/25 p-3.5 text-xs">
                      <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                        Formule / RÃ¨gle critique Ã  retenir :
                      </span>
                      <div className="text-slate-900 dark:text-slate-100 overflow-x-auto">
                        <MathText content={keyFormula} displayMode />
                      </div>
                    </div>
                  )}

                  {/* PiÃ¨ge classique Ã©ventuel */}
                  {commonTrap && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/25 p-3 text-xs flex items-start gap-2 text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">PiÃ¨ge classique : </span>
                        <MathText content={commonTrap} />
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end gap-4">
                    <Link
                      href={`/${item.subjectId}/${item.chapterId}/synthese`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline"
                    >
                      <span>Fiche SynthÃ¨se</span>
                    </Link>
                    <Link
                      href={`/${item.subjectId}/${item.chapterId}/cours`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Revoir le cours complet</span>
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
