import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { FlashcardDeckData, QcmModuleData } from "@/types/pedagogy";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Lit un fichier MDX (course.mdx ou summary.mdx) et sépare les métadonnées (frontmatter) du contenu
 */
export async function getMdxContent(
  subject: string,
  chapter: string,
  type: "course" | "summary"
) {
  const filePath = path.join(CONTENT_ROOT, subject, chapter, `${type}.mdx`);
  try {
    const rawFile = await fs.readFile(filePath, "utf-8");
    const { data: frontmatter, content } = matter(rawFile);
    return { frontmatter, content };
  } catch (error) {
    return null;
  }
}

/**
 * Lit et parse le paquet de Flashcards (flashcards.json) d'un chapitre
 */
export async function getFlashcardsData(
  subject: string,
  chapter: string
): Promise<FlashcardDeckData | null> {
  const filePath = path.join(CONTENT_ROOT, subject, chapter, "flashcards.json");
  try {
    const rawJson = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawJson) as FlashcardDeckData;
  } catch (error) {
    return null;
  }
}

/**
 * Lit et parse le QCM (qcm.json) d'un chapitre
 */
export async function getQcmData(
  subject: string,
  chapter: string
): Promise<QcmModuleData | null> {
  const filePath = path.join(CONTENT_ROOT, subject, chapter, "qcm.json");
  try {
    const rawJson = await fs.readFile(filePath, "utf-8");
    return JSON.parse(rawJson) as QcmModuleData;
  } catch (error) {
    return null;
  }
}