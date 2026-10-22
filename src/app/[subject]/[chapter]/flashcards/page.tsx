import React from "react";
import { getFlashcardsData } from "@/lib/content-loader";
import FlashcardDeck from "@/components/modules/FlashcardDeck";
import { Layers, FileWarning } from "lucide-react";
import { Metadata } from "next";
import { getSubjectById, getChapterById } from "@/lib/curriculum";

interface FlashcardsPageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { subject, chapter } = await params;
  const deckData = await getFlashcardsData(subject, chapter);

  if (!deckData || !deckData.cards || deckData.cards.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-xl mx-auto">
        <FileWarning className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Aucune flashcard disponible
        </h2>
        <p className="text-sm text-slate-500">
          Le fichier <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600">flashcards.json</code> est introuvable ou vide pour ce chapitre.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du module */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{deckData.title}</h2>
            <p className="text-xs text-slate-500">
              Entraînement par répétition espacée et mémorisation active
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
          {deckData.cards.length} cartes au total
        </span>
      </div>

      {/* Moteur interactif des flashcards */}
      <FlashcardDeck deck={deckData} />
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