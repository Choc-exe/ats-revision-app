import React from "react";
import { getQcmData } from "@/lib/content-loader";
import QcmEngine from "@/components/modules/QcmEngine";
import { CheckSquare, FileWarning } from "lucide-react";

interface QcmPageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function QcmPage({ params }: QcmPageProps) {
  const { subject, chapter } = await params;
  const qcmData = await getQcmData(subject, chapter);

  if (!qcmData || !qcmData.questions || qcmData.questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto">
        <FileWarning className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Aucun QCM disponible
        </h2>
        <p className="text-sm text-slate-500">
          Le fichier{" "}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600">
            content/{subject}/{chapter}/qcm.json
          </code>{" "}
          est introuvable ou vide.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{qcmData.title}</h2>
            <p className="text-xs text-slate-500">
              Validation immédiate et résolution détaillée étape par étape
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
          {qcmData.questions.length} questions
        </span>
      </div>

      <QcmEngine qcm={qcmData} />
    </div>
  );
}