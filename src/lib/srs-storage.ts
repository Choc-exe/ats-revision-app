"use client";

export type SrsRating = "again" | "good" | "easy";

export interface SrsCardRecord {
  cardId: string;
  subjectId: string;
  chapterId: string;
  intervalDays: number;
  dueTimestamp: number;
  reviews: number;
  lastRating: SrsRating;
}

export interface MistakeRecord {
  questionId: string;
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterTitle: string;
  questionText: string;
  correctAnswerText: string;
  keyFormula?: string;
  wrongCount: number;
  lastFailedAt: number;
}

const SRS_STORAGE_KEY = "ats-major-srs-v1";
const MISTAKES_STORAGE_KEY = "ats-major-mistakes-v1";

export function getSrsRecords(): Record<string, SrsCardRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function rateFlashcardSrs(params: {
  cardId: string;
  subjectId: string;
  chapterId: string;
  rating: SrsRating;
}): SrsCardRecord {
  const records = getSrsRecords();
  const existing = records[params.cardId];
  const prevInterval = existing?.intervalDays ?? 0;

  let nextIntervalDays = 1;
  if (params.rating === "again") {
    nextIntervalDays = 0; // À revoir immédiatement / aujourd'hui
  } else if (params.rating === "good") {
    nextIntervalDays = prevInterval <= 0 ? 2 : Math.min(30, prevInterval * 2);
  } else if (params.rating === "easy") {
    nextIntervalDays = prevInterval <= 0 ? 5 : Math.min(60, prevInterval * 3);
  }

  const dueTimestamp = Date.now() + nextIntervalDays * 24 * 60 * 60 * 1000;
  const updated: SrsCardRecord = {
    cardId: params.cardId,
    subjectId: params.subjectId,
    chapterId: params.chapterId,
    intervalDays: nextIntervalDays,
    dueTimestamp,
    reviews: (existing?.reviews ?? 0) + 1,
    lastRating: params.rating,
  };

  records[params.cardId] = updated;
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(records));
  } catch {}

  return updated;
}

export function getMistakesBook(): Record<string, MistakeRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MISTAKES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordQcmMistake(entry: Omit<MistakeRecord, "wrongCount" | "lastFailedAt">) {
  const book = getMistakesBook();
  const prev = book[entry.questionId];
  book[entry.questionId] = {
    ...entry,
    wrongCount: (prev?.wrongCount ?? 0) + 1,
    lastFailedAt: Date.now(),
  };
  try {
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(book));
  } catch {}
}

export function resolveQcmMistake(questionId: string) {
  const book = getMistakesBook();
  if (book[questionId]) {
    delete book[questionId];
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(book));
    } catch {}
  }
}