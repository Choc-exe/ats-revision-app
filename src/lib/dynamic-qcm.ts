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

function fmt(n: number, decimals: number = 2): string {
  const fixed = Number(n.toFixed(decimals));
  return fixed.toString().replace(".", "{,}");
}

/**
 * Construit un objet QcmQuestion normalisé en garantissant que les 4 options
 * sont uniques et mélangées aléatoirement (Fisher-Yates).
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

  // Garantit qu'aucun distracteur n'est accidentellement identique à la bonne réponse
  const used = new Set<string>([params.correctText]);
  const safeDistractors = params.distractors.map((d, i) => {
    if (!used.has(d)) {
      used.add(d);
      return d;
    }
    const fallback = `${d} \\; (\\text{variante } ${i + 1})`;
    used.add(fallback);
    return fallback;
  });

  const rawPool = [
    { text: params.correctText, isCorrect: true },
    { text: safeDistractors[0], isCorrect: false },
    { text: safeDistractors[1], isCorrect: false },
    { text: safeDistractors[2], isCorrect: false },
  ];

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
 * Génère à la volée une banque complète de QCM paramétriques couvrant
 * tous les chapitres de Physique-Chimie, Mathématiques, SII, Informatique et Français.
 */
export function generateDynamicQcmBank(seedCount: number = 2): GeneratedExamItem[] {
  const generated: GeneratedExamItem[] = [];

  for (let round = 1; round <= seedCount; round++) {
    const suffix = `${Date.now().toString(36)}-${round}-${Math.random().toString(36).slice(2, 5)}`;

    // =========================================================================
    // PHYSIQUE-CHIMIE (CHAPITRES 01 À 09)
    // =========================================================================

    // PC 01 — Mécanique : Théorème de l'Énergie Cinétique & Ressort
    {
      const m = pickRandom([0.5, 1.0, 2.0, 4.0]);
      const v0 = randInt(2, 8);
      const kSpring = pickRandom([100, 200, 400, 800]);
      const ecInit = 0.5 * m * v0 * v0;
      const xMax = Math.sqrt((m * v0 * v0) / kSpring);

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "01-mouvement-et-interactions",
        chapterNumber: "01",
        chapterTitle: "Mouvement et interactions (Mécanique du point)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc01-tec-${suffix}`,
          questionText: `[Calcul Dynamique] Un palet de masse $m = ${fmt(m, 1)}\\text{ kg}$ glisse sans frottement sur un plan horizontal à la vitesse $v_0 = ${v0}\\text{ m}\\cdot\\text{s}^{-1}$ et comprime un ressort horizontal de raideur $k = ${kSpring}\\text{ N}\\cdot\\text{m}^{-1}$. Quelle est la compression maximale $\\Delta\\ell_{\\max}$ du ressort ?`,
          correctText: `$\\Delta\\ell_{\\max} = ${fmt(xMax, 3)}\\text{ m}$ (avec $E_{c,0} = ${fmt(ecInit, 1)}\\text{ J}$)`,
          distractors: [
            `$\\Delta\\ell_{\\max} = ${fmt((m * v0 * v0) / kSpring, 3)}\\text{ m}$ (oubli de la racine carrée)`,
            `$\\Delta\\ell_{\\max} = ${fmt(Math.sqrt((2 * m * v0 * v0) / kSpring), 3)}\\text{ m}$ (facteur $2$ mal placé)`,
            `$\\Delta\\ell_{\\max} = ${fmt((m * v0) / kSpring, 3)}\\text{ m}$ (quantité de mouvement confondue avec $E_c$)`,
          ],
          steps: [
            `Par conservation de l'énergie mécanique sur plan horizontal sans frottement : $E_{c,\\text{init}} = E_{p,\\text{élastique max}}$.`,
            `On a $\\frac{1}{2}m v_0^2 = \\frac{1}{2}k\\,\\Delta\\ell_{\\max}^2 \\implies \\Delta\\ell_{\\max} = v_0\\sqrt{\\frac{m}{k}}$.`,
            `Application numérique : $\\Delta\\ell_{\\max} = ${v0}\\sqrt{\\frac{${fmt(m, 1)}}{${kSpring}}} = ${fmt(xMax, 3)}\\text{ m}$.`,
          ],
          keyFormula: "\\frac{1}{2}m\\,v_0^2 = \\frac{1}{2}k\\,\\Delta\\ell_{\\max}^2 \\iff \\Delta\\ell_{\\max} = v_0\\sqrt{\\frac{m}{k}}",
          commonTrap: "Oublier de prendre la racine carrée lors de l'inversion de $\\Delta\\ell_{\\max}^2$.",
        }),
      });
    }

    // PC 02 — Thermodynamique : Cycle de Carnot
    {
      const tColdC = pickRandom([27, 77, 127]);
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
          questionText: `[Calcul Dynamique] Un moteur ditherme fonctionne entre une source froide à $\\theta_F = ${tColdC}\\,^\\circ\\text{C}$ et une source chaude à $\\theta_C = ${tHotC}\\,^\\circ\\text{C}$. Quel est son rendement maximal théorique de Carnot $\\eta_{\\max}$ ?`,
          correctText: `$\\eta_{\\max} = ${fmt(etaCarnotPct, 1)}\\,\\%$`,
          distractors: [
            `$\\eta_{\\max} = ${fmt(trapCelsiusPct, 1)}\\,\\%$ (calculé en $^\\circ\\text{C}$)`,
            `$\\eta_{\\max} = ${fmt(100 - etaCarnotPct, 1)}\\,\\%$ (rapport $T_F/T_C$ non soustrait à $1$)`,
            `$\\eta_{\\max} = ${fmt((tHotK / (tHotK - tColdK)) * 10, 1)}\\,\\%$ (confondu avec le COP d'une PAC)`,
          ],
          steps: [
            `Conversion impérative en Kelvins : $T_F = ${tColdC} + 273 = ${tColdK}\\text{ K}$ et $T_C = ${tHotC} + 273 = ${tHotK}\\text{ K}$.`,
            `Théorème de Carnot : $\\eta_{\\max} = 1 - \\frac{T_F}{T_C} = 1 - \\frac{${tColdK}}{${tHotK}} = ${fmt(etaCarnotPct, 1)}\\,\\%$.`,
          ],
          keyFormula: "\\eta_{\\text{Carnot}} = 1 - \\frac{T_F(\\text{K})}{T_C(\\text{K})}",
          commonTrap: "Utiliser les températures en degrés Celsius dans la formule de Carnot.",
        }),
      });
    }

    // PC 03 — Électrocinétique : Circuit RC & Énergie stockée
    {
      const rKohm = pickRandom([1, 2, 5, 10]); // kOhm
      const cMicroF = pickRandom([10, 20, 50, 100]); // uF
      const eVolt = pickRandom([10, 12, 20, 24]);
      const tauMs = rKohm * cMicroF; // kOhm * uF = ms
      const energyMj = 0.5 * cMicroF * eVolt * eVolt * 1e-3; // en mJ

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "03-electrostatique-magnetostatique",
        chapterNumber: "03",
        chapterTitle: "Électrocinétique : régimes transitoires et sinusoïdaux",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc03-rc-${suffix}`,
          questionText: `[Calcul Dynamique] Un condensateur de capacité $C = ${cMicroF}\\text{ }\\mu\\text{F}$ initialement déchargé est chargé à travers une résistance $R = ${rKohm}\\text{ k}\\Omega$ par un échelon de tension $E = ${eVolt}\\text{ V}$. Que valent la constante de temps $\\tau$ et l'énergie finale $E_C(\\infty)$ stockée dans le condensateur ?`,
          correctText: `$\\tau = ${tauMs}\\text{ ms}$ et $E_C(\\infty) = ${fmt(energyMj, 2)}\\text{ mJ}$`,
          distractors: [
            `$\\tau = ${tauMs}\\text{ s}$ et $E_C(\\infty) = ${fmt(energyMj * 2, 2)}\\text{ mJ}$`,
            `$\\tau = ${fmt(rKohm / cMicroF, 3)}\\text{ ms}$ et $E_C(\\infty) = ${fmt(0.5 * cMicroF * eVolt * 1e-3, 2)}\\text{ mJ}$`,
            `$\\tau = ${tauMs}\\text{ ms}$ et $E_C(\\infty) = ${fmt(energyMj * 2, 2)}\\text{ mJ}$ (oubli du facteur $1/2$)`,
          ],
          steps: [
            `Constante de temps : $\\tau = R \\cdot C = (${rKohm}\\times 10^3)\\times (${cMicroF}\\times 10^{-6}) = ${tauMs}\\times 10^{-3}\\text{ s} = ${tauMs}\\text{ ms}$.`,
            `En régime permanent ($t \\to \\infty$), $u_C(\\infty) = E = ${eVolt}\\text{ V}$, donc $E_C(\\infty) = \\frac{1}{2}C E^2 = 0{,}5 \\times ${cMicroF}\\cdot 10^{-6} \\times ${eVolt}^2 = ${fmt(energyMj, 2)}\\text{ mJ}$.`,
          ],
          keyFormula: "\\tau = R\\,C \\quad ; \\quad E_C = \\frac{1}{2}C\\,u_C^2",
          commonTrap: "Oublier le facteur $1/2$ dans l'énergie du condensateur (sachant que le générateur a fourni $C E^2$ dont la moitié a été dissipée par effet Joule dans $R$).",
        }),
      });
    }

    // PC 04 — Mécanique des fluides : Continuité & Bernoulli
    {
      const v1 = randInt(1, 3);
      const diamRatio = pickRandom([2, 3]); // D1 / D2
      const v2 = v1 * diamRatio * diamRatio; // S1/S2 = (D1/D2)^2
      const p1Bar = pickRandom([2.0, 3.0, 4.0]);
      const deltaPKpa = 0.5 * 1000 * (v2 * v2 - v1 * v1) * 1e-3; // en kPa
      const p2Kpa = p1Bar * 100 - deltaPKpa;

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "04-statique-et-dynamique-des-fluides",
        chapterNumber: "04",
        chapterTitle: "Mécanique des fluides (Statique et Bernoulli)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc04-bernoulli-${suffix}`,
          questionText: `[Calcul Dynamique] De l'eau (fluide parfait incompressible, $\\rho = 1000\\text{ kg}\\cdot\\text{m}^{-3}$) s'écoule horizontalement dans une conduite dont le diamètre est divisé par $${diamRatio}$ ($D_2 = D_1 / ${diamRatio}$). En entrée, $v_1 = ${v1}\\text{ m}\\cdot\\text{s}^{-1}$ et $P_1 = ${ p1Bar * 100 }\\text{ kPa}$. Que valent la vitesse $v_2$ et la pression $P_2$ dans l'étranglement ?`,
          correctText: `$v_2 = ${v2}\\text{ m}\\cdot\\text{s}^{-1}$ et $P_2 = ${fmt(p2Kpa, 1)}\\text{ kPa}$`,
          distractors: [
            `$v_2 = ${v1 * diamRatio}\\text{ m}\\cdot\\text{s}^{-1}$ et $P_2 = ${fmt(p1Bar * 100 - 0.5 * (v1 * diamRatio * v1 * diamRatio - v1 * v1), 1)}\\text{ kPa}$`,
            `$v_2 = ${v2}\\text{ m}\\cdot\\text{s}^{-1}$ et $P_2 = ${fmt(p1Bar * 100 + deltaPKpa, 1)}\\text{ kPa}$ (signe inversé dans Bernoulli)`,
            `$v_2 = ${fmt(v1 / (diamRatio * diamRatio), 2)}\\text{ m}\\cdot\\text{s}^{-1}$ et $P_2 = ${p1Bar * 100}\\text{ kPa}$`,
          ],
          steps: [
            `Par conservation du débit volumique $Q_v = S_1 v_1 = S_2 v_2$ : comme $S \\propto D^2$, diviser le diamètre par $${diamRatio}$ divise la section par $${diamRatio}^2 = ${diamRatio * diamRatio}$, donc $v_2 = ${diamRatio * diamRatio}\\,v_1 = ${v2}\\text{ m}\\cdot\\text{s}^{-1}$.`,
            `Par la relation de Bernoulli sur une ligne de courant horizontale ($z_1 = z_2$) : $P_2 = P_1 - \\frac{1}{2}\\rho(v_2^2 - v_1^2) = ${p1Bar * 100}\\text{ kPa} - ${fmt(deltaPKpa, 1)}\\text{ kPa} = ${fmt(p2Kpa, 1)}\\text{ kPa}$ (effet Venturi).`,
          ],
          keyFormula: "S_1 v_1 = S_2 v_2 \\implies v_2 = \\left(\\frac{D_1}{D_2}\\right)^2 v_1 \\quad ; \\quad P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2",
          commonTrap: "Multiplier la vitesse par $D_1/D_2$ au lieu de $(D_1/D_2)^2$, ou croire que la pression augmente dans un rétrécissement.",
        }),
      });
    }

    // PC 05 — Transferts thermiques : Résistance thermique & Flux
    {
      const eMm = pickRandom([5, 10, 20]); // épaisseur en mm
      const lambda = pickRandom([0.8, 1.0, 1.5]); // W.m-1.K-1 (verre/béton)
      const surface = pickRandom([2, 4, 5]); // m^2
      const deltaT = pickRandom([15, 20, 25]); // K
      const rTh = (eMm * 1e-3) / (lambda * surface);
      const phiWatt = deltaT / rTh;

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "05-transferts-thermiques",
        chapterNumber: "05",
        chapterTitle: "Transferts thermiques (Conduction, Convection, Résistances)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc05-fourier-${suffix}`,
          questionText: `[Calcul Dynamique] Une paroi plane d'épaisseur $e = ${eMm}\\text{ mm}$, de surface $S = ${surface}\\text{ m}^2$ et de conductivité thermique $\\lambda = ${fmt(lambda, 1)}\\text{ W}\\cdot\\text{m}^{-1}\\cdot\\text{K}^{-1}$ est soumise à un écart de température $\\Delta T = ${deltaT}\\text{ K}$ en régime stationnaire. Que valent sa résistance thermique conductive $R_{\\text{th}}$ et le flux thermique $\\Phi$ qui la traverse ?`,
          correctText: `$R_{\\text{th}} = ${fmt(rTh, 5)}\\text{ K}\\cdot\\text{W}^{-1}$ et $\\Phi = ${fmt(phiWatt, 0)}\\text{ W}$`,
          distractors: [
            `$R_{\\text{th}} = ${fmt(rTh * 1000, 2)}\\text{ K}\\cdot\\text{W}^{-1}$ et $\\Phi = ${fmt(phiWatt / 1000, 2)}\\text{ W}$ (épaisseur laissée en mm)`,
            `$R_{\\text{th}} = ${fmt((lambda * surface) / (eMm * 1e-3), 1)}\\text{ K}\\cdot\\text{W}^{-1}$ (formule inversée)`,
            `$R_{\\text{th}} = ${fmt(rTh * surface, 4)}\\text{ K}\\cdot\\text{W}^{-1}$ et $\\Phi = ${fmt(phiWatt / surface, 0)}\\text{ W}$ (densité de flux $\\varphi$ confondue avec $\\Phi$)`,
          ],
          steps: [
            `On convertit l'épaisseur en mètres : $e = ${eMm}\\times 10^{-3}\\text{ m}$.`,
            `La résistance thermique d'un mur plan vaut $R_{\\text{th}} = \\frac{e}{\\lambda \\cdot S} = \\frac{${eMm}\\cdot 10^{-3}}{${fmt(lambda, 1)} \\times ${surface}} = ${fmt(rTh, 5)}\\text{ K}\\cdot\\text{W}^{-1}$.`,
            `Le flux thermique vaut $\\Phi = \\frac{\\Delta T}{R_{\\text{th}}} = ${fmt(phiWatt, 0)}\\text{ W}$.`,
          ],
          keyFormula: "R_{\\text{th, cond}} = \\frac{e}{\\lambda\\,S} \\quad ; \\quad \\Phi = \\frac{T_1 - T_2}{R_{\\text{th}}}",
          commonTrap: "Oublier de convertir l'épaisseur $e$ de millimètres en mètres ($10^{-3}\\text{ m}$).",
        }),
      });
    }

    // PC 06 — Induction : Rail de Laplace & f.é.m. induite
    {
      const bTesla = pickRandom([0.5, 0.8, 1.2, 1.5]);
      const lengthM = pickRandom([0.2, 0.4, 0.5]);
      const vMs = randInt(4, 12);
      const rOhm = pickRandom([2, 4, 5]);
      const femAbs = bTesla * lengthM * vMs;
      const iAmp = femAbs / rOhm;
      const fLaplace = bTesla * iAmp * lengthM;

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "06-induction-electromagnetique",
        chapterNumber: "06",
        chapterTitle: "Induction électromagnétique et Conversion (Laplace)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc06-laplace-${suffix}`,
          questionText: `[Calcul Dynamique] Une barre conductrice de longueur $L = ${fmt(lengthM, 1)}\\text{ m}$ se déplace à la vitesse $v = ${vMs}\\text{ m}\\cdot\\text{s}^{-1}$ sur deux rails parallèles fermés sur une résistance $R = ${rOhm}\\text{ }\\Omega$, perpendiculairement à un champ magnétique uniforme $B = ${fmt(bTesla, 1)}\\text{ T}$. Que valent la valeur absolue de la f.é.m. induite $|e|$ et la norme de la force de freinage de Laplace $F_L$ ?`,
          correctText: `$|e| = ${fmt(femAbs, 2)}\\text{ V}$ et $F_L = ${fmt(fLaplace, 3)}\\text{ N}$`,
          distractors: [
            `$|e| = ${fmt(femAbs / rOhm, 2)}\\text{ V}$ et $F_L = ${fmt(femAbs, 2)}\\text{ N}$`,
            `$|e| = ${fmt(femAbs, 2)}\\text{ V}$ et $F_L = ${fmt(bTesla * iAmp, 3)}\\text{ N}$ (oubli de la longueur $L$ dans $B i L$)`,
            `$|e| = ${fmt(bTesla * vMs, 2)}\\text{ V}$ et $F_L = ${fmt(fLaplace * rOhm, 3)}\\text{ N}$`,
          ],
          steps: [
            `Par la loi de Faraday sur le flux coupé : $|e| = \\left|-\\frac{\\mathrm{d}\\Phi}{\\mathrm{d}t}\\right| = B\\,L\\,v = ${fmt(bTesla, 1)} \\times ${fmt(lengthM, 1)} \\times ${vMs} = ${fmt(femAbs, 2)}\\text{ V}$.`,
            `L'intensité induite vaut $I = \\frac{|e|}{R} = ${fmt(iAmp, 3)}\\text{ A}$.`,
            `La force de Laplace freinante a pour norme $F_L = B\\,I\\,L = \\frac{B^2 L^2 v}{R} = ${fmt(fLaplace, 3)}\\text{ N}$.`,
          ],
          keyFormula: "e = -B\\,L\\,v \\quad ; \\quad \\vec{F}_L = i\\,\\vec{L}\\wedge\\vec{B} \\implies F_L = \\frac{B^2 L^2 v}{R}",
          commonTrap: "Oublier que la longueur $L$ intervient deux fois dans l'expression de la force de freinage $F_L = \\frac{B^2 L^2 v}{R}$.",
        }),
      });
    }

    // PC 07 — Ondes électromagnétiques : Relation de dispersion & Vecteur de Poynting
    {
      const freqMhz = pickRandom([100, 150, 300, 600]);
      const lambdaM = 300 / freqMhz; // c = 3e8 m/s
      const kWave = (2 * Math.PI) / lambdaM;

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "07-ondes-electromagnetiques",
        chapterNumber: "07",
        chapterTitle: "Ondes électromagnétiques et Propagation (OPPM)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc07-oppm-${suffix}`,
          questionText: `[Calcul Dynamique] Une onde électromagnétique plane progressive monochromatique se propage dans le vide ($c = 3{,}00\\times 10^8\\text{ m}\\cdot\\text{s}^{-1}$) à la fréquence $f = ${freqMhz}\\text{ MHz}$. Que valent sa longueur d'onde $\\lambda$ et sa norme de vecteur d'onde $k$ ?`,
          correctText: `$\\lambda = ${fmt(lambdaM, 2)}\\text{ m}$ et $k = \\frac{2\\pi}{\\lambda} \\approx ${fmt(kWave, 2)}\\text{ rad}\\cdot\\text{m}^{-1}$`,
          distractors: [
            `$\\lambda = ${fmt(1 / lambdaM, 2)}\\text{ m}$ et $k \\approx ${fmt(2 * Math.PI * lambdaM, 2)}\\text{ rad}\\cdot\\text{m}^{-1}$`,
            `$\\lambda = ${fmt(lambdaM * 1000, 0)}\\text{ m}$ (oubli du facteur $10^6$ des MHz)`,
            `$\\lambda = ${fmt(lambdaM, 2)}\\text{ m}$ et $k = \\frac{1}{\\lambda} \\approx ${fmt(1 / lambdaM, 2)}\\text{ rad}\\cdot\\text{m}^{-1}$ (oubli du facteur $2\\pi$)`,
          ],
          steps: [
            `Dans le vide, la relation de dispersion $\\omega = c\\,k$ équivaut à $\\lambda = \\frac{c}{f} = \\frac{3{,}00\\times 10^8}{${freqMhz}\\times 10^6} = ${fmt(lambdaM, 2)}\\text{ m}$.`,
            `Le nombre d'onde angulaire vaut $k = \\frac{2\\pi}{\\lambda} \\approx ${fmt(kWave, 2)}\\text{ rad}\\cdot\\text{m}^{-1}$.`,
          ],
          keyFormula: "\\lambda = \\frac{c}{f} \\quad ; \\quad k = \\frac{2\\pi}{\\lambda} = \\frac{\\omega}{c} \\quad ; \\quad \\vec{B} = \\frac{\\vec{u} \\wedge \\vec{E}}{c}",
          commonTrap: "Confondre le nombre d'onde spectroscopique $\\sigma = 1/\\lambda$ avec la norme du vecteur d'onde $k = 2\\pi / \\lambda$.",
        }),
      });
    }

    // PC 08 & PC 09 (Déjà présents + enrichis)
    {
      const nCh4 = randInt(2, 9);
      const nO2 = randInt(3, 15);
      const xMax = Math.min(nCh4, nO2 / 2);

      generated.push({
        subjectId: "physique-chimie",
        subjectTitle: "Physique-Chimie & Expérimentation",
        chapterId: "08-structure-matiere-transformations",
        chapterNumber: "08",
        chapterTitle: "Structure de la matière, réactions chimiques, combustions et nucléaire",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-pc08-comb-${suffix}`,
          questionText: `[Calcul Dynamique] On brûle $${nCh4}{,}0\\text{ mol}$ de $\\text{CH}_4$ en présence de $${nO2}{,}0\\text{ mol}$ de $\\text{O}_2$ selon $\\text{CH}_4 + 2\\,\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}$. Que vaut l'avancement maximal $x_{\\max}$ ?`,
          correctText: `$x_{\\max} = ${fmt(xMax, 1)}\\text{ mol}$`,
          distractors: [
            `$x_{\\max} = ${fmt(Math.min(nCh4, nO2), 1)}\\text{ mol}$`,
            `$x_{\\max} = ${fmt(Math.max(nCh4, nO2 / 2), 1)}\\text{ mol}$`,
            `$x_{\\max} = ${fmt(nCh4 + nO2, 1)}\\text{ mol}$`,
          ],
          steps: [
            `On compare $n_0(\\text{CH}_4)/1 = ${nCh4}\\text{ mol}$ et $n_0(\\text{O}_2)/2 = ${fmt(nO2 / 2, 1)}\\text{ mol}$.`,
            `D'où $x_{\\max} = ${fmt(xMax, 1)}\\text{ mol}$.`,
          ],
          keyFormula: "x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)",
          commonTrap: "Oublier de diviser $n_0(\\text{O}_2)$ par son coefficient stœchiométrique $2$.",
        }),
      });
    }

    // =========================================================================
    // MATHÉMATIQUES (CHAPITRES 01 À 11)
    // =========================================================================

    // Math 01 — Nombres complexes : Module et Argument
    {
      const rMod = pickRandom([2, 4, 6]);
      const powerN = pickRandom([6, 9, 12]);
      const modPow = Math.pow(rMod, powerN);

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "01-nombres-complexes-trigonometrie",
        chapterNumber: "01",
        chapterTitle: "Nombres complexes et Trigonométrie",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math01-cplx-${suffix}`,
          questionText: `[Calcul Dynamique] Soit le nombre complexe $z = ${rMod}\\left(\\frac{\\sqrt{3}}{2} + \\frac{1}{2}\\mathrm{i}\\right)$. Que vaut $z^{${powerN}}$ sous forme algébrique grâce à la formule de Moivre ?`,
          correctText: `$z^{${powerN}} = ${(powerN / 6) % 2 === 0 ? "" : "-"}${rMod}^{${powerN}}$ (soit $${(powerN / 6) % 2 === 0 ? modPow : -modPow}$)`,
          distractors: [
            `$z^{${powerN}} = ${(powerN / 6) % 2 === 0 ? "-" : ""}${rMod}^{${powerN}}$ (erreur de parité sur $k\\pi$)`,
            `$z^{${powerN}} = ${rMod}^{${powerN}}\\,\\mathrm{i}$`,
            `$z^{${powerN}} = ${powerN * rMod}$`,
          ],
          steps: [
            `On reconnaît la forme trigonométrique : $\\frac{\\sqrt{3}}{2} + \\frac{1}{2}\\mathrm{i} = \\cos(\\pi/6) + \\mathrm{i}\\sin(\\pi/6) = \\mathrm{e}^{\\mathrm{i}\\pi/6}$, donc $z = ${rMod}\\,\\mathrm{e}^{\\mathrm{i}\\pi/6}$.`,
            `Par la formule de Moivre : $z^{${powerN}} = ${rMod}^{${powerN}}\\,\\mathrm{e}^{\\mathrm{i}\\frac{${powerN}\\pi}{6}} = ${rMod}^{${powerN}}\\,\\mathrm{e}^{\\mathrm{i}\\,${powerN / 6}\\pi} = ${(powerN / 6) % 2 === 0 ? "" : "-"}${rMod}^{${powerN}}$.`,
          ],
          keyFormula: "z = r\\,\\mathrm{e}^{\\mathrm{i}\\theta} \\implies z^n = r^n\\,\\mathrm{e}^{\\mathrm{i}n\\theta}",
          commonTrap: "Tenter de développer $(a + \\mathrm{i}b)^n$ par le binôme de Newton au lieu de passer sous forme exponentielle $r\\,\\mathrm{e}^{\\mathrm{i}\\theta}$.",
        }),
      });
    }

    // Math 02 — Géométrie dans l'espace : Distance d'un point à un plan
    {
      const x0 = randInt(1, 5);
      const y0 = randInt(-3, 4);
      const z0 = randInt(1, 6);
      const dConst = randInt(1, 8);
      // Plan 2x - 2y + z + d = 0 (norme du vecteur normal sqrt(4+4+1) = 3 !)
      const numAbs = Math.abs(2 * x0 - 2 * y0 + z0 + dConst);
      const distExact = numAbs / 3;

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "02-geometrie-plan-espace",
        chapterNumber: "02",
        chapterTitle: "Géométrie du plan et de l'espace (Produit scalaire, vectoriel, déterminant)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math02-plan-${suffix}`,
          questionText: `[Calcul Dynamique] Dans l'espace muni d'un repère orthonormé, quelle est la distance orthogonale $d(M_0, \\mathcal{P})$ du point $M_0(${x0}, ${y0}, ${z0})$ au plan $\\mathcal{P}$ d'équation $2x - 2y + z + ${dConst} = 0$ ?`,
          correctText: `$d(M_0, \\mathcal{P}) = \\frac{${numAbs}}{3} \\approx ${fmt(distExact, 2)}$`,
          distractors: [
            `$d(M_0, \\mathcal{P}) = \\frac{${numAbs}}{9} \\approx ${fmt(numAbs / 9, 2)}$ (oubli de la racine carrée sur $\\|\\vec{n}\\|$)`,
            `$d(M_0, \\mathcal{P}) = ${numAbs}$ (oubli de diviser par $\\|\\vec{n}\\|$)`,
            `$d(M_0, \\mathcal{P}) = \\frac{${Math.abs(2 * x0 - 2 * y0 + z0)}}{3}$ (oubli de la constante $+${dConst}$)`,
          ],
          steps: [
            `Un vecteur normal au plan $\\mathcal{P}$ est $\\vec{n}(2, -2, 1)$, de norme $\\|\\vec{n}\\| = \\sqrt{2^2 + (-2)^2 + 1^2} = \\sqrt{9} = 3$.`,
            `Par la formule de la distance d'un point à un plan : $d(M_0, \\mathcal{P}) = \\frac{|2(${x0}) - 2(${y0}) + (${z0}) + ${dConst}|}{3} = \\frac{${numAbs}}{3}$.`,
          ],
          keyFormula: "d(M_0, \\mathcal{P}) = \\frac{|a x_0 + b y_0 + c z_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}",
          commonTrap: "Diviser par $a^2 + b^2 + c^2$ au lieu de $\\sqrt{a^2 + b^2 + c^2}$.",
        }),
      });
    }

    // Math 03 — Équations différentielles du second ordre
    {
      const r1 = randInt(1, 3);
      const r2 = randInt(4, 7);
      const sumR = r1 + r2;
      const prodR = r1 * r2;

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "03-equations-differentielles",
        chapterNumber: "03",
        chapterTitle: "Équations différentielles linéaires (1er et 2nd ordre à coeff. constants)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math03-edl2-${suffix}`,
          questionText: `[Calcul Dynamique] Quelle est la forme générale des solutions réelles de l'équation différentielle homogène $y'' - ${sumR}y' + ${prodR}y = 0$ sur $\\mathbb{R}$ ?`,
          correctText: `$y(x) = A\\,\\mathrm{e}^{${r1}x} + B\\,\\mathrm{e}^{${r2}x}$ avec $(A, B) \\in \\mathbb{R}^2$`,
          distractors: [
            `$y(x) = A\\,\\mathrm{e}^{-${r1}x} + B\\,\\mathrm{e}^{-${r2}x}$`,
            `$y(x) = (A x + B)\\,\\mathrm{e}^{${r1}x}$`,
            `$y(x) = A\\cos(${r1}x) + B\\sin(${r2}x)$`,
          ],
          steps: [
            `L'équation caractéristique associée est $r^2 - ${sumR}r + ${prodR} = 0$.`,
            `La somme des racines vaut $${sumR}$ et leur produit vaut $${prodR}$, donc les deux racines réelles distinctes sont $r_1 = ${r1}$ et $r_2 = ${r2}$.`,
            `Les solutions générales sont de la forme $y(x) = A\\,\\mathrm{e}^{${r1}x} + B\\,\\mathrm{e}^{${r2}x}$.`,
          ],
          keyFormula: "a r^2 + b r + c = 0 \\; (\\Delta > 0) \\implies y_H(x) = A\\,\\mathrm{e}^{r_1 x} + B\\,\\mathrm{e}^{r_2 x}",
          commonTrap: "Inverser le signe des racines caractéristiques en factorisant $(r - r_1)(r - r_2)$.",
        }),
      });
    }

    // Math 06 — Diagonalisation, Trace et Déterminant
    {
      const vp1 = randInt(-4, 3);
      const vp2 = randInt(4, 9);
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
          questionText: `[Calcul Dynamique] Une matrice $A \\in \\mathcal{M}_2(\\mathbb{R})$ a pour trace $\\text{Tr}(A) = ${traceA}$ et pour déterminant $\\det(A) = ${detA}$. Quelles sont ses valeurs propres $\\lambda_1, \\lambda_2$ ?`,
          correctText: `$\\lambda_1 = ${vp1}$ et $\\lambda_2 = ${vp2}$`,
          distractors: [
            `$\\lambda_1 = ${-vp1}$ et $\\lambda_2 = ${-vp2}$`,
            `$\\lambda_1 = ${traceA}$ et $\\lambda_2 = ${detA}$`,
            `$\\lambda_1 = ${vp1 - 1}$ et $\\lambda_2 = ${vp2 + 1}$`,
          ],
          steps: [
            `On résout $\\chi_A(\\lambda) = \\lambda^2 - \\text{Tr}(A)\\,\\lambda + \\det(A) = \\lambda^2 - (${traceA})\\lambda + (${detA}) = 0$.`,
            `Comme $\\lambda_1 + \\lambda_2 = ${traceA}$ et $\\lambda_1 \\lambda_2 = ${detA}$, on trouve $\\lambda_1 = ${vp1}$ et $\\lambda_2 = ${vp2}$.`,
          ],
          keyFormula: "\\text{Tr}(A) = \\sum \\lambda_i \\quad ; \\quad \\det(A) = \\prod \\lambda_i",
          commonTrap: "Écrire $\\lambda^2 + \\text{Tr}(A)\\lambda + \\det(A)$ au lieu de $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A)$.",
        }),
      });
    }

    // Math 08 — Développements Limités
    {
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
          questionText: `[Calcul Dynamique] Que vaut la limite $\\ell = \\lim_{x \\to 0} \\frac{\\mathrm{e}^{${kParam}x} - 1 - ${kParam}\\sin(x)}{x^2}$ ?`,
          correctText: `$\\ell = ${limExact % 1 === 0 ? limExact : `\\frac{${kParam * kParam}}{2}`}$`,
          distractors: [
            `$\\ell = ${kParam * kParam}$`,
            `$\\ell = \\frac{${kParam}}{2}$`,
            `$\\ell = 0$`,
          ],
          steps: [
            `$\\mathrm{e}^{${kParam}x} = 1 + ${kParam}x + \\frac{${kParam * kParam}}{2}x^2 + o(x^2)$ et ${kParam}\\sin(x) = ${kParam}x + o(x^2)$.`,
            `Le numérateur équivaut à $\\frac{${kParam * kParam}}{2}x^2$, d'où $\\ell = ${limExact % 1 === 0 ? limExact : `\\frac{${kParam * kParam}}{2}`}$.`,
          ],
          keyFormula: "\\mathrm{e}^u = 1 + u + \\frac{u^2}{2!} + o(u^2)",
          commonTrap: "Oublier d'élever le coefficient $${kParam}$ au carré dans $(${kParam}x)^2 / 2!$.",
        }),
      });
    }

    // Math 09 — Intégrales impropres
    {
      const lambdaExp = randInt(2, 9);
      const ampA = randInt(3, 12);

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "09-integration-segments-impropres",
        chapterNumber: "09",
        chapterTitle: "Intégration sur un segment, Primitives et Intégrales impropres",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math09-int-${suffix}`,
          questionText: `[Calcul Dynamique] Calculer la valeur de l'intégrale impropre convergente $I = \\int_0^{+\\infty} ${ampA}\\,\\mathrm{e}^{-${lambdaExp}t}\\,\\mathrm{d}t$.`,
          correctText: `$I = \\frac{${ampA}}{${lambdaExp}} \\approx ${fmt(ampA / lambdaExp, 2)}$`,
          distractors: [
            `$I = ${ampA * lambdaExp}$`,
            `$I = -\\frac{${ampA}}{${lambdaExp}}$`,
            `$I = \\frac{${ampA}}{${lambdaExp}^2}$`,
          ],
          steps: [
            `Une primitive de $t \\mapsto ${ampA}\\,\\mathrm{e}^{-${lambdaExp}t}$ est $F(t) = -\\frac{${ampA}}{${lambdaExp}}\\,\\mathrm{e}^{-${lambdaExp}t}$.`,
            `Comme $\\lim_{t\\to+\\infty} \\mathrm{e}^{-${lambdaExp}t} = 0$ (car $${lambdaExp} > 0$) et $F(0) = -\\frac{${ampA}}{${lambdaExp}}$, on obtient $I = 0 - F(0) = \\frac{${ampA}}{${lambdaExp}}$.`,
          ],
          keyFormula: "\\int_0^{+\\infty} \\mathrm{e}^{-\\lambda t}\\,\\mathrm{d}t = \\frac{1}{\\lambda} \\quad (\\lambda > 0)",
          commonTrap: "Multiplier par $\\lambda$ au lieu de diviser lors de la recherche de primitive, ou inverser les bornes $0$ et $+\\infty$.",
        }),
      });
    }

    // Math 10 — Séries de Fourier & Parseval
    {
      const a0 = randInt(2, 6);
      const a1 = randInt(2, 8);
      const b2 = randInt(2, 6);
      const uEffSquared = a0 * a0 + 0.5 * (a1 * a1 + b2 * b2);

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "10-series-numeriques-fourier",
        chapterNumber: "10",
        chapterTitle: "Séries numériques et Séries de Fourier",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math10-parseval-${suffix}`,
          questionText: `[Calcul Dynamique] Pour le signal périodique $s(t) = ${a0} + ${a1}\\cos(\\omega t) + ${b2}\\sin(2\\omega t)$, que vaut le carré de la valeur efficace $S_{\\text{eff}}^2$ d'après la formule de Parseval ?`,
          correctText: `$S_{\\text{eff}}^2 = ${fmt(uEffSquared, 1)}$`,
          distractors: [
            `$S_{\\text{eff}}^2 = ${a0 * a0 + a1 * a1 + b2 * b2}$`,
            `$S_{\\text{eff}}^2 = ${fmt(a0 + 0.5 * (a1 * a1 + b2 * b2), 1)}$`,
            `$S_{\\text{eff}}^2 = ${(a0 + a1 + b2) * (a0 + a1 + b2)}$`,
          ],
          steps: [
            `Égalité de Parseval : $S_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}(a_1^2 + b_2^2) = ${a0}^2 + \\frac{1}{2}(${a1}^2 + ${b2}^2) = ${fmt(uEffSquared, 1)}$.`,
          ],
          keyFormula: "S_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)",
          commonTrap: "Oublier le facteur $1/2$ devant les carrés des amplitudes des harmoniques.",
        }),
      });
    }

    // Math 11 — Fonctions de plusieurs variables & Critère de Monge (rt - s^2)
    {
      const aCoeff = randInt(2, 5); // r = 2a > 0
      const bCoeff = randInt(1, 3); // s = 2b
      const cCoeff = randInt(3, 6); // t = 2c
      const r = 2 * aCoeff;
      const s = 2 * bCoeff;
      const t = 2 * cCoeff;
      const deltaMonge = r * t - s * s;

      generated.push({
        subjectId: "mathematiques",
        subjectTitle: "Mathématiques (Algèbre, Analyse & Géométrie)",
        chapterId: "11-fonctions-plusieurs-variables",
        chapterNumber: "11",
        chapterTitle: "Fonctions de plusieurs variables (Dérivées partielles, Gradient, Extremums)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-math11-monge-${suffix}`,
          questionText: `[Calcul Dynamique] Soit $f(x, y) = ${aCoeff}x^2 + ${2 * bCoeff}xy + ${cCoeff}y^2$. Que vaut le déterminant hessien $rt - s^2$ au point critique $(0, 0)$ et quelle est la nature de ce point ?`,
          correctText: `$rt - s^2 = ${deltaMonge} > 0$ et $r = ${r} > 0$ : c'est un minimum local strict`,
          distractors: [
            `$rt - s^2 = ${deltaMonge} > 0$ et $r = ${r} > 0$ : c'est un maximum local strict`,
            `$rt - s^2 = ${aCoeff * cCoeff - bCoeff * bCoeff}$ (oubli du facteur $2$ des dérivées secondes)`,
            `$rt - s^2 = ${r * t + s * s}$ : c'est un point col (point selle)`,
          ],
          steps: [
            `On calcule les dérivées partielles secondes : $r = \\frac{\\partial^2 f}{\\partial x^2} = ${r}$, $s = \\frac{\\partial^2 f}{\\partial x \\partial y} = ${s}$ et $t = \\frac{\\partial^2 f}{\\partial y^2} = ${t}$.`,
            `On forme $rt - s^2 = ${r}\\times ${t} - ${s}^2 = ${deltaMonge} > 0$. Comme $r = ${r} > 0$, $(0,0)$ est un minimum local strict.`,
          ],
          keyFormula: "\\Delta = r\\,t - s^2 > 0 \\text{ et } r > 0 \\implies \\text{Minimum local}",
          commonTrap: "Confondre les coefficients du polynôme $(a, c)$ avec les dérivées secondes $(r = 2a, t = 2c)$.",
        }),
      });
    }

    // =========================================================================
    // SCIENCES INDUSTRIELLES DE L'INGÉNIEUR — SII (CHAPITRES 01 À 05)
    // =========================================================================

    // SII 01 — SLCI : Erreur statique
    {
      const kOpen = pickRandom([3, 4, 7, 9, 19]);
      const eStep = pickRandom([10, 20, 50, 100]);
      const epsStat = +(eStep / (1 + kOpen)).toFixed(2);

      generated.push({
        subjectId: "sii",
        subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
        chapterId: "01-systemes-asservis-slci",
        chapterNumber: "01",
        chapterTitle: "Systèmes asservis (SLCI), Modélisation et Stabilité",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-sii01-stat-${suffix}`,
          questionText: `[Calcul Dynamique] Un système bouclé à retour unitaire de FTBO $T(p) = \\frac{${kOpen}}{1 + 0{,}2\\,p}$ est soumis à un échelon de consigne d'amplitude $E_0 = ${eStep}$. Que vaut l'erreur statique $\\varepsilon_s$ en régime permanent ?`,
          correctText: `$\\varepsilon_s = ${fmt(epsStat, 2)}$`,
          distractors: [
            `$\\varepsilon_s = ${fmt(eStep / kOpen, 2)}$`,
            `$\\varepsilon_s = 0$`,
            `$\\varepsilon_s = ${fmt((eStep * kOpen) / (1 + kOpen), 2)}$ (valeur finale de la sortie confondue avec l'erreur)`,
          ],
          steps: [
            `FTBO de classe $\\alpha = 0$ (pas d'intégrateur) : $\\varepsilon_s = \\frac{E_0}{1 + K} = \\frac{${eStep}}{1 + ${kOpen}} = ${fmt(epsStat, 2)}$.`,
          ],
          keyFormula: "\\varepsilon_s = \\frac{E_0}{1 + K_{\\text{BO}}}",
          commonTrap: "Confondre la valeur finale de la sortie $s(\\infty) = \\frac{K}{1+K}E_0$ avec l'erreur $\\varepsilon(\\infty) = E_0 - s(\\infty) = \\frac{E_0}{1+K}$.",
        }),
      });
    }

    // SII 02 — Cinématique : Train d'engrenages & Loi entrée-sortie
    {
      const z1 = pickRandom([15, 20, 24]);
      const z2 = pickRandom([60, 75, 96]);
      const n1Rpm = pickRandom([1200, 1500, 3000]);
      const ratioR = z1 / z2;
      const n2Rpm = n1Rpm * ratioR;
      const omega2Rad = (n2Rpm * 2 * Math.PI) / 60;

      generated.push({
        subjectId: "sii",
        subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
        chapterId: "02-cinematique-mecanismes",
        chapterNumber: "02",
        chapterTitle: "Cinématique des solides et Fermetures géométriques",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-sii02-gear-${suffix}`,
          questionText: `[Calcul Dynamique] Un pignon moteur de $Z_1 = ${z1}$ dents tournant à $N_1 = ${n1Rpm}\\text{ tr/min}$ engrène avec une roue de $Z_2 = ${z2}$ dents. Que valent la fréquence de rotation $N_2$ (en $\\text{tr/min}$) et la vitesse angulaire $\\omega_2$ (en $\\text{rad}\\cdot\\text{s}^{-1}$) de la roue de sortie ?`,
          correctText: `$N_2 = ${fmt(n2Rpm, 0)}\\text{ tr/min}$ et $\\omega_2 \\approx ${fmt(omega2Rad, 1)}\\text{ rad}\\cdot\\text{s}^{-1}$`,
          distractors: [
            `$N_2 = ${fmt(n1Rpm / ratioR, 0)}\\text{ tr/min}$ (rapport $Z_2/Z_1$ inversé)`,
            `$N_2 = ${fmt(n2Rpm, 0)}\\text{ tr/min}$ et $\\omega_2 = ${fmt(n2Rpm / 60, 1)}\\text{ rad}\\cdot\\text{s}^{-1}$ (oubli du facteur $2\\pi$)`,
            `$N_2 = ${fmt(n2Rpm, 0)}\\text{ tr/min}$ et $\\omega_2 \\approx ${fmt(n2Rpm * 2 * Math.PI, 0)}\\text{ rad}\\cdot\\text{s}^{-1}$ (oubli de diviser par $60$)`,
          ],
          steps: [
            `Le rapport de réduction vaut $r = \\frac{N_2}{N_1} = \\frac{Z_1}{Z_2} = \\frac{${z1}}{${z2}} = ${fmt(ratioR, 3)}$.`,
            `On en déduit $N_2 = ${n1Rpm} \\times \\frac{${z1}}{${z2}} = ${fmt(n2Rpm, 0)}\\text{ tr/min}$.`,
            `Conversion en $\\text{rad}\\cdot\\text{s}^{-1}$ : $\\omega_2 = \\frac{2\\pi\\,N_2}{60} \\approx ${fmt(omega2Rad, 1)}\\text{ rad}\\cdot\\text{s}^{-1}$.`,
          ],
          keyFormula: "\\frac{\\omega_2}{\\omega_1} = \\frac{N_2}{N_1} = \\frac{Z_1}{Z_2} \\quad ; \\quad \\omega = \\frac{2\\pi\\,N}{60}",
          commonTrap: "Inverser le rapport menant/mené ($Z_1/Z_2$) ou oublier de multiplier par $2\\pi/60$ pour passer des $\\text{tr/min}$ aux $\\text{rad/s}$.",
        }),
      });
    }

    // SII 04 — Conversion d'énergie : Hacheur série & Machine à Courant Continu (MCC)
    {
      const uSupply = pickRandom([24, 48, 100, 200]);
      const alphaDuty = pickRandom([0.25, 0.4, 0.6, 0.75]);
      const rArmature = pickRandom([0.5, 1.0, 2.0]);
      const iCurrent = randInt(2, 8);
      const uMean = alphaDuty * uSupply;
      const eBackEmf = uMean - rArmature * iCurrent;

      generated.push({
        subjectId: "sii",
        subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
        chapterId: "04-conversion-energie-electrique",
        chapterNumber: "04",
        chapterTitle: "Électronique de puissance (Hacheurs, Onduleurs) et Machines (MCC, MAS)",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-sii04-mcc-${suffix}`,
          questionText: `[Calcul Dynamique] Un hacheur série alimenté sous $U_{\\text{alim}} = ${uSupply}\\text{ V}$ commande avec un rapport cyclique $\\alpha = ${fmt(alphaDuty, 2)}$ une machine à courant continu (MCC) de résistance d'induit $R = ${fmt(rArmature, 1)}\\text{ }\\Omega$ absorbant un courant moyen $I = ${iCurrent}\\text{ A}$. Que valent la tension moyenne d'induit $\\langle u \\rangle$ et la force contre-électromotrice $E$ ?`,
          correctText: `$\\langle u \\rangle = ${fmt(uMean, 1)}\\text{ V}$ et $E = ${fmt(eBackEmf, 1)}\\text{ V}$`,
          distractors: [
            `$\\langle u \\rangle = ${fmt(uMean, 1)}\\text{ V}$ et $E = ${fmt(uMean + rArmature * iCurrent, 1)}\\text{ V}$ (signe $+RI$ au lieu de $-RI$)`,
            `$\\langle u \\rangle = ${fmt((1 - alphaDuty) * uSupply, 1)}\\text{ V}$ et $E = ${fmt((1 - alphaDuty) * uSupply - rArmature * iCurrent, 1)}\\text{ V}$`,
            `$\\langle u \\rangle = ${uSupply}\\text{ V}$ et $E = ${fmt(uSupply - rArmature * iCurrent, 1)}\\text{ V}$`,
          ],
          steps: [
            `En conduction continue, la valeur moyenne de la tension en sortie d'un hacheur série vaut $\\langle u \\rangle = \\alpha\\,U_{\\text{alim}} = ${fmt(alphaDuty, 2)} \\times ${uSupply} = ${fmt(uMean, 1)}\\text{ V}$.`,
            `En régime permanent, la loi des mailles sur l'induit en convention récepteur donne $\\langle u \\rangle = E + R\\,I$, soit $E = \\langle u \\rangle - R\\,I = ${fmt(uMean, 1)} - ${fmt(rArmature * iCurrent, 1)} = ${fmt(eBackEmf, 1)}\\text{ V}$.`,
          ],
          keyFormula: "\\langle u \\rangle = \\alpha\\,U_{\\text{alim}} = E + R\\,I \\quad \\text{avec} \\quad E = k_\\Phi\\,\\Omega",
          commonTrap: "Écrire $E = U + R I$ (convention générateur) alors que la MCC fonctionne en moteur (récepteur : $E = U - R I$).",
        }),
      });
    }

    // SII 05 — Chaîne d'acquisition : CAN & Codeur
    {
      const pSlits = pickRandom([250, 500, 1000, 2000]);
      const redRatio = pickRandom([10, 20, 25, 50]);
      const totalPulsesOut = 4 * pSlits * redRatio;
      const degRes = +(360 / totalPulsesOut).toFixed(5);

      generated.push({
        subjectId: "sii",
        subjectTitle: "Sciences Industrielles de l'Ingénieur (SII)",
        chapterId: "05-ingenierie-systeme-conception-exp",
        chapterNumber: "05",
        chapterTitle: "Ingénierie Système (Exigences, SysML), Conception et Chaîne d'acquisition",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-sii05-encoder-${suffix}`,
          questionText: `[Calcul Dynamique] Un codeur incrémental de $P = ${pSlits}$ fentes/tour est monté côté moteur devant un réducteur de rapport $r = 1/${redRatio}$. En quadrature (voies A et B), quel est le nombre d'impulsions par tour de sortie et la résolution $\\Delta\\theta_s$ ?`,
          correctText: `$${totalPulsesOut}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${fmt(degRes, 5)}^\\circ$`,
          distractors: [
            `$${pSlits * redRatio}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${fmt(360 / (pSlits * redRatio), 5)}^\\circ$`,
            `$${4 * pSlits}\\text{ imp/tr}$ soit $\\Delta\\theta_s = ${fmt(360 / (4 * pSlits), 4)}^\\circ$`,
            `$${(4 * pSlits) / redRatio}\\text{ imp/tr}$`,
          ],
          steps: [
            `Impulsions par tour de sortie : $N_s = 4 \\times P \\times ${redRatio} = ${totalPulsesOut}$, soit $\\Delta\\theta_s = 360^\\circ / ${totalPulsesOut} = ${fmt(degRes, 5)}^\\circ$.`,
          ],
          keyFormula: "\\Delta\\theta_s = r \\cdot \\frac{360^\\circ}{4\\,P}",
          commonTrap: "Oublier le facteur 4 de la quadrature A/B.",
        }),
      });
    }

    // =========================================================================
    // INFORMATIQUE PYTHON (CHAPITRES 01 ET 02)
    // =========================================================================

    // Info 01 — Recherche dichotomique : Nombre d'étapes en log2(N)
    {
      const kPow = randInt(8, 14); // 256 à 16384
      const nSize = Math.pow(2, kPow);

      generated.push({
        subjectId: "informatique",
        subjectTitle: "Informatique & Algorithmique Numérique (Python)",
        chapterId: "01-algorithmique-tableaux-tris",
        chapterNumber: "01",
        chapterTitle: "Programmation impérative, Tableaux 1D/2D, Tris et Complexité",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-info01-dicho-${suffix}`,
          questionText: `[Calcul Dynamique] On effectue une recherche dichotomique dans un tableau Python trié contenant exactement $N = ${nSize} = 2^{${kPow}}$ éléments. Dans le pire des cas, quel est l'ordre de grandeur du nombre maximal d'itérations (comparaisons de milieu) nécessaires ?`,
          correctText: `Environ $${kPow}$ à $${kPow + 1}$ itérations car $\\log_2(${nSize}) = ${kPow}$ (complexité $\\mathcal{O}(\\log_2 N)$)`,
          distractors: [
            `$${nSize / 2}$ itérations (complexité linéaire divisée par 2)`,
            `$${nSize}$ itérations (parcours séquentiel complet)`,
            `$${kPow * kPow}$ itérations`,
          ],
          steps: [
            `À chaque tour de boucle de la recherche dichotomique, la taille de la tranche de recherche est divisée par $2$.`,
            `Le nombre maximal d'étapes vérifie $2^p \\approx N = 2^{${kPow}} \\implies p = \\lfloor \\log_2(${nSize}) \\rfloor + 1 = ${kPow + 1}$.`,
          ],
          keyFormula: "C_{\\text{pire}}(N) = \\lfloor \\log_2(N) \\rfloor + 1 = \\mathcal{O}(\\log N)",
          commonTrap: "Confondre le diviser-par-2 à chaque étape ($\\log_2 N$) avec une division unique de la taille du tableau par 2 ($N/2$).",
        }),
      });
    }

    // Info 02 — Méthode de Dichotomie sur [a, b] : Nombre d'itérations pour une précision 2^(-k)
    {
      const widthInit = pickRandom([1, 2, 4]);
      const pSteps = randInt(6, 10);
      const finalWidth = widthInit / Math.pow(2, pSteps);

      generated.push({
        subjectId: "informatique",
        subjectTitle: "Informatique & Algorithmique Numérique (Python)",
        chapterId: "02-methodes-numeriques-analyse",
        chapterNumber: "02",
        chapterTitle: "Méthodes numériques : Dichotomie, Newton, Intégration et Euler",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-info02-eps-${suffix}`,
          questionText: `[Calcul Dynamique] On applique l'algorithme de dichotomie pour résoudre $f(x) = 0$ sur un intervalle initial $[a_0, b_0]$ de largeur $b_0 - a_0 = ${widthInit}$. Quelle est la largeur exacte $b_{${pSteps}} - a_{${pSteps}}$ de l'intervalle d'encadrement après $${pSteps}$ itérations ?`,
          correctText: `$b_{${pSteps}} - a_{${pSteps}} = \\frac{${widthInit}}{2^{${pSteps}}} = \\frac{${widthInit}}{${Math.pow(2, pSteps)}} \\approx ${fmt(finalWidth, 5)}$`,
          distractors: [
            `$b_{${pSteps}} - a_{${pSteps}} = \\frac{${widthInit}}{2 \\times ${pSteps}} = \\frac{${widthInit}}{${2 * pSteps}}$`,
            `$b_{${pSteps}} - a_{${pSteps}} = \\frac{${widthInit}}{${pSteps}^2}$`,
            `$b_{${pSteps}} - a_{${pSteps}} = ${widthInit} \\times 2^{-${pSteps - 2}}$`,
          ],
          steps: [
            `À chaque itération $k$, la longueur de l'intervalle $[a_k, b_k]$ est divisée par $2$.`,
            `Après $n = ${pSteps}$ itérations, $b_n - a_n = \\frac{b_0 - a_0}{2^n} = \\frac{${widthInit}}{2^{${pSteps}}} = \\frac{${widthInit}}{${Math.pow(2, pSteps)}}$.`,
          ],
          keyFormula: "b_n - a_n = \\frac{b_0 - a_0}{2^n} \\le \\varepsilon \\iff n \\ge \\log_2\\left(\\frac{b_0 - a_0}{\\varepsilon}\\right)",
          commonTrap: "Diviser par $2n$ au lieu de diviser par $2^n$.",
        }),
      });
    }

    // =========================================================================
    // FRANÇAIS-PHILOSOPHIE (CHAPITRE 01) : CALCUL DES FOURCHETTES DE MOTS
    // =========================================================================
    {
      const targetWords = pickRandom([80, 100, 120, 150, 200]);
      const minWords = Math.round(targetWords * 0.9);
      const maxWords = Math.round(targetWords * 1.1);

      generated.push({
        subjectId: "francais-philosophie",
        subjectTitle: "Français-Philosophie (Expression & Culture Générale)",
        chapterId: "01-methodologie-resume-dissertation",
        chapterNumber: "01",
        chapterTitle: "Méthodologie du Résumé de texte (contraction) et de la Dissertation",
        isDynamic: true,
        question: buildRandomizedQcm({
          id: `dyn-fr01-words-${suffix}`,
          questionText: `[Calcul Dynamique] Un sujet de concours impose de résumer un texte en $${targetWords}$ mots avec la marge officielle de $\\pm 10\\,\\%$. Quel est l'intervalle exact $[N_{\\min}\\,;\\,N_{\\max}]$ du nombre de mots autorisé sans pénalité ?`,
          correctText: `Entre $${minWords}$ et $${maxWords}$ mots inclus`,
          distractors: [
            `Entre $${targetWords - 10}$ et $${targetWords + 10}$ mots (seulement valable si la cible est $100$)`,
            `Entre $${Math.round(targetWords * 0.85)}$ et $${Math.round(targetWords * 1.15)}$ mots`,
            `Exactement $${targetWords}$ mots à $\\pm 5$ mots près`,
          ],
          steps: [
            `On calcule $10\\,\\%$ de la consigne : $0{,}10 \\times ${targetWords} = ${Math.round(targetWords * 0.1)}$ mots.`,
            `La borne inférieure est $${targetWords} - ${Math.round(targetWords * 0.1)} = ${minWords}$ mots et la borne supérieure est $${targetWords} + ${Math.round(targetWords * 0.1)} = ${maxWords}$ mots.`,
          ],
          keyFormula: "N_{\\text{autorisé}} \\in \\big[0{,}9 \\times N_{\\text{cible}} \\; ; \\; 1{,}1 \\times N_{\\text{cible}}\\big]",
          commonTrap: "Croire que la marge de $\\pm 10\\,\\%$ signifie toujours $\\pm 10$ mots même lorsque la consigne est de $150$ ou $200$ mots.",
        }),
      });
    }
  }

  return generated;
}