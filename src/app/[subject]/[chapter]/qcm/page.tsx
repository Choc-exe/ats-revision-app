import React from "react";
import { getQcmData } from "@/lib/content-loader";
import QcmEngine from "@/components/modules/QcmEngine";
import { CheckSquare, FileWarning } from "lucide-react";
import { Metadata } from "next";
import { getChapterById } from "@/lib/curriculum";
import { SubjectId } from "@/types/pedagogy";

interface QcmPageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function QcmPage({ params }: QcmPageProps) {
  const { subject, chapter } = await params;
  const questions = await getQcmData(subject, chapter);
  const chapterData = getChapterById(subject, chapter);

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-xl mx-auto shadow-sm">
        <FileWarning className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Aucun QCM disponible
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Le fichier <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400">qcm.json</code> est introuvable ou vide pour ce chapitre.
        </p>
      </div>
    );
  }

  const qcmObject = {
    subject: subject as SubjectId,
    chapterId: chapter,
    title: chapterData?.title ?? "QCM du chapitre",
    questions: questions,
  };

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {qcmObject.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Évaluation formative de type concours avec corrections pas-à-pas
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {questions.length} questions
        </span>
      </div>

      {/* Moteur interactif du QCM */}
      <QcmEngine qcm={qcmObject} />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; chapter: string }>;
}): Promise<Metadata> {
  const { subject, chapter } = await params;
  const chapterData = getChapterById(subject, chapter);
  return {
    title: `${chapterData?.title ?? "Chapitre"} — QCM & Corrections | Prépa ATS`,
  };
}