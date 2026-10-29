import { QcmQuestion } from "@/types/pedagogy";

export interface GeneratedExamItem {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  isDynamic?: boolean;
  question: QcmQuestion;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Construit un objet QcmQuestion normalisé en mélangeant aléatoirement les 4 choix
 * pour que la bonne réponse ne soit jamais au même endroit.
 */
function buildRandomizedQcm(params: {
  id: string;
  questionText: string;
  correctText: string;
  distractors: [string, string, string];
  steps: string[];
  keyFormula: string;
  commonTrap: string;
}): QcmQuestion {
  const letters = ["a", "b", "c", "d"] as const;

  const rawPool = [
    { text: params.correctText, isCorrect: true },
    { text: params.distractors[0], isCorrect: false },
    { text: params.distractors[1], isCorrect: false },
    { text: params.distractors[2], isCorrect: false },
  ];

  // Mélange de Fisher-Yates
  for (let i = rawPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = rawPool[i];
    rawPool[i] = rawPool[j];
    rawPool[j] = tmp;
  }

  const options = rawPool.map((item, idx) => ({
    id: letters[idx],
    label: letters[idx].toUpperCase(),
    text: item.text,
    isCorrect: item.isCorrect,
  }));

  const correctIndex = options.findIndex((o) => o.isCorrect);
  const correctOptionId = options[correctIndex]?.id ?? "a";

  return {
    id: params.id,
    difficulty: "Concours ATS",
    questionText: params.questionText,
    question: params.questionText,
    options,
    correctOptionId,
    correctIndex,
    explanation: {
      steps: params.steps,
      keyFormula: params.keyFormula,
      commonTrap: params.commonTrap,
    },
  } as unknown as QcmQuestion;
}

/**
 * Génère à la volée un lot complet de QCM calculatoires à valeurs aléatoires
 * couvrant Physique-Chimie, Mathématiques, SII et Informatique.
 */
export function generateDynamicQcmBank(seedCount: number = 1): GeneratedExamItem[] {
  const generated: GeneratedExamItem[] = [];

  for (let round = 1; round <= seedCount; round++) {
    const suffix = `${Date.now().toString(36)}-${round}`;

    // =========================================================================
    // 1. PHYSIQUE-CHIMIE : CHIMIE & COMBUSTION (Chapitre 08)
    // =========================================================================
    const nCh4 = randInt(2, 9);
    const nO2 = randInt(3, 15);
    const xMax = Math.min(nCh4, nO2 / 2);
    const trapSum = nCh4 + nO2;
    const trapNoStoech = Math.min(nCh4, nO2);
    const trapMax = Math.max(nCh4, nO2 / 2);

    generated.push({
      subjectId: "physique-chimie",
      subjectTitle: "Physique-Chimie & Expérimentation",
      chapterId: "08-structure-matiere-transformations",
      chapterNumber: "08",
      chapterTitle: "Structure de la matière, réactions chimiques, combustions et nucléaire",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-pc08-comb-${suffix}`,
        questionText: `[Calcul Dynamique] On réalise la combustion complète de $${nCh4}{,}0\\text{ mol}$ de méthane $\\text{CH}_4$ en présence de $${nO2}{,}0\\text{ mol}$ de dioxygène selon l'équation $\\text{CH}_4 + 2\\,\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}$. Que vaut l'avancement maximal $x_{\\max}$ ?`,
        correctText: `$x_{\\max} = ${xMax.toFixed(1).replace(".", "{,}")}\\text{ mol}$`,
        distractors: [
          `$x_{\\max} = ${(trapNoStoech === xMax ? xMax + 1.5 : trapNoStoech).toFixed(1).replace(".", "{,}")}\\text{ mol}$`,
          `$x_{\\max} = ${(trapMax === xMax ? xMax + 2.0 : trapMax).toFixed(1).replace(".", "{,}")}\\text{ mol}$`,
          `$x_{\\max} = ${trapSum.toFixed(1).replace(".", "{,}")}\\text{ mol}$`,
        ],
        steps: [
          `On compare les quotients stœchiométriques initiaux : $n_0(\\text{CH}_4)/1 = ${nCh4}\\text{ mol}$ et $n_0(\\text{O}_2)/2 = ${nO2}/2 = ${(nO2 / 2).toFixed(1).replace(".", "{,}")}\\text{ mol}$.`,
          `Le plus petit rapport détermine le réactif limitant et impose $x_{\\max} = \\min(${nCh4} \\; ; \\; ${(nO2 / 2).toFixed(1).replace(".", "{,}")}) = ${xMax.toFixed(1).replace(".", "{,}")}\\text{ mol}$.`,
        ],
        keyFormula: "x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)",
        commonTrap: "Oublier de diviser la quantité initiale de dioxygène par son coefficient stœchiométrique $\\nu = 2$.",
      }),
    });

    // =========================================================================
    // 2. PHYSIQUE-CHIMIE : INCERTITUDES & SCORE Z (Chapitre 09)
    // =========================================================================
    const uExp = pickRandom([0.04, 0.05, 0.08, 0.1]);
    const kFactor = pickRandom([1.2, 1.5, 1.8, 2.5, 3.0]);
    const gRef = 9.81;
    const gExp = +(gRef - uExp * kFactor).toFixed(3);
    const zVal = kFactor;
    const isCompat = zVal <= 2.0;

    generated.push({
      subjectId: "physique-chimie",
      subjectTitle: "Physique-Chimie & Expérimentation",
      chapterId: "09-mesures-incertitudes-regression",
      chapterNumber: "09",
      chapterTitle: "Mesures, incertitudes-types, régression linéaire et capacités expérimentales",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-pc09-zscore-${suffix}`,
        questionText: `[Calcul Dynamique] Lors d'un TP de mécanique, un étudiant mesure $g_{\\text{exp}} = ${gExp.toFixed(2).replace(".", "{,}")} \\pm ${uExp.toFixed(2).replace(".", "{,}")}\\text{ m}\\cdot\\text{s}^{-2}$. En prenant la valeur de référence $g_{\\text{réf}} = 9{,}81\\text{ m}\\cdot\\text{s}^{-2}$ (d'incertitude négligeable), que vaut l'écart normalisé $z$ et la mesure est-elle compatible ?`,
        correctText: `$z = ${zVal.toFixed(2).replace(".", "{,}")}$ (${isCompat ? "mesure compatible car $z \\le 2$" : "mesure incompatible car $z > 2$"})`,
        distractors: [
          `$z = ${zVal.toFixed(2).replace(".", "{,}")}$ (${!isCompat ? "mesure compatible" : "mesure incompatible"})`,
          `$z = ${(uExp * kFactor).toFixed(3).replace(".", "{,}")}$ (écart absolu confondu avec $z$)`,
          `$z = ${(1 / zVal).toFixed(2).replace(".", "{,}")}$ (rapport inversé)`,
        ],
        steps: [
          `On calcule l'écart absolu : $|g_{\\text{exp}} - g_{\\text{réf}}| = |${gExp.toFixed(2).replace(".", "{,}")} - 9{,}81| = ${(uExp * kFactor).toFixed(3).replace(".", "{,}")}\\text{ m}\\cdot\\text{s}^{-2}$.`,
          `On divise par l'incertitude-type $u(g_{\\text{exp}}) = ${uExp.toFixed(2).replace(".", "{,}")}$ : $z = ${zVal.toFixed(2).replace(".", "{,}")}$.`,
          `Critère de validation à $95\\,\\%$ : $z \\le 2 \\implies$ ${isCompat ? "Compatible" : "Incompatible"}.`,
        ],
        keyFormula: "z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{u(g_{\\text{exp}})} \\le 2",
        commonTrap: "Confondre l'écart absolu $|g_{\\text{exp}} - g_{\\text{réf}}|$ avec le score sans dimension $z$.",
      }),
    });

    // =========================================================================
    // 3. PHYSIQUE-CHIMIE : THERMODYNAMIQUE & CARNOT (Chapitre 02)
    // =========================================================================
    const tColdC = pickRandom([27, 77, 127]); // 300K, 350K, 400K
    const tColdK = tColdC + 273;
    const ratioK = pickRandom([2, 2.5, 4]);
    const tHotK = Math.round(tColdK * ratioK);
    const tHotC = tHotK - 273;
    const etaCarnotPct = +((1 - tColdK / tHotK) * 100).toFixed(1);
    const trapCelsiusPct = +((1 - tColdC / tHotC) * 100).toFixed(1);

    generated.push({
      subjectId: "physique-chimie",
      subjectTitle: "Physique-Chimie & Expérimentation",
      chapterId: "02-thermodynamique",
      chapterNumber: "02",
      chapterTitle: "Énergie : conversion et transferts (Thermodynamique)",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-pc02-carnot-${suffix}`,
        questionText: `[Calcul Dynamique] Un moteur thermique ditherme fonctionne entre une source froide à $\\theta_F = ${tColdC}\\,^\\circ\\text{C}$ et une source chaude à $\\theta_C = ${tHotC}\\,^\\circ\\text{C}$ (avec $T(\\text{K}) = \\theta(^\\circ\\text{C}) + 273$). Quel est son rendement maximal théorique de Carnot $\\eta_{\\max}$ ?`,
        correctText: `$\\eta_{\\max} = ${etaCarnotPct.toString().replace(".", "{,}")}\\,\\%$`,
        distractors: [
          `$\\eta_{\\max} = ${trapCelsiusPct.toString().replace(".", "{,}")}\\,\\%$`,
          `$\\eta_{\\max} = ${(100 - etaCarnotPct).toFixed(1).replace(".", "{,}")}\\,\\%$`,
          `$\\eta_{\\max} = ${((tHotK / tColdK - 1) * 100).toFixed(1).replace(".", "{,}")}\\,\\%$`,
        ],
        steps: [
          `On convertit obligatoirement les températures en Kelvins : $T_F = ${tColdC} + 273 = ${tColdK}\\text{ K}$ et $T_C = ${tHotC} + 273 = ${tHotK}\\text{ K}$.`,
          `D'après le théorème de Carnot : $\\eta_{\\max} = 1 - \\frac{T_F}{T_C} = 1 - \\frac{${tColdK}}{${tHotK}} = ${etaCarnotPct.toString().replace(".", "{,}")}\\,\\%$.`,
        ],
        keyFormula: "\\eta_{\\text{Carnot}} = 1 - \\frac{T_F(\\text{K})}{T_C(\\text{K})}",
        commonTrap: "Calculer $1 - \\theta_F / \\theta_C$ avec les températures en degrés Celsius au lieu des Kelvins !",
      }),
    });

    // =========================================================================
    // 4. MATHÉMATIQUES : SÉRIES DE FOURIER & PARSEVAL (Chapitre 10)
    // =========================================================================
    const a0 = randInt(2, 6);
    const a1 = randInt(2, 8);
    const b2 = randInt(2, 6);
    const uEffSquared = a0 * a0 + 0.5 * (a1 * a1 + b2 * b2);
    const trapNoHalf = a0 * a0 + a1 * a1 + b2 * b2;
    const trapLinear = a0 + a1 + b2;

    generated.push({
      subjectId: "mathematiques",
      subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
      chapterId: "10-series-numeriques-fourier",
      chapterNumber: "10",
      chapterTitle: "Séries numériques et Séries de Fourier",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-math10-parseval-${suffix}`,
        questionText: `[Calcul Dynamique] Un signal $T$-périodique admet pour développement en série de Fourier $s(t) = ${a0} + ${a1}\\cos(\\omega t) + ${b2}\\sin(2\\omega t)$. Que vaut le carré de sa valeur efficace $S_{\\text{eff}}^2 = \\frac{1}{T}\\int_0^T s(t)^2\\,\\mathrm{d}t$ d'après la formule de Parseval ?`,
        correctText: `$S_{\\text{eff}}^2 = ${uEffSquared.toString().replace(".", "{,}")}$`,
        distractors: [
          `$S_{\\text{eff}}^2 = ${trapNoHalf}$`,
          `$S_{\\text{eff}}^2 = ${(a0 + 0.5 * (a1 * a1 + b2 * b2)).toString().replace(".", "{,}")}$`,
          `$S_{\\text{eff}}^2 = ${trapLinear * trapLinear}$`,
        ],
        steps: [
          `D'après l'égalité de Parseval, la puissance moyenne vaut $S_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)$.`,
          `Ici $a_0^2 = ${a0}^2 = ${a0 * a0}$, et $\\frac{1}{2}(a_1^2 + b_2^2) = \\frac{1}{2}(${a1 * a1} + ${b2 * b2}) = ${(0.5 * (a1 * a1 + b2 * b2)).toString().replace(".", "{,}")}$.`,
          `La somme donne $S_{\\text{eff}}^2 = ${uEffSquared.toString().replace(".", "{,}")}$.`,
        ],
        keyFormula: "S_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)",
        commonTrap: "Oublier le facteur $1/2$ devant les carrés des amplitudes des harmoniques sinusoïdaux ($\\langle \\cos^2(n\\omega t) \\rangle = 1/2$).",
      }),
    });

    // =========================================================================
    // 5. MATHÉMATIQUES : DÉVELOPPEMENTS LIMITÉS & LIMITES (Chapitre 08)
    // =========================================================================
    const kParam = randInt(2, 6);
    const limExact = (kParam * kParam) / 2;

    generated.push({
      subjectId: "mathematiques",
      subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
      chapterId: "08-derivabilite-developpements-limites",
      chapterNumber: "08",
      chapterTitle: "Dérivabilité, Étude de fonctions et Développements limités (Taylor)",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-math08-dl-${suffix}`,
        questionText: `[Calcul Dynamique] À l'aide d'un développement limité à l'ordre 2 en $0$, déterminer la limite $\\ell = \\lim_{x \\to 0} \\frac{\\mathrm{e}^{${kParam}x} - 1 - ${kParam}\\sin(x)}{x^2}$.`,
        correctText: `$\\ell = ${limExact % 1 === 0 ? limExact : `\\frac{${kParam * kParam}}{2}`}$`,
        distractors: [
          `$\\ell = ${kParam * kParam}$`,
          `$\\ell = \\frac{${kParam}}{2}$`,
          `$\\ell = 0$`,
        ],
        steps: [
          `Au voisinage de $0$, $\\mathrm{e}^{${kParam}x} = 1 + ${kParam}x + \\frac{(${kParam}x)^2}{2} + o(x^2) = 1 + ${kParam}x + \\frac{${kParam * kParam}}{2}x^2 + o(x^2)$.`,
          `De plus, ${kParam}\\sin(x) = ${kParam}x + o(x^2)$.`,
          `Le numérateur équivaut donc à $\\frac{${kParam * kParam}}{2}x^2$, d'où $\\ell = ${limExact % 1 === 0 ? limExact : `\\frac{${kParam * kParam}}{2}`}$.`,
        ],
        keyFormula: "\\mathrm{e}^{u} = 1 + u + \\frac{u^2}{2!} + o(u^2) \\quad ; \\quad \\sin(x) = x - \\frac{x^3}{6} + o(x^3)",
        commonTrap: "Oublier d'élever le coefficient $${kParam}$ au carré dans $(${kParam}x)^2 / 2!$.",
      }),
    });

    // =========================================================================
    // 6. MATHÉMATIQUES : TRACE & DÉTERMINANT MATRICE 2x2 (Chapitre 06)
    // =========================================================================
    const vp1 = randInt(-3, 4);
    const vp2 = randInt(5, 9);
    const traceA = vp1 + vp2;
    const detA = vp1 * vp2;

    generated.push({
      subjectId: "mathematiques",
      subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
      chapterId: "06-reduction-endomorphismes",
      chapterNumber: "06",
      chapterTitle: "Réduction des endomorphismes et Diagonalisation",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-math06-vp-${suffix}`,
        questionText: `[Calcul Dynamique] Une matrice $A \\in \\mathcal{M}_2(\\mathbb{R})$ a pour trace $\\text{Tr}(A) = ${traceA}$ et pour déterminant $\\det(A) = ${detA}$. Quelles sont les deux valeurs propres $\\lambda_1, \\lambda_2$ de la matrice $A$ ?`,
        correctText: `$\\lambda_1 = ${vp1}$ et $\\lambda_2 = ${vp2}$`,
        distractors: [
          `$\\lambda_1 = ${-vp1}$ et $\\lambda_2 = ${-vp2}$`,
          `$\\lambda_1 = ${traceA}$ et $\\lambda_2 = ${detA}$`,
          `$\\lambda_1 = ${vp1 - 1}$ et $\\lambda_2 = ${vp2 + 1}$`,
        ],
        steps: [
          `Le polynôme caractéristique d'une matrice $2\\times 2$ s'écrit $\\chi_A(\\lambda) = \\lambda^2 - \\text{Tr}(A)\\,\\lambda + \\det(A) = \\lambda^2 - (${traceA})\\lambda + (${detA})$.`,
          `La somme des racines vaut $\\lambda_1 + \\lambda_2 = \\text{Tr}(A) = ${traceA}$ et leur produit vaut $\\lambda_1 \\cdot \\lambda_2 = \\det(A) = ${detA}$.`,
          `On identifie immédiatement $\\lambda_1 = ${vp1}$ et $\\lambda_2 = ${vp2}$.`,
        ],
        keyFormula: "\\chi_A(\\lambda) = \\lambda^2 - \\text{Tr}(A)\\,\\lambda + \\det(A)",
        commonTrap: "Se tromper de signe devant $\\text{Tr}(A)$ dans le polynôme caractéristique $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A)$.",
      }),
    });

    // =========================================================================
    // 7. SII : RÉSOLUTION D'UN CODEUR OPTIQUE & RÉDUCTEUR (Chapitre 05)
    // =========================================================================
    const pSlits = pickRandom([250, 500, 1000, 2000]);
    const redRatio = pickRandom([10, 20, 25, 50]);
    const totalPulsesOut = 4 * pSlits * redRatio;
    const degRes = +(360 / totalPulsesOut).toFixed(5);
    const trapNoQuad = +(360 / (pSlits * redRatio)).toFixed(5);
    const trapNoRed = +(360 / (4 * pSlits)).toFixed(4);

    generated.push({
      subjectId: "sii",
      subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
      chapterId: "05-ingenierie-systeme-conception-exp",
      chapterNumber: "05",
      chapterTitle: "Ingénierie Système (Exigences, SysML), Conception et Chaîne d'acquisition",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-sii05-encoder-${suffix}`,
        questionText: `[Calcul Dynamique] Un codeur incrémental de $P = ${pSlits}$ fentes/tour est monté sur l'arbre moteur en amont d'un réducteur de rapport $r = \\frac{\\omega_s}{\\omega_m} = \\frac{1}{${redRatio}}$. Les voies A et B sont exploitées en quadrature (4 fronts par fente). Quel est le nombre d'impulsions par tour de l'arbre de sortie et la résolution angulaire $\\Delta\\theta_s$ ?`,
        correctText: `$${totalPulsesOut}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${degRes.toString().replace(".", "{,}")}^\\circ$`,
        distractors: [
          `$${pSlits * redRatio}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${trapNoQuad.toString().replace(".", "{,}")}^\\circ$`,
          `$${4 * pSlits}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${trapNoRed.toString().replace(".", "{,}")}^\\circ$`,
          `$${(4 * pSlits) / redRatio}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${(trapNoRed * redRatio).toFixed(3).replace(".", "{,}")}^\\circ$`,
        ],
        steps: [
          `En quadrature (voies A et B), l'arbre moteur génère $4 \\times P = 4 \\times ${pSlits} = ${4 * pSlits}$ impulsions par tour moteur.`,
          `Comme le moteur effectue $${redRatio}$ tours pour $1$ tour de sortie, on compte $N_s = ${redRatio} \\times ${4 * pSlits} = ${totalPulsesOut}$ impulsions par tour de sortie.`,
          `La résolution angulaire en sortie vaut $\\Delta\\theta_s = \\frac{360^\\circ}{${totalPulsesOut}} = ${degRes.toString().replace(".", "{,}")}^\\circ$.`,
        ],
        keyFormula: "\\Delta\\theta_s = r \\cdot \\frac{360^\\circ}{4\\,P}",
        commonTrap: "Oublier le facteur 4 de la détection en quadrature ou diviser par le rapport de réduction au lieu de multiplier le nombre de points.",
      }),
    });

    // =========================================================================
    // 8. SII : ASSERVISSEMENTS & ERREUR STATIQUE (Chapitre 01)
    // =========================================================================
    const kOpen = pickRandom([3, 4, 7, 9, 19]);
    const eStep = pickRandom([10, 20, 50, 100]);
    const epsStat = +(eStep / (1 + kOpen)).toFixed(2);
    const trapKOnly = +(eStep / kOpen).toFixed(2);

    generated.push({
      subjectId: "sii",
      subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
      chapterId: "01-systemes-asservis-slci",
      chapterNumber: "01",
      chapterTitle: "Systèmes asservis (SLCI), Modélisation et Stabilité",
      isDynamic: true,
      question: buildRandomizedQcm({
        id: `dyn-sii01-stat-${suffix}`,
        questionText: `[Calcul Dynamique] Un système asservi à retour unitaire possède une FTBO de classe $0$ : $T(p) = \\frac{${kOpen}}{1 + 0{,}5\\,p}$. On lui applique une consigne en échelon d'amplitude $E_0 = ${eStep}$ ($E(p) = \\frac{${eStep}}{p}$). Que vaut l'erreur statique $\\varepsilon_s = \\lim_{t\\to+\\infty} \\varepsilon(t)$ ?`,
        correctText: `$\\varepsilon_s = ${epsStat.toString().replace(".", "{,}")}$`,
        distractors: [
          `$\\varepsilon_s = ${trapKOnly.toString().replace(".", "{,}")}$`,
          `$\\varepsilon_s = 0$`,
          `$\\varepsilon_s = ${(eStep * (kOpen / (1 + kOpen))).toFixed(2).replace(".", "{,}")}$`,
        ],
        steps: [
          `Le système est stable et de classe $\\alpha = 0$ (aucun intégrateur $1/p$ dans $T(p)$) avec un gain statique en boucle ouverte $K = ${kOpen}$.`,
          `D'après le théorème de la valeur finale : $\\varepsilon_s = \\lim_{p\\to 0} p\\,\\frac{E_0 / p}{1 + T(p)} = \\frac{E_0}{1 + K} = \\frac{${eStep}}{1 + ${kOpen}} = ${epsStat.toString().replace(".", "{,}")}$.`,
        ],
        keyFormula: "\\varepsilon_s = \\frac{E_0}{1 + K_{\\text{BO}}} \\quad (\\text{pour une FTBO de classe } \\alpha = 0)",
        commonTrap: "Diviser par $K$ au lieu de $1 + K$, ou croire que l'erreur statique est nulle sans intégrateur.",
      }),
    });
  }

  return generated;
}