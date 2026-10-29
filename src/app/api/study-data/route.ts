import { NextResponse } from "next/server";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import {
  getMdxContent,
  getFlashcardsData,
  getQcmData,
} from "@/lib/content-loader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const searchIndex: Array<{
    id: string;
    type: "Chapitre" | "Flashcard" | "QCM";
    subjectId: string;
    subjectTitle: string;
    chapterId: string;
    chapterTitle: string;
    title: string;
    snippet: string;
    href: string;
  }> = [];

  const qcmBank: Array<{
    subjectId: string;
    subjectTitle: string;
    chapterId: string;
    chapterNumber: string;
    chapterTitle: string;
    question: any;
  }> = [];

  for (const subject of ATS_CURRICULUM) {
    for (const chapter of subject.chapters) {
      const baseHref = `/${subject.id}/${chapter.id}`;
      const fullChapterTitle = `${chapter.number}.${chapter.title}`;

      // 1. Indexation du cours MDX
      const course = await getMdxContent(subject.id, chapter.id, "course");
      searchIndex.push({
        id: `chap-${subject.id}-${chapter.id}`,
        type: "Chapitre",
        subjectId: subject.id,
        subjectTitle: subject.shortTitle,
        chapterId: chapter.id,
        chapterTitle: fullChapterTitle,
        title: fullChapterTitle,
        snippet: course
          ? course.content.replace(/[#*`\$<>]/g, " ").slice(0, 260) + "..."
          : subject.title,
        href: `${baseHref}/cours`,
      });

      // 2. Indexation des Flashcards
      const deck = await getFlashcardsData(subject.id, chapter.id);
      if (deck && Array.isArray(deck)) {
        for (const card of deck) {
          const frontText =
            typeof card.front === "string"
              ? card.front
              : (card as any).question || "Flashcard";
          const backText =
            typeof card.back === "string"
              ? card.back
              : `${(card.back as any)?.mainAnswer ?? ""} ${(card.back as any)?.criticalFormula ?? ""}`.trim();

          searchIndex.push({
            id: card.id,
            type: "Flashcard",
            subjectId: subject.id,
            subjectTitle: subject.shortTitle,
            chapterId: chapter.id,
            chapterTitle: fullChapterTitle,
            title: frontText,
            snippet: backText,
            href: `${baseHref}/flashcards`,
          });
        }
      }

      // 3. Indexation des QCM + Alimentation de la banque d'Examen Blanc
      const qcm = await getQcmData(subject.id, chapter.id);
      if (qcm && Array.isArray(qcm)) {
        for (const q of qcm) {
          const qText =
            (q as any).question ||
            (q as any).prompt ||
            (q as any).questionText ||
            "Question QCM";
          const formula = q.explanation?.keyFormula || "";

          searchIndex.push({
            id: q.id,
            type: "QCM",
            subjectId: subject.id,
            subjectTitle: subject.shortTitle,
            chapterId: chapter.id,
            chapterTitle: fullChapterTitle,
            title: qText,
            snippet: formula,
            href: `${baseHref}/qcm`,
          });

          qcmBank.push({
            subjectId: subject.id,
            subjectTitle: subject.title,
            chapterId: chapter.id,
            chapterNumber: chapter.number,
            chapterTitle: chapter.title,
            question: q,
          });
        }
      }
    }
  }

  return NextResponse.json({ searchIndex, qcmBank });
}