"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSrsRecords, getMistakesBook, SrsCardRecord, MistakeRecord } from "@/lib/srs-storage";
import { Flame } from "lucide-react";

export default function HomeStatsIsland({ totalBankQuestions }: { totalBankQuestions: number }) {
  const [srsRecords, setSrsRecords] = useState<Record<string, SrsCardRecord>>({});
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  useEffect(() => {
    setSrsRecords(getSrsRecords());
    const book = getMistakesBook();
    setMistakes(Object.values(book));
  }, []);

  const now = Date.now();
  const srsValues = Object.values(srsRecords);
  const dueToday = srsValues.filter((r) => r.dueTimestamp <= now).length;
  const mastered = srsValues.filter((r) => r.intervalDays >= 5).length;

  return (
    <>
      {/* 2 compteurs dynamiques SRS + erreurs */}
      <Link
        href="/carnet-erreurs"
        className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 hover:bg-amber-100/60 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
          Flashcards SRS dues
        </span>
        <span className="font-mono text-xl font-extrabold text-amber-900 dark:text-white">
          {dueToday} à revoir
        </span>
        <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block">
          {mastered} cartes maîtrisées
        </span>
      </Link>

      <Link
        href="/carnet-erreurs"
        className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 hover:bg-red-100/60 transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block">
          Carnet d&apos;Erreurs
        </span>
        <span className="font-mono text-xl font-extrabold text-red-900 dark:text-white">
          {mistakes.length} piège{mistakes.length > 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-red-700 dark:text-red-300 font-semibold block">
          À purger avant l&apos;écrit →
        </span>
      </Link>

      {/* Banque QCM (statique, passé depuis le serveur) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1 hidden" aria-hidden />

      {/* Barre protocole quotidien */}
      <div className="col-span-full pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Flame className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            <strong>Protocole quotidien du Major :</strong> 15 min de Carnet d&apos;Erreurs/SRS → 1 Planche de Khôlle sur feuille blanche → 1 Examen Blanc ciblé.
          </span>
        </div>
      </div>
    </>
  );
}
