"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getMistakesBook,
  resolveQcmMistake,
  getSrsRecords,
  MistakeRecord,
  SrsCardRecord,
} from "@/lib/srs-storage";
import {
  AlertTriangle,
  CheckCircle2,
  Brain,
  BookOpen,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

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

export default function CarnetErreursPage() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [dueCards, setDueCards] = useState<SrsCardRecord[]>([]);

  useEffect(() => {
    const book = getMistakesBook();
    const sortedMistakes = Object.values(book).sort(
      (a, b) => b.wrongCount - a.wrongCount || b.lastFailedAt - a.lastFailedAt
    );
    setMistakes(sortedMistakes);

    const srs = getSrsRecords();
    const now = Date.now();
    const due = Object.values(srs).filter((r) => r.dueTimestamp <= now);
    setDueCards(due);
  }, []);

  const handleResolve = (questionId: string) => {
    resolveQcmMistake(questionId);
    setMistakes((prev) => prev.filter((m) => m.questionId !== questionId));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* EN-TÊTE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Méthode de Progression Active
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Carnet d'Erreurs & Révisions Espacées (SRS)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Concentrez votre énergie sur les questions qui vous ont mis en échec en Examen Blanc et sur les flashcards arrivées à échéance aujourd'hui.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center">
            <span className="block text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
              Erreurs à corriger
            </span>
            <span className="font-mono text-xl font-extrabold text-red-900 dark:text-white">
              {mistakes.length}
            </span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
            <span className="block text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
              Flashcards dues
            </span>
            <span className="font-mono text-xl font-extrabold text-amber-900 dark:text-white">
              {dueCards.length}
            </span>
          </div>
        </div>
      </div>

      {/* BLOC 1 : FLASHCARDS À REVOIR AUJOURD'HUI */}
      {dueCards.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Chapitres ayant des Flashcards arrivées à échéance ({dueCards.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from(
              new Set(dueCards.map((d) => `${d.subjectId}/${d.chapterId}`))
            ).map((key) => {
              const [subjectId, chapterId] = key.split("/");
              const count = dueCards.filter(
                (d) => d.subjectId === subjectId && d.chapterId === chapterId
              ).length;

              return (
                <Link
                  key={key}
                  href={`/${subjectId}/${chapterId}/flashcards`}
                  className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/50 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">
                      {subjectId}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      Chapitre {chapterId}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-600 text-white shrink-0">
                    {count} carte{count > 1 ? "s" : ""}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* BLOC 2 : LISTE DES ERREURS DE QCM ENREGISTRÉES */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Questions de QCM & Examens Blancs à retravailler ({mistakes.length})
        </h2>

        {mistakes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Votre carnet d'erreurs est vierge !
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Dès que vous ferez une erreur en mode Examen Blanc, la question et sa formule critique s'ajouteront automatiquement ici pour que vous ne refassiez jamais deux fois la même faute le jour du concours.
            </p>
            <Link
              href="/examen"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              <span>Lancer un Examen Blanc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          mistakes.map((item) => (
            <div
              key={item.questionId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                    Échouée {item.wrongCount} fois
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {item.subjectTitle} • {item.chapterTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${item.subjectId}/${item.chapterId}/cours`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Revoir le cours</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleResolve(item.questionId)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Compris & Résolu</span>
                  </button>
                </div>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                <SafeMathText content={item.questionText} />
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Réponse exacte à maîtriser :
                </span>
                <div className="text-slate-900 dark:text-white font-medium">
                  <SafeMathText content={item.correctAnswerText} />
                </div>
              </div>

              {item.keyFormula && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/25 p-3.5 text-xs">
                  <span className="font-bold text-red-800 dark:text-red-300 block mb-1">
                    Formule / Règle critique :
                  </span>
                  <div className="text-slate-900 dark:text-white overflow-x-auto">
                    <SafeMathText content={item.keyFormula} displayMode />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}