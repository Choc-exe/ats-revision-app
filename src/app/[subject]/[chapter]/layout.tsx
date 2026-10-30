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
import rehypeKatex from "rehype-katex";
import CriticalFormula from "@/components/mdx/CriticalFormula";
import WarningBox from "@/components/mdx/WarningBox";
import { Cpu } from "lucide-react";

/**
 * Composant SchemaPlaceholder intégré pour les figures géométriques,
 * schémas cinématiques et montages électriques des cours ATS.
 */
function SchemaPlaceholder({
  title,
  description,
  caption,
  type,
  children,
}: {
  title?: string;
  description?: string;
  caption?: string;
  type?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="my-6 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/10 p-5 not-prose">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300">
              {type ?? "Schéma Technique"}
            </span>
            {title && (
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {title}
              </h4>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          )}
          {caption && (
            <p className="text-xs italic text-slate-500 dark:text-slate-400">
              {caption}
            </p>
          )}
          {children && (
            <div className="text-xs text-slate-700 dark:text-slate-300 pt-1">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mdxComponents = {
  CriticalFormula,
  WarningBox,
  SchemaPlaceholder,
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

  // Pré-chargement simultané des données du chapitre
  const courseMdx = getMdxContent(subject, chapter, "course");
  const summaryMdx = getMdxContent(subject, chapter, "summary");
  const flashcards = getFlashcardsData(subject, chapter);
  const qcmQuestions = getQcmData(subject, chapter);

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: false, throwOnError: false }]] as any,
    },
  };

  const courseNode = courseMdx ? (
    <article className="prose prose-slate dark:prose-invert max-w-none leading-relaxed prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-red-600 dark:prose-a:text-red-400 prose-code:text-red-600 dark:prose-code:text-red-400">
      <MDXRemote
        source={courseMdx.content}
        components={mdxComponents}
        options={mdxOptions}
      />
    </article>
  ) : (
    <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
      Cours en cours de rédaction pour ce chapitre.
    </div>
  );

  const summaryNode = summaryMdx ? (
    <article className="prose prose-slate dark:prose-invert max-w-none leading-relaxed prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-red-600 dark:prose-a:text-red-400 prose-code:text-red-600 dark:prose-code:text-red-400">
      <MDXRemote
        source={summaryMdx.content}
        components={mdxComponents}
        options={mdxOptions}
      />
    </article>
  ) : (
    <div className="text-center py-12 text-sm text-slate-500 dark:text-slate-400">
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
      subjectTitle={subjectData.title}
      chapterId={chapterData.id}
      chapterNumber={chapterData.number}
      chapterTitle={chapterData.title}
      courseNode={courseNode}
      summaryNode={summaryNode}
      flashcardsNode={flashcardsNode}
      qcmNode={qcmNode}
    />
  );
}