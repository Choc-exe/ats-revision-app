// Définition des matières officielles de la CPGE ATS Ingénierie Industrielle
export type SubjectId =
  | "physique-chimie"
  | "mathematiques"
  | "sii"
  | "informatique"
  | "francais-philosophie"
  | "anglais";
// Structure d'un chapitre dans le menu de navigation
export interface ChapterMeta {
  id: string;
  number: string;
  title: string;
  semester: 1 | 2;
}

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  shortTitle: string;
  chapters: ChapterMeta[];
}

// Schéma TypeScript pour le module Flashcards (flashcards.json)
export interface FlashcardItem {
  id: string;
  category: "Formule Critique" | "Théorème" | "Définition" | "Méthode" | "Piège Classique";
  difficulty: 1 | 2 | 3;
  front: string;
  back: {
    mainAnswer: string;
    criticalFormula?: string;
    mnemonicOrTip?: string;
  };
}

export interface FlashcardDeckData {
  chapterId: string;
  subject: SubjectId;
  title: string;
  cards: FlashcardItem[];
}

// Schéma TypeScript pour le module QCM (qcm.json)
export interface QcmOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface QcmQuestion {
  id: string;
  difficulty: "Application directe" | "Calculatoire" | "Type Concours";
  questionText: string;
  schemaRef?: string;
  options: QcmOption[];
  correctOptionId: "A" | "B" | "C" | "D";
  explanation: {
    steps: string[];
    keyFormula: string;
    commonTrap?: string;
  };
}

export interface QcmModuleData {
  chapterId: string;
  subject: SubjectId;
  title: string;
  questions: QcmQuestion[];
}