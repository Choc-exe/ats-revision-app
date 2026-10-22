import React from "react";
import { getMdxContent } from "@/lib/content-loader";
import MdxViewer from "@/components/mdx/MdxViewer";
import { Zap } from "lucide-react";
import { Metadata } from "next";
import { getSubjectById, getChapterById } from "@/lib/curriculum";

interface SummaryPageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { subject, chapter } = await params;
  const data = await getMdxContent(subject, chapter, "summary");

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500">
          Aucune fiche synthèse trouvée dans{" "}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600">
            content/{subject}/{chapter}/summary.mdx
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bandeau d'en-tête propre au mode Synthèse */}
      <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3">
        <div className="flex items-center gap-2.5 text-red-700 text-sm font-semibold">
          <Zap className="w-4 h-4 text-red-600" />
          <span>Mode Révision Rapide — Formules et capacités exigibles uniquement</span>
        </div>
      </div>

      <MdxViewer source={data.content} variant="synthetic" />
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
    title: `${chapterData?.title ?? "Chapitre"} — Cours | Prépa ATS`,
  };
}