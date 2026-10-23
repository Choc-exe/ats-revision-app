import React from "react";
import { notFound } from "next/navigation";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import ChapterTabs from "@/components/layout/ChapterTabs";

interface ChapterLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function ChapterLayout({
  children,
  params,
}: ChapterLayoutProps) {
  const { subject, chapter } = await params;

  // Vérification de l'existence de la matière et du chapitre dans le référentiel
  const subjectMeta = ATS_CURRICULUM.find((s) => s.id === subject);
  const chapterMeta = subjectMeta?.chapters.find((c) => c.id === chapter);

  if (!subjectMeta || !chapterMeta) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <ChapterTabs
        subjectId={subjectMeta.id}
        chapterId={chapterMeta.id}
        subjectTitle={subjectMeta.title}
        chapterTitle={`${chapterMeta.number}. ${chapterMeta.title}`}
        semester={chapterMeta.semester}
      />

      {/* Conteneur de lecture centré, optimisé pour ne pas dépasser 85ch de large */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6">
        {children}
      </main>
    </div>
  );
}