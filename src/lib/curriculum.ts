export interface ChapterMeta {
  id: string;
  number: string;
  title: string;
  semester?: number;
}

export interface SubjectMeta {
  id: string;
  title: string;
  shortTitle: string;
  chapters: ChapterMeta[];
}

export const ATS_CURRICULUM: SubjectMeta[] = [
  {
    id: "physique-chimie",
    title: "Physique-Chimie & Expérimentation",
    shortTitle: "Physique-Chimie",
    chapters: [
      { id: "01-mouvement-et-interactions", number: "01", semester: 1, title: "Mouvement et interactions (Mécanique du point)" },
      { id: "02-thermodynamique", number: "02", semester: 1, title: "Énergie : conversion et transferts (Thermodynamique)" },
      { id: "03-electrostatique-magnetostatique", number: "03", semester: 1, title: "Électrocinétique : régimes transitoires et sinusoïdaux" },
      { id: "04-statique-et-dynamique-des-fluides", number: "04", semester: 2, title: "Mécanique des fluides (Statique et Bernoulli)" },
      { id: "05-transferts-thermiques", number: "05", semester: 2, title: "Transferts thermiques (Conduction, Convection, Résistances)" },
      { id: "06-induction-electromagnetique", number: "06", semester: 2, title: "Induction électromagnétique et Conversion (Laplace)" },
      { id: "07-ondes-electromagnetiques", number: "07", semester: 2, title: "Ondes électromagnétiques et Propagation (OPPM)" },
      { id: "08-structure-matiere-transformations", number: "08", semester: 1, title: "Structure de la matière, réactions chimiques, combustions et nucléaire" },
      { id: "09-mesures-incertitudes-regression", number: "09", semester: 1, title: "Mesures, incertitudes-types, régression linéaire et capacités expérimentales" },
    ],
  },
  {
    id: "mathematiques",
    title: "Mathématiques (Algèbre, Analyse & Géométrie)",
    shortTitle: "Mathématiques",
    chapters: [
      { id: "01-nombres-complexes-trigonometrie", number: "01", semester: 1, title: "Nombres complexes et Trigonométrie" },
      { id: "02-geometrie-plan-espace", number: "02", semester: 1, title: "Géométrie du plan et de l'espace (Produit scalaire, vectoriel, déterminant)" },
      { id: "03-equations-differentielles", number: "03", semester: 1, title: "Équations différentielles linéaires (1er et 2nd ordre à coeff. constants)" },
      { id: "04-algebre-lineaire-matrices", number: "04", semester: 1, title: "Algèbre linéaire, Calcul matriciel et Systèmes" },
      { id: "05-espaces-vectoriels-applications", number: "05", semester: 2, title: "Espaces vectoriels et Applications linéaires" },
      { id: "06-reduction-endomorphismes", number: "06", semester: 2, title: "Réduction des endomorphismes et Diagonalisation" },
      { id: "07-suites-limites-continuite", number: "07", semester: 1, title: "Suites réelles, Limites et Continuité des fonctions" },
      { id: "08-derivabilite-developpements-limites", number: "08", semester: 1, title: "Dérivabilité, Étude de fonctions et Développements limités (Taylor)" },
      { id: "09-integration-segments-impropres", number: "09", semester: 2, title: "Intégration sur un segment, Primitives et Intégrales impropres" },
      { id: "10-series-numeriques-fourier", number: "10", semester: 2, title: "Séries numériques et Séries de Fourier" },
      { id: "11-fonctions-plusieurs-variables", number: "11", semester: 2, title: "Fonctions de plusieurs variables (Dérivées partielles, Gradient, Extremums)" },
    ],
  },
  {
    id: "sii",
    title: "Sciences Industrielles de l'Ingénieur (SII)",
    shortTitle: "Sciences Industrielles",
    chapters: [
      { id: "01-systemes-asservis-slci", number: "01", semester: 1, title: "Systèmes asservis (SLCI), Modélisation et Stabilité" },
      { id: "02-cinematique-mecanismes", number: "02", semester: 1, title: "Cinématique des solides et Fermetures géométriques" },
      { id: "03-statique-dynamique-rdm", number: "03", semester: 2, title: "Statique, Dynamique (PFS/PFD) et Résistance des Matériaux (RDM)" },
      { id: "04-conversion-energie-electrique", number: "04", semester: 2, title: "Électronique de puissance (Hacheurs, Onduleurs) et Machines (MCC, MAS)" },
      { id: "05-ingenierie-systeme-conception-exp", number: "05", semester: 1, title: "Ingénierie Système (Exigences, SysML), Conception et Chaîne d'acquisition" },
    ],
  },
  {
    id: "informatique",
    title: "Informatique & Algorithmique Numérique (Python)",
    shortTitle: "Informatique",
    chapters: [
      { id: "01-algorithmique-tableaux-tris", number: "01", semester: 1, title: "Programmation impérative, Tableaux 1D/2D, Tris et Complexité" },
      { id: "02-methodes-numeriques-analyse", number: "02", semester: 2, title: "Méthodes numériques : Dichotomie, Newton, Intégration et Euler" },
    ],
  },
  {
    id: "francais-philosophie",
    title: "Français-Philosophie (Expression & Culture Générale)",
    shortTitle: "Français-Philo",
    chapters: [
      { id: "01-methodologie-resume-dissertation", number: "01", semester: 1, title: "Méthodologie du Résumé de texte (contraction) et de la Dissertation" },
      { id: "02-themes-oeuvres-concours", number: "02", semester: 2, title: "Thèmes au programme officiel, Répertoire d'arguments et Citations clés" },
    ],
  },
  {
    id: "anglais",
    title: "Anglais Scientifique, Presse & Concours ATS",
    shortTitle: "Anglais ATS",
    chapters: [
      { id: "01-grammaire-structures-concours", number: "01", semester: 1, title: "Grammaire de haut niveau, Modaux, Passif et Structures idiomatiques" },
      { id: "02-methodologie-synthese-essay", number: "02", semester: 1, title: "Méthodologie de la Synthèse de dossier, de l'Essay et de la Khôlle audio" },
      { id: "03-vocabulaire-industrie-transition", number: "03", semester: 2, title: "Lexique de l'Ingénieur : Énergie, IA, Industrie 4.0 et Géopolitique" },
    ],
  },
];

export function getSubjectById(id: string) {
  return ATS_CURRICULUM.find((subject) => subject.id === id);
}

export function getChapterById(subjectId: string, chapterId: string) {
  const subject = getSubjectById(subjectId);
  if (!subject) return undefined;
  return (
    subject.chapters.find((chapter) => chapter.id === chapterId) ??
    subject.chapters.find(
      (chapter) => chapter.id.slice(0, 3) === chapterId.slice(0, 3)
    )
  );
}