import React from "react";
import Link from "next/link";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import HomeStatsIsland from "./HomeStatsIsland";
import {
  GraduationCap,
  Trophy,
  Presentation,
  Activity,
  Waves,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Atom,
  Sigma,
  Cpu,
  Terminal,
  BookMarked,
  Languages,
  BookOpen,
  Layers,
  CheckSquare,
  Sparkles,
} from "lucide-react";

// ─── Pré-calcul statique au build ────────────────────────────────────────────
const totalChapters = ATS_CURRICULUM.reduce((acc, s) => acc + s.chapters.length, 0);

// Compte approximatif statique : évite le fetch /api/study-data à chaque chargement.
// Mettre à jour manuellement si le nombre de QCM change significativement.
const TOTAL_BANK_QUESTIONS = 68;

const SUBJECT_META_STYLE: Record<
  string,
  {
    icon: React.ReactNode;
    badgeBg: string;
    borderAccent: string;
    coefLabel: string;
  }
> = {
  "physique-chimie": {
    icon: <Atom className="w-5 h-5" />,
    badgeBg: "bg-blue-50 text-blue-700 dark:bg-sky-950/70 dark:text-sky-300",
    borderAccent: "hover:border-blue-500 dark:hover:border-sky-400",
    coefLabel: "Écrit 4h + Oral • Coef Majeur",
  },
  mathematiques: {
    icon: <Sigma className="w-5 h-5" />,
    badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
    borderAccent: "hover:border-indigo-500 dark:hover:border-indigo-400",
    coefLabel: "Écrit 4h + Oral • Coef Majeur",
  },
  sii: {
    icon: <Cpu className="w-5 h-5" />,
    badgeBg: "bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
    borderAccent: "hover:border-amber-500 dark:hover:border-amber-400",
    coefLabel: "Écrit 4h (Génie Élec & Méca) + Oral",
  },
  informatique: {
    icon: <Terminal className="w-5 h-5" />,
    badgeBg: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
    borderAccent: "hover:border-emerald-500 dark:hover:border-emerald-400",
    coefLabel: "Python & Méthodes Numériques (SII/Maths)",
  },
  "francais-philosophie": {
    icon: <BookMarked className="w-5 h-5" />,
    badgeBg: "bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300",
    borderAccent: "hover:border-rose-500 dark:hover:border-rose-400",
    coefLabel: "Écrit 3h (Résumé + Dissertation)",
  },
  anglais: {
    icon: <Languages className="w-5 h-5" />,
    badgeBg: "bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300",
    borderAccent: "hover:border-purple-500 dark:hover:border-purple-400",
    coefLabel: "Écrit 3h (Synthèse + Essay) + Khôlle Audio",
  },
};

// Server Component — rendu statique au build (pas de useEffect, pas de fetch)
export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* =====================================================================
          1. BANNIÈRE HERO : CENTRE DE COMMANDEMENT « OBJECTIF MAJOR ATS »
         ===================================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-sky-950/80 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Programme Officiel CPGE ATS — Édition Concours Complet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Plateforme d&apos;Entraînement Intensif &amp; Révision Active
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Couverture intégrale des <strong>6 pôles d&apos;évaluation</strong> (Physique-Chimie, Mathématiques, SII, Informatique Python, Français-Philosophie et Anglais) avec répétition espacée SRS, carnet d&apos;erreurs dynamique, simulateur d&apos;oral de khôlle et laboratoires numériques.
            </p>
          </div>

          {/* 4 Indicateurs : 2 statiques + 2 dynamiques (île client) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            {/* Statique : nombre de chapitres */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Chapitres &amp; Cours
              </span>
              <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                {totalChapters} thèmes
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                100 % du B.O. couvert
              </span>
            </div>

            {/* Statique : banque QCM */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Banque Concours
              </span>
              <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                {TOTAL_BANK_QUESTIONS}+ QCM
              </span>
              <span className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold block">
                + 8 Planches Khôlle
              </span>
            </div>

            {/* Îlot client : compteurs SRS + erreurs (lu depuis localStorage) */}
            <HomeStatsIsland totalBankQuestions={TOTAL_BANK_QUESTIONS} />
          </div>
        </div>

        {/* Barre d'actions prioritaires */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/examen"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Lancer un Examen Blanc</span>
            </Link>
            <Link
              href="/kholle"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Tirer une Planche de Khôlle</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. LES 4 SIMULATEURS & OUTILS D'EXCELLENCE
         ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/examen"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 p-5 shadow-xs transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-sky-950/70 text-blue-600 dark:text-sky-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300">
              Camembert &amp; Stats
            </span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400">
              Examen Blanc sur Mesure
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Choix granulaire des thèmes, barème strict (-0,25) et rapport analytique par chapitre.
            </p>
          </div>
        </Link>

        <Link
          href="/kholle"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 p-5 shadow-xs transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Presentation className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300">
              Chrono 20m + 20m
            </span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Planches de Khôlle &amp; Écrits
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Questions de cours démontrées et problèmes longs à tiroirs avec barème sur 20.
            </p>
          </div>
        </Link>

        <Link
          href="/simulateur-fourier"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 p-5 shadow-xs transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-300">
              Maths • SII • Py
            </span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              Labo Fourier, Parseval &amp; Newton
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Synthèse harmonique en temps réel, phénomène de Gibbs et convergence de Newton.
            </p>
          </div>
        </Link>

        <Link
          href="/simulateur-bode"
          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 p-5 shadow-xs transition-all flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300">
              SLCI &amp; Filtres
            </span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Traceur de Bode &amp; Indicielle
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Diagrammes asymptotiques et réels, pulsation de coupure et dépassement temporel.
            </p>
          </div>
        </Link>
      </div>

      {/* =====================================================================
          3. PROGRAMME OFFICIEL COMPLET PAR MATIÈRE (6 MATIÈRES)
         ===================================================================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <span>Référentiel Complet des 6 Matières du Concours ATS</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Accès direct aux Cours, Fiches Synthèses, Flashcards SRS et QCM
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ATS_CURRICULUM.map((subject) => {
            const style = SUBJECT_META_STYLE[subject.id] ?? {
              icon: <Atom className="w-5 h-5" />,
              badgeBg: "bg-blue-50 text-blue-700",
              borderAccent: "hover:border-blue-500",
              coefLabel: "Concours ATS",
            };

            return (
              <div
                key={subject.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ${style.borderAccent} p-6 shadow-xs transition-all flex flex-col justify-between space-y-5`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.badgeBg}`}
                      >
                        {style.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {style.coefLabel}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {subject.title}
                        </h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                      {subject.chapters.length} chap.
                    </span>
                  </div>

                  {/* Liste des chapitres avec raccourcis rapides */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/70 max-h-80 overflow-y-auto pr-1">
                    {subject.chapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="py-2.5 flex items-center justify-between gap-2 group/row"
                      >
                        <Link
                          href={`/${subject.id}/${ch.id}/cours`}
                          className="flex items-center gap-2.5 min-w-0 flex-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400"
                        >
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                            {ch.number}
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </Link>

                        <div className="flex items-center gap-1 shrink-0 opacity-85 group-hover/row:opacity-100">
                          <Link
                            href={`/${subject.id}/${ch.id}/cours`}
                            title="Cours complet"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-sky-950/60"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/${subject.id}/${ch.id}/flashcards`}
                            title="Flashcards SRS"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/${subject.id}/${ch.id}/qcm`}
                            title="QCM Concours"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <Link
                    href={`/${subject.id}/${subject.chapters[0]?.id}/cours`}
                    className="font-bold text-blue-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Commencer par le Chapitre 01</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/examen"
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                  >
                    Tester cette matière →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
