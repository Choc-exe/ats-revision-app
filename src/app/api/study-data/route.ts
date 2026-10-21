import { NextResponse } from "next/server";
import { ATS_CURRICULUM } from "@/lib/curriculum";
import {
  getMdxContent,
  getFlashcardsData,
  getQcmData,
} from "@/lib/content-loader";

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
      if (deck?.cards) {
        for (const card of deck.cards) {
          searchIndex.push({
            id: card.id,
            type: "Flashcard",
            subjectId: subject.id,
            subjectTitle: subject.shortTitle,
            chapterId: chapter.id,
            chapterTitle: fullChapterTitle,
            title: card.front,
            snippet: `${card.back.mainAnswer} ${card.back.criticalFormula || ""}`,
            href: `${baseHref}/flashcards`,
          });
        }
      }

      // 3. Indexation des QCM + Alimentation de la banque d'Examen Blanc
      const qcm = await getQcmData(subject.id, chapter.id);
      if (qcm?.questions) {
        for (const q of qcm.questions) {
          searchIndex.push({
            id: q.id,
            type: "QCM",
            subjectId: subject.id,
            subjectTitle: subject.shortTitle,
            chapterId: chapter.id,
            chapterTitle: fullChapterTitle,
            title: q.questionText,
            snippet: q.explanation.keyFormula,
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