import React from "react";
import { notFound } from "next/navigation";
import { getSubjectById, getChapterById } from "@/lib/curriculum";
import ChapterWorkspace from "@/components/layout/ChapterWorkspace";

// On importe directement TES vraies pages d'origine avec leur graphisme exact !
import CoursPage from "./cours/page";
import SynthesePage from "./synthese/page";
import FlashcardsPage from "./flashcards/page";
import QcmPage from "./qcm/page";

interface ChapterLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function ChapterLayout({ params }: ChapterLayoutProps) {
  const { subject, chapter } = await params;
  const subjectData = getSubjectById(subject);
  const chapterData = getChapterById(subject, chapter);

  if (!subjectData || !chapterData) {
    notFound();
  }

  return (
    <ChapterWorkspace
      subjectId={subjectData.id}
      subjectTitle={subjectData.title}
      chapterId={chapterData.id}
      chapterNumber={chapterData.number}
      chapterTitle={chapterData.title}
      courseNode={<CoursPage params={params} />}
      summaryNode={<SynthesePage params={params} />}
      flashcardsNode={<FlashcardsPage params={params} />}
      qcmNode={<QcmPage params={params} />}
    />
  );
}