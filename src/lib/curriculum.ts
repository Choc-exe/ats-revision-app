import { SubjectMeta } from "@/types/pedagogy";

export const ATS_CURRICULUM: SubjectMeta[] = [
  {
    id: "physique-chimie",
    title: "Physique-Chimie",
    shortTitle: "Physique",
    chapters: [
      { id: "01-mouvement-et-interactions", number: "A", title: "Mouvement et interactions", semester: 1 },
      { id: "02-energie-conversion-transferts", number: "B", title: "Énergie : conversion et transferts", semester: 1 },
      { id: "03-electrocinetique-regimes-sinusoidaux", number: "C", title: "Électrocinétique et régimes sinusoïdaux", semester: 1 },
      { id: "04-fluides-repos-ecoulement", number: "D", title: "Fluides au repos ou en écoulement", semester: 2 },
      { id: "05-transferts-thermiques", number: "E", title: "Transferts thermiques", semester: 2 },
      { id: "06-electromagnetisme", number: "F", title: "Électromagnétisme", semester: 2 },
      { id: "07-ondes", number: "G", title: "Ondes mécaniques et électromagnétiques", semester: 2 },
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