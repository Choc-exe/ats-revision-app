import { SubjectMeta } from "@/types/pedagogy";

export const ATS_CURRICULUM: SubjectMeta[] = [
  {
    id: "physique-chimie",
    title: "Physique-Chimie",
    shortTitle: "Physique",
    chapters: [
      { id: "01-mouvement-et-interactions", number: "01", title: "Mouvement et interactions", semester: 1 },
      { id: "02-energie-conversion-transferts", number: "02", title: "Énergie : conversion et transferts", semester: 1 },
      { id: "03-electrocinetique-regimes-sinusoidaux", number: "03", title: "Électrocinétique et régimes sinusoïdaux", semester: 1 },
      { id: "04-fluides-repos-ecoulement", number: "04", title: "Fluides au repos ou en écoulement", semester: 2 },
      { id: "05-transferts-thermiques", number: "05", title: "Transferts thermiques", semester: 2 },
      { id: "06-electromagnetisme", number: "06", title: "Électromagnétisme", semester: 2 },
      { id: "07-ondes", number: "07", title: "Ondes mécaniques et électromagnétiques", semester: 2 },
    ],
  },
  {
    id: "mathematiques",
    title: "Mathématiques",
    shortTitle: "Maths",
    chapters: [
      { id: "01-nombres-complexes", number: "01", title: "Nombres complexes et trigonométrie", semester: 1 },
      { id: "02-geometrie-plan-espace", number: "02", title: "Géométrie élémentaire du plan et de l'espace", semester: 1 },
      { id: "03-equations-differentielles", number: "03", title: "Équations différentielles linéaires", semester: 1 },
      { id: "04-systemes-lineaires-matrices", number: "04", title: "Systèmes linéaires et calcul matriciel", semester: 1 },
      { id: "05-espaces-vectoriels", number: "05", title: "Espaces vectoriels et applications linéaires", semester: 2 },
      { id: "06-reduction-endomorphismes", number: "06", title: " Déterminants et réduction d'endomorphismes", semester: 2 },
    ],
  },
  {
    id: "sii",
    title: "Sciences Industrielles (SII)",
    shortTitle: "SII",
    chapters: [
      { id: "01-systemes-asservis-slci", number: "01", title: "Systèmes asservis et modélisation SLCI", semester: 1 },
      { id: "02-cinematique-solide", number: "02", title: "Modélisation cinématique des mécanismes", semester: 1 },
      { id: "03-statique-dynamique-pfd", number: "03", title: "Actions mécaniques, Statique et PFD", semester: 2 },
      { id: "04-convertisseurs-machines", number: "04", title: "Modulateurs d'énergie et machines électriques", semester: 2 },
    ],
  },
  {
    id: "informatique",
    title: "Informatique (Python)",
    shortTitle: "Python",
    chapters: [
      { id: "01-bases-tableaux", number: "01", title: "Programmation impérative et tableaux 1D/2D", semester: 1 },
      { id: "02-algorithmique-numerique", number: "02", title: "Algorithmique numérique (Euler, Newton, Trapèzes)", semester: 2 },
    ],
  },
];
// Récupère une matière par son ID
export function getSubjectById(id: string) {
  return ATS_CURRICULUM.find((subject) => subject.id === id);
}

// Récupère un chapitre par l'ID de sa matière et son propre ID
export function getChapterById(subjectId: string, chapterId: string) {
  const subject = getSubjectById(subjectId);
  if (!subject) return undefined;
  
  return subject.chapters.find((chapter) => chapter.id === chapterId);
}