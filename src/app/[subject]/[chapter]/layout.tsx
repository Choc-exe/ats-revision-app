import React from "react";
import { notFound } from "next/navigation";
import { getSubjectById, getChapterById } from "@/lib/curriculum";
import {
  getMdxContent,
  getFlashcardsData,
  getQcmData,
} from "@/lib/content-loader";
import { SubjectId } from "@/types/pedagogy";
import ChapterWorkspace from "@/components/layout/ChapterWorkspace";
import FlashcardDeck from "@/components/modules/FlashcardDeck";
import QcmEngine from "@/components/modules/QcmEngine";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import CriticalFormula from "@/components/mdx/CriticalFormula";
import WarningBox from "@/components/mdx/WarningBox";

const mdxComponents = {
  CriticalFormula,
  WarningBox,
};

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

  // Chargement simultané des 4 ressources du chapitre côté serveur
  const courseMdx = getMdxContent(subject, chapter, "course");
  const summaryMdx = getMdxContent(subject, chapter, "summary");
  const flashcards = getFlashcardsData(subject, chapter);
  const qcmQuestions = getQcmData(subject, chapter);

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]] as any,
    },
  };

  const courseNode = courseMdx ? (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote
        source={courseMdx.content}
        components={mdxComponents}
        options={mdxOptions}
      />
    </article>
  ) : (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
      Cours en cours de rédaction pour ce chapitre.
    </div>
  );

  const summaryNode = summaryMdx ? (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs prose prose-slate dark:prose-invert max-w-none">
      <MDXRemote
        source={summaryMdx.content}
        components={mdxComponents}
        options={mdxOptions}
      />
    </article>
  ) : (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
      Fiche synthèse indisponible pour ce chapitre.
    </div>
  );

  const flashcardsNode = (
    <FlashcardDeck
      deck={{
        subject: subject as SubjectId,
        chapterId: chapter,
        title: chapterData.title,
        cards: flashcards,
      }}
    />
  );

  const qcmNode = (
    <QcmEngine
      qcm={{
        subject: subject as SubjectId,
        chapterId: chapter,
        title: chapterData.title,
        questions: qcmQuestions,
      }}
    />
  );

  return (
    <ChapterWorkspace
      subjectId={subjectData.id}
      subjectTitle={subjectData.shortTitle}
      chapterId={chapterData.id}
      chapterNumber={chapterData.number}
      chapterTitle={chapterData.title}
      semester={chapterData.semester ?? 1}
      flashcardsCount={flashcards.length}
      qcmCount={qcmQuestions.length}
      courseNode={courseNode}
      summaryNode={summaryNode}
      flashcardsNode={flashcardsNode}
      qcmNode={qcmNode}
    />
  );
}