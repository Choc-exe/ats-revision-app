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
import { Cpu, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";

/**
 * Composant SchemaPlaceholder : affiche proprement les schémas cinématiques,
 * schémas-blocs SLCI, montages électriques ou figures géométriques décrits dans les fichiers .mdx
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
    <div className="my-6 rounded-2xl border-2 border-dashed border-blue-200 dark:border-sky-900/70 bg-blue-50/40 dark:bg-sky-950/20 p-5 not-prose">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-sky-900/70 dark:text-sky-300">
              {type ?? "Schéma & Représentation Technique"}
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

/**
 * Composants de secours supplémentaires au cas où certains fichiers .mdx
 * utilisent <Definition>, <Theorem>, <MethodBox> ou <ExampleBox>
 */
function GenericCallout({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="my-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
      {title && (
        <div className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <span>{title}</span>
        </div>
      )}
      <div className="text-sm text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  );
}

const mdxComponents = {
  CriticalFormula,
  WarningBox,
  SchemaPlaceholder,
  Definition: GenericCallout,
  Theorem: GenericCallout,
  MethodBox: GenericCallout,
  ExampleBox: GenericCallout,
  Callout: GenericCallout,
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
      remarkPlugins: [remarkMath],
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