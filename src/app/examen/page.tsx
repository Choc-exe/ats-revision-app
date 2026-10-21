"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import MathText from "@/components/mdx/MathText";
import {
  Clock,
  CheckSquare,
  Square,
  Play,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  PieChart,
  ArrowRight,
  Flame,
} from "lucide-react";

interface BankItem {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  question: {
    id: string;
    difficulty: "Application directe" | "Calculatoire" | "Type Concours";
    questionText: string;
    options: Array<{ id: "A" | "B" | "C" | "D"; text: string }>;
    correctOptionId: "A" | "B" | "C" | "D";
    explanation: {
      steps: string[];
      keyFormula: string;
      commonTrap?: string;
    };
  };
}

/**
 * Composant Camembert / Donut SVG autonome et animé
 */
function DonutChart({
  title,
  subtitle,
  centerLabel,
  centerSub,
  segments,
}: {
  title: string;
  subtitle: string;
  centerLabel: string;
  centerSub: string;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-red-600" />
          <span>{title}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="20"
            />
            {total > 0 &&
              segments.map((seg, idx) => {
                const percent = seg.value / total;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -cumulativePercent * circumference;
                cumulativePercent += percent;

                if (seg.value === 0) return null;
                return (
                  <circle
                    key={idx}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-900">
              {centerLabel}
            </span>
            <span className="text-[10px] font-semibold uppercase text-slate-400">
              {centerSub}
            </span>
          </div>
        </div>

        {/* Légende détaillée */}
        <div className="space-y-2.5 text-xs w-full sm:w-auto">
          {segments.map((seg, idx) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-medium text-slate-700">{seg.label}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {seg.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ExamenBlancPage() {
  const [bank, setBank] = useState<BankItem[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [useTimer, setUseTimer] = useState<boolean>(true);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState<number>(2);

  // États de la session d'examen
  const [phase, setPhase] = useState<"config" | "running" | "results">("config");
  const [examQuestions, setExamQuestions] = useState<BankItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Chargement initial de toutes les questions QCM de l'application
  useEffect(() => {
    fetch("/api/study-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.qcmBank) {
          setBank(data.qcmBank);
          // Par défaut, tous les chapitres sont cochés
          const allKeys = Array.from(
            new Set(
              data.qcmBank.map(
                (item: BankItem) => `${item.subjectId}/${item.chapterId}`
              )
            )
          ) as string[];
          setSelectedChapters(allKeys);
        }
      });
  }, []);

  // Gestion du chronomètre pendant l'examen
  useEffect(() => {
    if (phase !== "running") return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (useTimer) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("results");
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, useTimer]);

  // Sélection / Désélection d'un chapitre
  const toggleChapter = (key: string) => {
    setSelectedChapters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Sélection par matière entière
  const toggleSubjectAll = (subjectId: string) => {
    const subjectMeta = ATS_CURRICULUM.find((s) => s.id === subjectId);
    if (!subjectMeta) return;
    const keys = subjectMeta.chapters.map((c) => `${subjectId}/${c.id}`);
    const allSelected = keys.every((k) => selectedChapters.includes(k));

    if (allSelected) {
      setSelectedChapters((prev) => prev.filter((k) => !keys.includes(k)));
    } else {
      setSelectedChapters((prev) => Array.from(new Set([...prev, ...keys])));
    }
  };

  const availablePool = useMemo(() => {
    return bank.filter((item) =>
      selectedChapters.includes(`${item.subjectId}/${item.chapterId}`)
    );
  }, [bank, selectedChapters]);

  // Lancement de l'examen avec mélange aléatoire de Fisher-Yates
  const startExam = () => {
    if (availablePool.length === 0) return;
    const shuffled = [...availablePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const picked = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    setExamQuestions(picked);
    setUserAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setRemainingSeconds(picked.length * minutesPerQuestion * 60);
    setPhase("running");
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // =========================================================================
  // VUE 1 : CONFIGURATION DE L'EXAMEN BLANC / COLLE
  // =========================================================================
  if (phase === "config") {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 mb-3">
            <Flame className="w-3.5 h-3.5" />
            Simulateur de Concours & Colles ATS
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Configurer votre Examen Blanc sur-mesure
          </h1>
          <p className="text-sm text-slate-600">
            Cochez les chapitres à réviser, choisissez le nombre de questions tirées au sort et activez ou non le chronomètre.
          </p>
        </div>

        {/* Paramètres : Nombre de questions & Chronomètre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>Nombre de questions à tirer au sort</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    questionCount === n
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {n} QCM
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Vivier actuel selon vos chapitres cochés :{" "}
              <strong className="text-red-600">{availablePool.length} questions disponibles</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Clock className="w-4 h-4 text-red-600" />
                <span>Mode Chronométré</span>
              </div>
              <button
                onClick={() => setUseTimer(!useTimer)}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  useTimer
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {useTimer ? "Chrono Activé" : "Sans limite de temps"}
              </button>
            </div>

            {useTimer ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((min) => (
                  <button
                    key={min}
                    onClick={() => setMinutesPerQuestion(min)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      minutesPerQuestion === min
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {min} min / question
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                Le temps passé sera simplement mesuré à titre indicatif pour votre bilan final.
              </p>
            )}
          </div>
        </div>

        {/* Sélection des chapitres par matière */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Sélection des chapitres au programme ({selectedChapters.length} cochés)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSelectedChapters(
                    bank.map((b) => `${b.subjectId}/${b.chapterId}`)
                  )
                }
                className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Tout cocher
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => setSelectedChapters([])}
                className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
              >
                Tout décocher
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ATS_CURRICULUM.map((subject) => {
              const keys = subject.chapters.map((c) => `${subject.id}/${c.id}`);
              const allChecked = keys.every((k) => selectedChapters.includes(k));

              return (
                <div
                  key={subject.id}
                  className="rounded-xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-900">
                      {subject.title}
                    </span>
                    <button
                      onClick={() => toggleSubjectAll(subject.id)}
                      className="text-xs font-semibold text-red-600 cursor-pointer"
                    >
                      {allChecked ? "Désélectionner" : "Tout sélectionner"}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {subject.chapters.map((chapter) => {
                      const key = `${subject.id}/${chapter.id}`;
                      const checked = selectedChapters.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleChapter(key)}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            checked
                              ? "bg-red-50/60 text-slate-900 font-semibold"
                              : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {checked ? (
                            <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] text-red-600 font-bold">
                            {chapter.number}.
                          </span>
                          <span className="truncate">{chapter.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={startExam}
              disabled={availablePool.length === 0}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                Lancer l&apos;Examen Blanc (
                {Math.min(questionCount, availablePool.length)} questions)
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE 2 : PASSATION DE L'EXAMEN EN COURS
  // =========================================================================
  if (phase === "running") {
    const currentItem = examQuestions[currentIndex];
    const q = currentItem.question;
    const selectedOpt = userAnswers[q.id];

    return (
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
        {/* Bandeau supérieur : Progression et Chronomètre */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-6 py-4 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
              {currentItem.subjectTitle} — {currentItem.chapterNumber}.{" "}
              {currentItem.chapterTitle}
            </span>
            <span className="text-xs text-slate-500">
              Question <strong>{currentIndex + 1}</strong> sur{" "}
              {examQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold ${
                useTimer && remainingSeconds < 60
                  ? "bg-red-50 text-red-600 animate-pulse"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <Clock className="w-4 h-4 text-red-600" />
              <span>
                {useTimer
                  ? formatTime(remainingSeconds)
                  : formatTime(elapsedSeconds)}
              </span>
            </div>

            <button
              onClick={() => setPhase("results")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
            >
              Terminer la copie
            </button>
          </div>
        </div>

        {/* Grille de navigation rapide entre les numéros de questions */}
        <div className="flex flex-wrap gap-1.5">
          {examQuestions.map((item, idx) => {
            const answered = Boolean(userAnswers[item.question.id]);
            const active = idx === currentIndex;
            return (
              <button
                key={item.question.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer border ${
                  active
                    ? "border-red-600 bg-red-600 text-white"
                    : answered
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Carte de la question */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
              {q.difficulty}
            </span>
          </div>

          <div className="text-base md:text-lg font-semibold text-slate-900 leading-relaxed">
            <MathText text={q.questionText} />
          </div>

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isChosen = selectedOpt === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    setUserAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                  }
                  className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isChosen
                      ? "border-red-600 bg-red-50/70 font-semibold text-slate-900 ring-2 ring-red-500/20"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isChosen
                        ? "bg-red-600 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-sm md:text-base">
                    <MathText text={opt.text} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              ← Précédente
            </button>
            {currentIndex < examQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
              >
                <span>Suivante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setPhase("results")}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white cursor-pointer"
              >
                <span>Rendre ma copie et voir l&apos;analyse</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE 3 : RÉSULTATS, ANALYSE DIAGNOSTIQUE ET CAMEMBERTS
  // =========================================================================
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const difficultyStats: Record<string, { correct: number; total: number }> = {
    "Application directe": { correct: 0, total: 0 },
    Calculatoire: { correct: 0, total: 0 },
    "Type Concours": { correct: 0, total: 0 },
  };

  const chapterStats: Record<
    string,
    {
      title: string;
      subjectTitle: string;
      href: string;
      correct: number;
      total: number;
    }
  > = {};

  examQuestions.forEach((item) => {
    const q = item.question;
    const ans = userAnswers[q.id];
    const isOk = ans === q.correctOptionId;

    if (!ans) unansweredCount++;
    else if (isOk) correctCount++;
    else wrongCount++;

    difficultyStats[q.difficulty].total += 1;
    if (isOk) difficultyStats[q.difficulty].correct += 1;

    const cKey = `${item.subjectId}/${item.chapterId}`;
    if (!chapterStats[cKey]) {
      chapterStats[cKey] = {
        title: `${item.chapterNumber}. ${item.chapterTitle}`,
        subjectTitle: item.subjectTitle,
        href: `/${item.subjectId}/${item.chapterId}/cours`,
        correct: 0,
        total: 0,
      };
    }
    chapterStats[cKey].total += 1;
    if (isOk) chapterStats[cKey].correct += 1;
  });

  const scorePct =
    examQuestions.length > 0
      ? Math.round((correctCount / examQuestions.length) * 100)
      : 0;
  const noteSur20 = ((correctCount / examQuestions.length) * 20).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
      {/* En-tête du Bilan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
            <Trophy className="w-3.5 h-3.5" />
            Bilan Officiel de votre Examen Blanc
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Note obtenue : <span className="text-red-600">{noteSur20} / 20</span>{" "}
            ({correctCount} / {examQuestions.length})
          </h1>
          <p className="text-xs text-slate-500">
            Temps total : <strong>{formatTime(elapsedSeconds)}</strong> (soit{" "}
            {Math.round(elapsedSeconds / examQuestions.length)} s / question en
            moyenne)
          </p>
        </div>

        <button
          onClick={() => setPhase("config")}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Nouvel Examen Blanc</span>
        </button>
      </div>

      {/* Les 2 Camemberts (Donut Charts SVG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DonutChart
          title="Répartition Globale des Réponses"
          subtitle="Exactitude sur l'ensemble du sujet"
          centerLabel={`${scorePct}%`}
          centerSub="Réussite"
          segments={[
            { label: "Bonnes réponses", value: correctCount, color: "#10b981" },
            { label: "Réponses fausses", value: wrongCount, color: "#ef4444" },
            { label: "Non répondues", value: unansweredCount, color: "#94a3b8" },
          ]}
        />

        <DonutChart
          title="Points gagnés par Niveau de Difficulté"
          subtitle="Répartition de vos bonnes réponses selon la difficulté"
          centerLabel={`${correctCount} pts`}
          centerSub="Acquis"
          segments={[
            {
              label: `Application directe (sur ${difficultyStats["Application directe"].total})`,
              value: difficultyStats["Application directe"].correct,
              color: "#10b981",
            },
            {
              label: `Calculatoire (sur ${difficultyStats["Calculatoire"].total})`,
              value: difficultyStats["Calculatoire"].correct,
              color: "#f59e0b",
            },
            {
              label: `Type Concours (sur ${difficultyStats["Type Concours"].total})`,
              value: difficultyStats["Type Concours"].correct,
              color: "#dc2626",
            },
          ]}
        />
      </div>

      {/* Analyse diagnostique par Chapitre */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Diagnostic par Chapitre & Priorités de Révision
        </h2>
        <div className="space-y-3">
          {Object.entries(chapterStats).map(([key, stat]) => {
            const pct = Math.round((stat.correct / stat.total) * 100);
            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase mr-2">
                      {stat.subjectTitle}
                    </span>
                    <Link
                      href={stat.href}
                      className="font-bold text-slate-900 hover:text-red-600 underline"
                    >
                      {stat.title}
                    </Link>
                  </div>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      pct >= 75
                        ? "bg-emerald-50 text-emerald-700"
                        : pct >= 50
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {stat.correct} / {stat.total} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      pct >= 75
                        ? "bg-emerald-500"
                        : pct >= 50
                        ? "bg-amber-500"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correction détaillée de chaque question de l'examen */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Correction détaillée de votre copie
        </h2>
        {examQuestions.map((item, idx) => {
          const q = item.question;
          const userAns = userAnswers[q.id];
          const isOk = userAns === q.correctOptionId;

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Question {idx + 1} • {item.subjectTitle} ({item.chapterTitle})
                </span>
                {isOk ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct ({userAns})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                    <XCircle className="w-3.5 h-3.5" />{" "}
                    {userAns ? `Votre choix : ${userAns}` : "Non répondu"} →
                    Bonne réponse : {q.correctOptionId}
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-slate-900">
                <MathText text={q.questionText} />
              </p>

              <div className="rounded-r-xl border-l-4 border-red-600 bg-red-50/70 p-3.5 text-xs">
                <strong className="text-red-600 block mb-1">
                  Formule clé :
                </strong>
                <MathText text={q.explanation.keyFormula} />
              </div>

              <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl">
                {q.explanation.steps.map((st, sIdx) => (
                  <li key={sIdx}>
                    <MathText text={st} />
                  </li>
                ))}
              </ul>

              {q.explanation.commonTrap && (
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-red-600">Piège : </strong>
                    <MathText text={q.explanation.commonTrap} />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}