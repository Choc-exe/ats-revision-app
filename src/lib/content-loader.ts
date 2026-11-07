import { generateDynamicQcmBank } from "@/lib/dynamic-qcm";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { FlashcardItem, QcmQuestion } from "@/types/pedagogy";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * RÃ©sout automatiquement le vrai dossier sur le disque dans content/<subjectId>/ :
 * - Si content/<subjectId>/<chapterId> existe, on l'utilise.
 * - Sinon, on cherche tout dossier qui commence par le mÃªme numÃ©ro (ex: "02-").
 */
function resolveChapterDir(subjectId: string, chapterId: string): string | null {
  const subjectDir = path.join(CONTENT_ROOT, subjectId);
  if (!fs.existsSync(subjectDir)) return null;

  const exactPath = path.join(subjectDir, chapterId);
  if (fs.existsSync(exactPath)) return exactPath;

  const prefixMatch = chapterId.match(/^(\d{2}-)/);
  if (prefixMatch) {
    const prefix = prefixMatch[1];
    const entries = fs.readdirSync(subjectDir, { withFileTypes: true });
    const found = entries.find(
      (entry) => entry.isDirectory() && entry.name.startsWith(prefix)
    );
    if (found) {
      return path.join(subjectDir, found.name);
    }
  }

  return null;
}

/**
 * SÃ©curise n'importe quel contenu MDX avant compilation par next-mdx-remote
 * (Ã‰vite dÃ©finitivement l'erreur "Expected a closing tag for <CriticalFormula>")
 */
function sanitizeMdxForCompiler(mdx: string): string {
  return mdx
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => {
      const singleLine = inner
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ");
      return `\n\n$$${singleLine}$$\n\n`;
    })
    .replace(/(<(?:CriticalFormula|WarningBox)[^>]*>)\s*/g, "$1\n\n")
    .replace(/\s*(<\/(?:CriticalFormula|WarningBox)>)/g, "\n\n$1");
}

interface BuiltinChapterBundle {
  course: string;
  summary: string;
  flashcards: FlashcardItem[];
  qcm: QcmQuestion[];
}

/** Table de remappage des catégories non-standard vers les valeurs valides */
const CATEGORY_REMAP: Record<string, FlashcardItem["category"]> = {
  "suites r\u00e9elles": "Th\u00e9or\u00e8me",
  "continuit\u00e9": "Th\u00e9or\u00e8me",
  "suites r\u00e9currentes": "M\u00e9thode",
  "\u00e9quivalents": "Formule Critique",
  "incertitudes-types": "Formule Critique",
  "propagation": "Formule Critique",
  "combustions \u0026 carbone": "Formule Critique",
  "validation exp\u00e9rimentale": "M\u00e9thode",
  "st\u0153chiom\u00e9trie": "M\u00e9thode",
  "structure de la mati\u00e8re": "D\u00e9finition",
  "physique nucl\u00e9aire": "D\u00e9finition",
  "m\u00e9thode": "M\u00e9thode",
  "d\u00e9finition": "D\u00e9finition",
  "pi\u00e8ge classique": "Pi\u00e8ge Classique",
  "th\u00e9or\u00e8me": "Th\u00e9or\u00e8me",
  "formule critique": "Formule Critique",
};

const VALID_CATEGORIES = new Set<string>([
  "Formule Critique",
  "Th\u00e9or\u00e8me",
  "D\u00e9finition",
  "M\u00e9thode",
  "Pi\u00e8ge Classique",
]);

function resolveCategory(raw: any): FlashcardItem["category"] {
  const cat = typeof raw?.category === "string" ? raw.category : "";
  if (VALID_CATEGORIES.has(cat)) return cat as FlashcardItem["category"];
  const remapped = CATEGORY_REMAP[cat.toLowerCase().trim()];
  return remapped ?? "Formule Critique";
}

function normalizeFlashcard(raw: any, index: number): FlashcardItem {
  const frontText =
    typeof raw?.front === "string"
      ? raw.front
      : typeof raw?.question === "string"
      ? raw.question
      : "Question";

  const backObj =
    raw?.back && typeof raw.back === "object"
      ? {
          mainAnswer:
            raw.back.mainAnswer ??
            raw.back.answer ??
            raw.back.text ??
            "",
          criticalFormula:
            raw.back.criticalFormula ??
            raw.back.formula ??
            raw.latex ??
            undefined,
          mnemonicOrTip:
            raw.back.mnemonicOrTip ??
            raw.back.commonTrap ??
            raw.back.trap ??
            raw.tip ??
            undefined,
        }
      : {
          mainAnswer:
            typeof raw?.back === "string"
              ? raw.back
              : typeof raw?.answer === "string"
              ? raw.answer
              : "",
          criticalFormula: raw?.criticalFormula ?? raw?.latex ?? undefined,
          mnemonicOrTip:
            raw?.mnemonicOrTip ??
            raw?.commonTrap ??
            raw?.tip ??
            undefined,
        };

  return {
    id: raw?.id ?? `fc-${index + 1}`,
    category: resolveCategory(raw),
    difficulty: raw?.difficulty ?? "Concours ATS",
    front: frontText,
    back: backObj,
  } as unknown as FlashcardItem;
}

/**
 * MÃ©lange un tableau sur place (Algorithme de Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Normalise n'importe quelle question de QCM issue d'un fichier qcm.json
 * ET mÃ©lange alÃ©atoirement l'emplacement des options A, B, C, D pour que
 * la bonne rÃ©ponse ne soit JAMAIS au mÃªme endroit !
 */
function normalizeQcmQuestion(raw: any, index: number): QcmQuestion {
  const letters = ["a", "b", "c", "d"] as const;
  const rawOptions = Array.isArray(raw?.options)
    ? raw.options
    : Array.isArray(raw?.choices)
    ? raw.choices
    : [];

  const originalCorrectIndex: number =
    typeof raw?.correctIndex === "number"
      ? raw.correctIndex
      : typeof raw?.correctOptionId === "string"
      ? Math.max(0, letters.indexOf(raw.correctOptionId.toLowerCase() as any))
      : 0;

  // 1. On type explicitement le tableau avant le mÃ©lange
  const taggedOptions: Array<{
    text: string;
    latex?: string;
    isCorrect: boolean;
  }> = rawOptions.map((opt: any, idx: number) => {
    const origId = String(opt?.id ?? letters[idx] ?? idx);
    const text =
      typeof opt === "string"
        ? opt
        : String(opt?.text ?? opt?.label ?? opt?.latex ?? "");
    const isCorrect =
      typeof opt?.isCorrect === "boolean"
        ? opt.isCorrect
        : raw?.correctOptionId
        ? origId.toLowerCase() === String(raw.correctOptionId).toLowerCase()
        : idx === originalCorrectIndex;

    return {
      text,
      latex:
        typeof opt?.latex === "string" && !opt.latex.includes("$")
          ? opt.latex
          : undefined,
      isCorrect,
    };
  });

  // 2. MÃ‰LANGE ALÃ‰ATOIRE DES EMPLACEMENTS (A, B, C, D)
  const shuffledOptions = shuffleArray(taggedOptions).map(
    (
      opt: { text: string; latex?: string; isCorrect: boolean },
      newIdx: number
    ) => {
      const newId = letters[newIdx] ?? String(newIdx);
      return {
        id: newId,
        label: newId.toUpperCase(),
        text: opt.text,
        latex: opt.latex,
        isCorrect: opt.isCorrect,
      };
  });

  const newCorrectIndex = Math.max(
    0,
    shuffledOptions.findIndex((o) => o.isCorrect)
  );
  const newCorrectOptionId = shuffledOptions[newCorrectIndex]?.id ?? "a";

  const explanationObj =
    raw?.explanation && typeof raw.explanation === "object"
      ? {
          steps: Array.isArray(raw.explanation.steps)
            ? raw.explanation.steps.map(String)
            : [String(raw.explanation.main ?? "Voir l'explication ci-dessous.")],
          keyFormula: String(raw.explanation.keyFormula ?? ""),
          commonTrap: raw.explanation.commonTrap
            ? String(raw.explanation.commonTrap)
            : undefined,
        }
      : {
          steps:
            typeof raw?.explanation === "string"
              ? [raw.explanation]
              : ["Appliquer la mÃ©thode du cours."],
          keyFormula: String(raw?.keyFormula ?? ""),
          commonTrap: raw?.commonTrap ? String(raw.commonTrap) : undefined,
        };

  const qText = String(
    raw?.questionText ?? raw?.question ?? raw?.prompt ?? `Question ${index + 1}`
  );

  return {
    id: String(raw?.id ?? `qcm-${index + 1}`),
    difficulty: raw?.difficulty ?? "Concours ATS",
    questionText: qText,
    question: qText,
    options: shuffledOptions,
    correctOptionId: newCorrectOptionId,
    correctIndex: newCorrectIndex,
    explanation: explanationObj,
  } as unknown as QcmQuestion;
}

function makeBuiltinFlashcard(params: {
  id: string;
  category:
    | "Formule Critique"
    | "ThÃ©orÃ¨me"
    | "DÃ©finition"
    | "MÃ©thode"
    | "PiÃ¨ge Classique";
  question: string;
  answer: string;
  criticalFormula?: string;
  commonTrap?: string;
}): FlashcardItem {
  return normalizeFlashcard(
    {
      id: params.id,
      category: params.category,
      front: params.question,
      back: {
        mainAnswer: params.answer,
        criticalFormula: params.criticalFormula,
        commonTrap: params.commonTrap,
      },
    },
    0
  );
}

function makeBuiltinQcm(params: {
  id: string;
  question: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  steps: string[];
  keyFormula: string;
  commonTrap?: string;
}): QcmQuestion {
  return normalizeQcmQuestion(
    {
      id: params.id,
      questionText: params.question,
      options: params.choices,
      correctIndex: params.correctIndex,
      explanation: {
        steps: params.steps,
        keyFormula: params.keyFormula,
        commonTrap: params.commonTrap,
      },
    },
    0
  );
}

// ============================================================================
// CONTENU INTÃ‰GRÃ‰ POUR LES CHAPITRES DE COMPLÃ‰MENT (INCLUT ANGLAIS ATS)
// ============================================================================
const BUILTIN_CHAPTERS: Record<string, BuiltinChapterBundle> = {
  "physique-chimie/08": {
    course: `
## 1. Structure de la matiÃ¨re, Noyau et Isotopes (Annexe V)

Un noyau atomique est reprÃ©sentÃ© par le symbole $^A_Z\\text{X}$, oÃ¹ **$Z$** est le **numÃ©ro atomique** (nombre de protons) et **$A = Z + N$** est le **nombre de masse** (nombre total de nuclÃ©ons : protons + neutrons). Deux **isotopes** possÃ¨dent le mÃªme numÃ©ro atomique $Z$ (mÃªme Ã©lÃ©ment chimique) mais un nombre de neutrons $N$ diffÃ©rent.

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” QuantitÃ© de matiÃ¨re et DÃ©faut de masse nuclÃ©aire">

$$n = \\frac{m}{M} = \\frac{\\rho \\cdot V}{M} = \\frac{N_{\\text{entitÃ©s}}}{N_A} = C \\cdot V_{\\text{sol}} = \\frac{P \\cdot V_{\\text{gaz}}}{R \\cdot T}$$

$$E_{\\text{libÃ©rÃ©e}} = \\Delta m \\cdot c^2 \\quad \\text{avec} \\quad c \\approx 3{,}00 \\times 10^8\\text{ m}\\cdot\\text{s}^{-1}$$

</CriticalFormula>

## 2. Transformations chimiques, Avancement et Combustions

Pour une rÃ©action $\\nu_A\\,\\text{A} + \\nu_B\\,\\text{B} \\rightarrow \\nu_C\\,\\text{C} + \\nu_D\\,\\text{D}$, l'**avancement maximal** est $x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)$, ce qui identifie le **rÃ©actif limitant**.

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Combustion complÃ¨te, Masse de COâ‚‚ et PCI">

$$\\text{C}_x\\text{H}_y\\text{O}_z + \\left(x + \\frac{y}{4} - \\frac{z}{2}\\right)\\text{O}_2 \\longrightarrow x\\,\\text{CO}_2 + \\frac{y}{2}\\,\\text{H}_2\\text{O}$$

$$m(\\text{CO}_2) = x \\cdot \\frac{M_{\\text{CO}_2}}{M_{\\text{carb}}} \\cdot m_{\\text{carb}} \\quad (M_{\\text{CO}_2} = 44{,}0\\text{ g}\\cdot\\text{mol}^{-1}) \\quad \\text{et} \\quad Q_{\\text{lib}} = m_{\\text{carb}} \\cdot \\text{PCI}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” QuantitÃ© de matiÃ¨re, Combustions et NuclÃ©aire">

$$n = \\frac{m}{M} = C\\,V_{\\text{sol}} = \\frac{P\\,V_{\\text{gaz}}}{R\\,T} \\quad ; \\quad x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)$$

$$m(\\text{CO}_2) = x \\cdot \\frac{44{,}0}{M_{\\text{carb}}} \\cdot m_{\\text{carb}} \\quad ; \\quad Q_{\\text{lib}} = m_{\\text{carb}} \\cdot \\text{PCI} \\quad ; \\quad E_{\\text{nucl}} = \\Delta m \\cdot c^2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "pc-08-fc-01",
        category: "DÃ©finition",
        question: "Que reprÃ©sentent $A$, $Z$ et $N = A - Z$ dans la notation $^A_Z\\text{X}$ et qu'appelle-t-on isotopes ?",
        answer: "$Z$ est le nombre de protons (numÃ©ro atomique), $A$ le nombre de nuclÃ©ons et $N = A-Z$ le nombre de neutrons. Deux isotopes ont le mÃªme $Z$ mais un nombre de masse $A$ diffÃ©rent.",
        criticalFormula: "A = Z + N \\quad ; \\quad n = \\frac{m}{M} = \\frac{N_{\\text{entitÃ©s}}}{N_A}",
      }),
      makeBuiltinFlashcard({
        id: "pc-08-fc-02",
        category: "Formule Critique",
        question: "Quelle masse de $\\text{CO}_2$ ($M=44\\text{ g/mol}$) rejette la combustion complÃ¨te de $1{,}00\\text{ kg}$ d'octane $\\text{C}_8\\text{H}_{18}$ ($M=114\\text{ g/mol}$) ?",
        answer: "Chaque mole d'octane brÃ»lÃ©e produit 8 moles de dioxyde de carbone, soit environ $3{,}09\\text{ kg}$ de $\\text{CO}_2$ par kilogramme de carburant.",
        criticalFormula: "m(\\text{CO}_2) = 8 \\times \\frac{44}{114} \\times 1{,}00\\text{ kg} \\approx 3{,}09\\text{ kg}",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "pc-08-qcm-01",
        question: "On brÃ»le $2{,}0\\text{ mol}$ de $\\text{CH}_4$ avec $3{,}0\\text{ mol}$ de $\\text{O}_2$ selon $\\text{CH}_4 + 2\\,\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}$. Que vaut l'avancement maximal $x_{\\max}$ ?",
        choices: [
          "$x_{\\max} = 1{,}5\\text{ mol}$",
          "$x_{\\max} = 2{,}0\\text{ mol}$",
          "$x_{\\max} = 3{,}0\\text{ mol}$",
          "$x_{\\max} = 1{,}0\\text{ mol}$",
        ],
        correctIndex: 0,
        steps: [
          "On calcule les rapports stÅ“chiomÃ©triques initiaux : $n_0(\\text{CH}_4)/1 = 2{,}0\\text{ mol}$ et $n_0(\\text{O}_2)/2 = 3{,}0/2 = 1{,}5\\text{ mol}$.",
          "Le dioxygÃ¨ne $\\text{O}_2$ est le rÃ©actif limitant et impose $x_{\\max} = 1{,}5\\text{ mol}$.",
        ],
        keyFormula: "x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)",
        commonTrap: "Oublier de diviser la quantitÃ© initiale de dioxygÃ¨ne par son coefficient stÅ“chiomÃ©trique $\\nu = 2$.",
      }),
    ],
  },

  "physique-chimie/09": {
    course: `
## 1. Incertitudes-types (Type A et Type B) et Propagation (Annexe V)

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Incertitudes-types A/B, Propagation et Score z">

* **Type A ($N$ mesures d'Ã©cart-type $s_{n-1}$) :** $u(\\bar{x}) = \\dfrac{s_{n-1}}{\\sqrt{N}}$.
* **Type B (demi-Ã©tendue $\\pm a$) :** $u(x) = \\dfrac{a}{\\sqrt{3}}$.
* **Propagation sur produit/quotient ($G = k X^\\alpha Y^\\beta$) :** $\\dfrac{u(G)}{|G|} = \\sqrt{\\alpha^2\\left(\\dfrac{u(X)}{X}\\right)^2 + \\beta^2\\left(\\dfrac{u(Y)}{Y}\\right)^2}$.

$$z = \\frac{|g_{\\text{exp}} - g_{\\text{rÃ©f}}|}{\\sqrt{u(g_{\\text{exp}})^2 + u(g_{\\text{rÃ©f}})^2}} \\le 2 \\quad (\\text{mesure compatible si } z \\le 2)$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” Incertitudes-types et Validation expÃ©rimentale">

$$u_{\\text{A}}(\\bar{x}) = \\frac{s_{n-1}}{\\sqrt{N}} \\quad ; \\quad u_{\\text{B}}(x) = \\frac{a}{\\sqrt{3}} \\quad ; \\quad z = \\frac{|g_{\\text{exp}} - g_{\\text{rÃ©f}}|}{u(g_{\\text{exp}})} \\le 2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "pc-09-fc-01",
        category: "Formule Critique",
        question: "Quelle est la condition sur l'Ã©cart normalisÃ© $z$ pour valider la compatibilitÃ© d'une mesure $g_{\\text{exp}} \\pm u(g_{\\text{exp}})$ avec $g_{\\text{rÃ©f}}$ ?",
        answer: "L'Ã©cart normalisÃ© doit rester infÃ©rieur ou Ã©gal Ã  2 (niveau de confiance de 95 %).",
        criticalFormula: "z = \\frac{|g_{\\text{exp}} - g_{\\text{rÃ©f}}|}{u(g_{\\text{exp}})} \\le 2",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "pc-09-qcm-01",
        question: "On mesure $g_{\\text{exp}} = 9{,}72 \\pm 0{,}06\\text{ m}\\cdot\\text{s}^{-2}$ pour $g_{\\text{rÃ©f}} = 9{,}81\\text{ m}\\cdot\\text{s}^{-2}$. Que vaut l'Ã©cart normalisÃ© $z$ ?",
        choices: [
          "$z = 1{,}50 \\le 2$ (compatible)",
          "$z = 2{,}50 > 2$ (incompatible)",
          "$z = 0{,}09$ (compatible)",
          "$z = 0{,}75$ (compatible)",
        ],
        correctIndex: 0,
        steps: [
          "On calcule l'Ã©cart absolu $|9{,}72 - 9{,}81| = 0{,}09\\text{ m}\\cdot\\text{s}^{-2}$.",
          "On divise par l'incertitude-type $u(g_{\\text{exp}}) = 0{,}06$ : $z = 0{,}09 / 0{,}06 = 1{,}50 \\le 2$.",
        ],
        keyFormula: "z = \\frac{|g_{\\text{exp}} - g_{\\text{rÃ©f}}|}{u(g_{\\text{exp}})}",
      }),
    ],
  },

  "mathematiques/07": {
    course: `
## 1. Convergence des suites rÃ©elles et Ã‰quivalents (Annexe III)

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Convergence monotone, Suites adjacentes et TVI">

* **Convergence monotone :** Toute suite rÃ©elle **croissante et majorÃ©e** (ou dÃ©croissante et minorÃ©e) converge.
* **Suites adjacentes :** Si $(u_n)$ est croissante, $(v_n)$ est dÃ©croissante et $\\lim_{n\\to+\\infty}(v_n - u_n) = 0$, elles convergent vers la mÃªme limite $\\ell$.
* **ThÃ©orÃ¨me des Valeurs IntermÃ©diaires (TVI) :** Si $f$ est continue sur $[a, b]$ et $f(a)f(b) \\le 0$, l'Ã©quation $f(x) = 0$ admet au moins une solution dans $[a, b]$ (unique si $f$ est strictement monotone).

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” Suites, Ã‰quivalents en 0 et ContinuitÃ©">

$$\\text{Pour } u_n \\to 0 : \\quad \\sin(u_n) \\sim u_n \\quad ; \\quad \\ln(1+u_n) \\sim u_n \\quad ; \\quad \\mathrm{e}^{u_n} - 1 \\sim u_n \\quad ; \\quad 1 - \\cos(u_n) \\sim \\frac{u_n^2}{2}$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-07-fc-01",
        category: "ThÃ©orÃ¨me",
        question: "Quelles sont les hypothÃ¨ses du thÃ©orÃ¨me de la bijection monotone sur un intervalle $I$ ?",
        answer: "$f$ doit Ãªtre continue et strictement monotone sur l'intervalle $I$. Elle rÃ©alise alors une bijection de $I$ sur l'intervalle image $J = f(I)$.",
        criticalFormula: "\\forall y \\in f(I), \\; \\exists! x \\in I, \\; f(x) = y",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-07-qcm-01",
        question: "Que vaut $\\lim_{n\\to+\\infty} n^2\\left(1 - \\cos\\left(\\frac{2}{n}\\right)\\right)$ ?",
        choices: ["$2$", "$1$", "$0$", "$4$"],
        correctIndex: 0,
        steps: [
          "On pose $u_n = 2/n \\to 0$ lorsque $n \\to +\\infty$.",
          "Par Ã©quivalent usuel, $1 - \\cos(u_n) \\sim u_n^2 / 2 = (4/n^2)/2 = 2/n^2$, donc $n^2(1 - \\cos(2/n)) \\to 2$.",
        ],
        keyFormula: "1 - \\cos(u_n) \\underset{u_n \\to 0}{\\sim} \\frac{u_n^2}{2}",
      }),
    ],
  },

  "mathematiques/08": {
    course: `
## 1. ThÃ©orÃ¨me de Rolle, Accroissements Finis et DÃ©veloppements LimitÃ©s

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Accroissements Finis (TAF) et Taylor-Young">

Si $f$ est continue sur $[a, b]$ et dÃ©rivable sur $]a, b[$, il existe $c \\in ]a, b[$ tel que $f(b) - f(a) = f'(c)(b - a)$.

$$\\mathrm{e}^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + o(x^3) \\quad ; \\quad \\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)$$

$$\\sin x = x - \\frac{x^3}{6} + o(x^4) \\quad ; \\quad \\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^5)$$

$$(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2}x^2 + o(x^2) \\quad ; \\quad \\arctan x = x - \\frac{x^3}{3} + o(x^4)$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” DÃ©veloppements LimitÃ©s usuels en 0">

$$\\mathrm{e}^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + o(x^3) \\quad ; \\quad \\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3) \\quad ; \\quad \\frac{1}{1-x} = 1 + x + x^2 + x^3 + o(x^3)$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-08-fc-01",
        category: "Formule Critique",
        question: "Donner le $\\text{DL}_3(0)$ de $\\sin x$, $\\cos x$ et $\\tan x$.",
        answer: "Les fonctions sinus et tangente sont impaires (puissances impaires) et cosinus est paire.",
        criticalFormula: "\\sin x = x - \\frac{x^3}{6} + o(x^3) \\; ; \\; \\cos x = 1 - \\frac{x^2}{2} + o(x^3) \\; ; \\; \\tan x = x + \\frac{x^3}{3} + o(x^3)",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-08-qcm-01",
        question: "Que vaut $\\lim_{x\\to 0} \\frac{\\mathrm{e}^x - 1 - \\sin x}{x^2}$ ?",
        choices: ["$\\frac{1}{2}$", "$0$", "$1$", "$\\frac{1}{6}$"],
        correctIndex: 0,
        steps: [
          "On Ã©crit les $\\text{DL}_2(0)$ : $\\mathrm{e}^x - 1 = x + x^2/2 + o(x^2)$ et $\\sin x = x + o(x^2)$.",
          "La diffÃ©rence vaut $x^2/2 + o(x^2)$, donc le quotient par $x^2$ tend vers $1/2$.",
        ],
        keyFormula: "\\mathrm{e}^x = 1 + x + \\frac{x^2}{2} + o(x^2)",
      }),
    ],
  },

  "mathematiques/09": {
    course: `
## 1. IntÃ©gration sur un segment et IntÃ©grales impropres (Riemann)

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” IPP, Changement de variable et CritÃ¨res de Riemann">

$$\\int_a^b u(x)\\,v'(x)\\,\\mathrm{d}x = \\Big[u(x)\\,v(x)\\Big]_a^b - \\int_a^b u'(x)\\,v(x)\\,\\mathrm{d}x$$

$$\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha} \\text{ converge} \\iff \\mathbf{\\alpha > 1} \\quad \\text{et} \\quad \\int_0^1 \\frac{\\mathrm{d}t}{t^\\alpha} \\text{ converge} \\iff \\mathbf{\\alpha < 1}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” Sommes de Riemann et IntÃ©grales gÃ©nÃ©ralisÃ©es">

$$\\lim_{n\\to+\\infty}\\frac{1}{n}\\sum_{k=1}^n f\\left(\\frac{k}{n}\\right) = \\int_0^1 f(t)\\,\\mathrm{d}t \\quad ; \\quad \\int_0^{+\\infty} \\mathrm{e}^{-\\lambda t}\\,\\mathrm{d}t = \\frac{1}{\\lambda} \\;(\\lambda > 0)$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-09-fc-01",
        category: "ThÃ©orÃ¨me",
        question: "Pour quelles valeurs de $\\alpha$ l'intÃ©grale $\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha}$ converge-t-elle ? Et sur $]0, 1]$ ?",
        answer: "Sur $[1, +\\infty[$, elle converge si et seulement si $\\alpha > 1$. Sur $]0, 1]$, elle converge si et seulement si $\\alpha < 1$.",
        criticalFormula: "\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha} < +\\infty \\iff \\alpha > 1",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-09-qcm-01",
        question: "Que vaut $\\int_1^{\\mathrm{e}} x\\ln(x)\\,\\mathrm{d}x$ par intÃ©gration par parties ?",
        choices: [
          "$\\frac{\\mathrm{e}^2 + 1}{4}$",
          "$\\frac{\\mathrm{e}^2 - 1}{4}$",
          "$1$",
          "$\\frac{\\mathrm{e}^2}{2}$",
        ],
        correctIndex: 0,
        steps: [
          "On pose $u(x) = \\ln x$ ($u'(x) = 1/x$) et $v'(x) = x$ ($v(x) = x^2/2$).",
          "Par IPP : $[\\frac{x^2}{2}\\ln x]_1^{\\mathrm{e}} - \\int_1^{\\mathrm{e}} \\frac{x}{2}\\,\\mathrm{d}x = \\frac{\\mathrm{e}^2}{2} - \\frac{\\mathrm{e}^2 - 1}{4} = \\frac{\\mathrm{e}^2 + 1}{4}$.",
        ],
        keyFormula: "\\int_a^b u\\,v' = [u\\,v]_a^b - \\int_a^b u'\\,v",
      }),
    ],
  },

  "mathematiques/10": {
    course: `
## 1. SÃ©ries numÃ©riques et SÃ©ries de Fourier d'un signal $T$-pÃ©riodique

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Coefficients de Fourier, Dirichlet et Parseval">

$$a_0 = \\frac{1}{T}\\int_0^T f(t)\\,\\mathrm{d}t \\quad ; \\quad a_n = \\frac{2}{T}\\int_0^T f(t)\\cos(n\\omega t)\\,\\mathrm{d}t \\quad ; \\quad b_n = \\frac{2}{T}\\int_0^T f(t)\\sin(n\\omega t)\\,\\mathrm{d}t$$

* **ThÃ©orÃ¨me de Dirichlet :** $S_f(t) = \\dfrac{f(t^+) + f(t^-)}{2}$.
* **Formule de Parseval :** $\\dfrac{1}{T}\\int_0^T |f(t)|^2\\,\\mathrm{d}t = a_0^2 + \\dfrac{1}{2}\\sum_{n=1}^{+\\infty}\\left(a_n^2 + b_n^2\\right)$.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” SÃ©ries de Riemann et SymÃ©tries de Fourier">

$$\\sum_{n\\ge 1}\\frac{1}{n^\\alpha} \\text{ converge} \\iff \\alpha > 1 \\quad ; \\quad f \\text{ paire} \\implies b_n = 0 \\quad ; \\quad f \\text{ impaire} \\implies a_n = 0$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-10-fc-01",
        category: "Formule Critique",
        question: "Ã‰noncer l'Ã©galitÃ© de Parseval pour une fonction $T$-pÃ©riodique.",
        answer: "La puissance moyenne du signal sur une pÃ©riode est Ã©gale Ã  la somme des puissances moyennes de ses harmoniques.",
        criticalFormula: "\\frac{1}{T}\\int_0^T f(t)^2\\,\\mathrm{d}t = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-10-qcm-01",
        question: "Un signal a pour sÃ©rie de Fourier $u(t) = 3 + 4\\cos(\\omega t) + 2\\sqrt{2}\\sin(2\\omega t)$. Que vaut sa valeur efficace $U_{\\text{eff}}$ ?",
        choices: ["$\\sqrt{21}$", "$\\sqrt{33}$", "$5$", "$7$"],
        correctIndex: 0,
        steps: [
          "On applique la formule de Parseval : $U_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}(a_1^2 + b_2^2)$.",
          "On obtient $U_{\\text{eff}}^2 = 3^2 + \\frac{16}{2} + \\frac{8}{2} = 9 + 8 + 4 = 21$, soit $U_{\\text{eff}} = \\sqrt{21}$.",
        ],
        keyFormula: "U_{\\text{eff}}^2 = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)",
      }),
    ],
  },

  "mathematiques/11": {
    course: `
## 1. DÃ©rivÃ©es partielles, Gradient, Schwarz et Extremums locaux

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Gradient, Plan tangent et CritÃ¨re rt - sÂ² de Monge">

$$\\overrightarrow{\\text{grad}}\\,f(x, y) = \\nabla f(x, y) = \\begin{pmatrix} \\partial f/\\partial x \\\\ \\partial f/\\partial y \\end{pmatrix} \\quad ; \\quad \\mathrm{d}f = \\frac{\\partial f}{\\partial x}\\mathrm{d}x + \\frac{\\partial f}{\\partial y}\\mathrm{d}y$$

* Si **$rt - s^2 > 0$** : **extremum local** (minimum si $r > 0$, maximum si $r < 0$).
* Si **$rt - s^2 < 0$** : **point col (ou point selle)**, pas d'extremum.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” ThÃ©orÃ¨me de Schwarz et Matrice Hessienne">

$$\\text{Classe } \\mathcal{C}^2 \\implies \\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x} \\quad ; \\quad \\det H_f(x_0, y_0) = r\\,t - s^2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-11-fc-01",
        category: "MÃ©thode",
        question: "Comment distingue-t-on un minimum local, un maximum local et un point col en un point critique $(x_0, y_0)$ ?",
        answer: "Avec $r = \\partial_{xx}^2 f$, $s = \\partial_{xy}^2 f$, $t = \\partial_{yy}^2 f$ : si $rt-s^2 > 0$ et $r > 0$, minimum local ; si $rt-s^2 > 0$ et $r < 0$, maximum local ; si $rt-s^2 < 0$, point col.",
        criticalFormula: "\\Delta = r\\,t - s^2",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-11-qcm-01",
        question: "Quelle est la nature du point critique $(0, 0)$ pour $f(x, y) = x^2 - 2xy + 3y^2$ ?",
        choices: [
          "Minimum local strict ($rt - s^2 = 8 > 0$ et $r = 2 > 0$)",
          "Maximum local",
          "Point col",
          "Cas douteux",
        ],
        correctIndex: 0,
        steps: [
          "On calcule les dÃ©rivÃ©es secondes : $r = 2$, $s = -2$ et $t = 6$.",
          "Comme $rt - s^2 = 12 - 4 = 8 > 0$ et $r = 2 > 0$, $(0, 0)$ est un minimum local strict.",
        ],
        keyFormula: "\\Delta = r\\,t - s^2 > 0 \\text{ et } r > 0 \\implies \\text{Minimum}",
      }),
    ],
  },

  "sii/05": {
    course: `
## 1. IngÃ©nierie SystÃ¨me (SysML), ChaÃ®ne d'acquisition et Conception (Annexe VI)

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” RÃ©solution d'un CAN et Codeur incrÃ©mental">

$$q = \\frac{U_{\\text{PE}}}{2^N} \\quad \\text{et} \\quad \\Delta \\theta_{\\text{quad}} = \\frac{2\\pi}{4\\,P}\\text{ rad} = \\frac{360^\\circ}{4\\,P}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” ChaÃ®ne d'acquisition et Montage de roulements">

$$q_{\\text{CAN}} = \\frac{U_{\\text{PE}}}{2^N} \\quad ; \\quad f_e > 2\\,f_{\\max}$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "sii-05-fc-01",
        category: "Formule Critique",
        question: "Quel est le quantum $q$ d'un Convertisseur Analogique-NumÃ©rique (CAN) de $12\\text{ bits}$ sur une plage $0\\text{â€“}10\\text{ V}$ ?",
        answer: "Le CAN possÃ¨de $2^{12} = 4096$ niveaux de quantification.",
        criticalFormula: "q = \\frac{U_{\\text{PE}}}{2^N} = \\frac{10}{4096} \\approx 2{,}44\\text{ mV}",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "sii-05-qcm-01",
        question: "Dans un guidage en rotation par deux roulements Ã  billes Ã  contact radial, si l'arbre tourne et la charge radiale a une direction fixe (poids), comment doivent Ãªtre montÃ©es les bagues ?",
        choices: [
          "Bagues intÃ©rieures (tournantes) montÃ©es serrÃ©es sur l'arbre ; bagues extÃ©rieures (fixes) montÃ©es glissantes dans l'alÃ©sage",
          "Bagues intÃ©rieures montÃ©es glissantes ; bagues extÃ©rieures montÃ©es serrÃ©es",
          "Toutes les bagues montÃ©es serrÃ©es",
          "Toutes les bagues montÃ©es glissantes",
        ],
        correctIndex: 0,
        steps: [
          "La bague intÃ©rieure liÃ©e Ã  l'arbre tourne par rapport Ã  la direction fixe de la charge : elle doit Ãªtre montÃ©e serrÃ©e.",
          "La bague extÃ©rieure liÃ©e Ã  l'alÃ©sage est fixe par rapport Ã  la charge : elle est montÃ©e glissante.",
        ],
        keyFormula: "N_{\\text{obstacles bagues serrÃ©es}} = 4 \\quad ; \\quad N_{\\text{obstacles bagues glissantes}} = 2",
      }),
    ],
  },

  "francais-philosophie/01": {
    course: `
## 1. MÃ©thodologie de la Contraction (RÃ©sumÃ© de texte) au Concours ATS

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Les 4 RÃ¨gles d'Or du RÃ©sumÃ© de Texte ATS">

1. **Marge de tolÃ©rance de $\\pm 10\\,\\%$ impÃ©rative :** Pour une consigne Ã  $100$ mots, le rÃ©sumÃ© doit compter entre **$90$ et $110$ mots**.
2. **Respect du systÃ¨me d'Ã©nonciation :** Vous rÃ©digez **Ã  la place de l'auteur**.
3. **Reformulation personnelle intÃ©grale :** Aucun collage ni citation du texte source.
4. **FidÃ©litÃ© Ã  l'ordre et Ã  la logique :** Respectez l'enchaÃ®nement des thÃ¨ses du texte.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” DÃ©compte officiel des mots">

$$90 \\le N_{\\text{mots}} \\le 110 \\quad (\\text{pour une consigne Ã  } 100 \\text{ mots})$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-01-fc-01",
        category: "MÃ©thode",
        question: "Quelles sont les quatre rÃ¨gles formelles impÃ©ratives du rÃ©sumÃ© de texte au concours ATS ?",
        answer: "1. Respecter la fourchette de Â± 10 % du nombre de mots. 2. Adopter l'Ã©nonciation de l'auteur (interdiction d'Ã©crire Â« L'auteur dit que... Â»). 3. Reformuler sans citer le texte. 4. Suivre l'ordre du texte.",
        criticalFormula: "90 \\le N_{\\text{mots}} \\le 110",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "fr-01-qcm-01",
        question: "Dans un rÃ©sumÃ© de texte au concours ATS dont la consigne est de 100 mots (Â± 10 %), laquelle de ces pratiques est une faute mÃ©thodologique grave ?",
        choices: [
          "Commencer par Â« Dans cet extrait, l'auteur dÃ©montre que... Â»",
          "Utiliser la premiÃ¨re personne Â« je Â» ou Â« nous Â» comme dans le texte source",
          "RÃ©diger un texte de 96 mots",
          "Remplacer une longue Ã©numÃ©ration d'exemples par le concept gÃ©nÃ©ral qu'elle illustre",
        ],
        correctIndex: 0,
        steps: [
          "Le candidat doit se substituer Ã  l'auteur du texte en conservant son systÃ¨me d'Ã©nonciation.",
          "Toute mention extÃ©rieure (Â« l'auteur pense que Â», Â« selon ce texte Â») est sanctionnÃ©e.",
        ],
        keyFormula: "90 \\le N_{\\text{mots}} \\le 110",
      }),
    ],
  },

  "francais-philosophie/02": {
    course: `
## 1. Exploitation comparÃ©e des Å’uvres au Programme Officiel ATS

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” MÃ©thode de confrontation des Å“uvres en une sous-partie">

1. **ThÃ¨se directrice :** Ã‰noncez l'idÃ©e maÃ®tresse du paragraphe dÃ¨s la premiÃ¨re phrase.
2. **PremiÃ¨re Å“uvre :** Mobilisez un passage prÃ©cis en analysant ses procÃ©dÃ©s.
3. **Pivot comparatif :** Utilisez un connecteur de rapprochement ou de nuance.
4. **Seconde Å“uvre :** Montrez comment la seconde Å“uvre Ã©claire ou dÃ©passe la premiÃ¨re.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” RÃ¨gles de citation et de ponctuation des titres">

* **Titre d'Å“uvre intÃ©grale :** toujours soulignÃ© sur copie manuscrite (sans guillemets).
* **Citation courte :** intÃ©grÃ©e entre guillemets et immÃ©diatement analysÃ©e.

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-02-fc-01",
        category: "MÃ©thode",
        question: "Comment Ã©viter l'Ã©cueil de la Â« juxtaposition des Å“uvres Â» dans une partie de dissertation ?",
        answer: "En organisant chaque partie autour d'une idÃ©e directrice (un concept) et en faisant dialoguer deux Å“uvres Ã  l'intÃ©rieur d'une mÃªme sous-partie.",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "fr-02-qcm-01",
        question: "Quelle est la bonne mÃ©thode pour utiliser une citation issue d'une Å“uvre au programme dans une copie de concours ?",
        choices: [
          "L'insÃ©rer de faÃ§on fluide, l'expliquer et montrer en quoi elle prouve l'argument de la sous-partie",
          "Recopier une citation de dix lignes sans la commenter",
          "EnchaÃ®ner trois citations Ã  la suite en fin de paragraphe",
          "Raconter toute l'intrigue du livre avant de citer une phrase",
        ],
        correctIndex: 0,
        steps: [
          "Une citation ne constitue pas une preuve Ã  elle seule : elle doit Ãªtre expliquÃ©e et reliÃ©e Ã  la thÃ¨se du paragraphe.",
        ],
        keyFormula: "3 \\text{ parties} \\times 3 \\text{ sous-parties}",
      }),
    ],
  },

  // ==========================================================================
  // NOUVELLE MATIÃˆRE : ANGLAIS CONCOURS ATS (CHAPITRES 01, 02 ET 03)
  // ==========================================================================
  "anglais/01": {
    course: `
## 1. Concordance des temps, Aspect *Present Perfect* vs *Preterite*

La maÃ®trise grammaticale est Ã©valuÃ©e aussi bien dans la synthÃ¨se Ã©crite que lors de la khÃ´lle orale du concours ATS. L'erreur la plus sanctionnÃ©e concerne la confusion entre le **prÃ©tÃ©rit** (action passÃ©e datÃ©e, coupÃ©e du prÃ©sent) et le **present perfect** ($\text{have/has} + \text{participe passÃ©}$ : bilan dans le prÃ©sent ou action commencÃ©e dans le passÃ© qui continue).

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Marqueurs temporels et Structures en FOR / SINCE">

* **Preterite obligatoire (rupture avec le prÃ©sent) :** avec *ago*, *yesterday*, *in $2022$*, *last decade*, *when* :
  * *Â« Engineers **designed** this grid ten years ago. Â»*
* **Present Perfect (lien avec le prÃ©sent ou durÃ©e ouverte) :** avec *since* (point de dÃ©part), *for* (durÃ©e jusqu'Ã  aujourd'hui), *so far*, *over the past few years*, *already / yet* :
  * *Â« Renewable output **has increased** significantly over the past decade. Â»*
* **Present Perfect Continuous ($\text{have been} + \text{V-ing}$) :** insiste sur l'activitÃ© en cours depuis une durÃ©e :
  * *Â« Researchers **have been working** on solid-state batteries **for** five years. Â»*

</CriticalFormula>

## 2. Les Structures de haut niveau qui valorisent une copie de concours

Pour viser $16+/20$ Ã  l'Ã©crit, remplacez les tournures scolaires par des structures idiomatiques anglaises :

* **Double comparatif d'accroissement corrÃ©lÃ© (*The more..., the more...*) :**
  * *Â« **The more** automated factories become, **the higher** the demand for skilled maintenance engineers. Â»*
* **Passif impersonnel des articles scientifiques :**
  * *Â« Nuclear fusion **is often said to be** the holy grail of clean energy. Â»* (au lieu du calque franÃ§ais fautif *Â« On dit souvent que... Â»*).
* **Inversion emphatique en tÃªte de phrase aprÃ¨s un adverbe restrictif (*Not only..., Seldom..., Never...*) :**
  * *Â« **Not only does** this process reduce carbon emissions, **but it also** lowers production costs. Â»*

<WarningBox title="PiÃ¨ges Ã©liminatoires des francophones (Faux-amis et IndÃ©nombrables)">

1. **Les noms indÃ©nombrables singuliers en anglais :** *information, advice, research, progress, equipment, evidence, news, knowledge* ne prennent **JAMAIS** d'article *Â« a Â»* ni de marque du pluriel *Â« -s Â»* ! On Ã©crit : *Â« **Further research is** needed Â»* ou *Â« **A piece of advice** Â»*.
2. **Faux-amis majeurs :** *actually* = en rÃ©alitÃ© (et non Â« actuellement Â» = *currently*) ; *eventually* = finalement / Ã  terme (et non Â« Ã©ventuellement Â» = *possibly / potentially*) ; *sensible* = raisonnable / judicieux (et non Â« sensible Â» = *sensitive*).

</WarningBox>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” RÃ¨gles d'Or Grammaticales Concours ATS">

* **IndÃ©nombrables toujours au singulier sans Â« -s Â» :** *information, research, progress, equipment, evidence, advice*.
* **Double comparatif :** *The + comparatif + Sujet + Verbe, the + comparatif + Sujet + Verbe*.
* **Inversion aprÃ¨s Not only :** *Not only + auxiliaire + Sujet + BV..., but also...*

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-01-fc-01",
        category: "PiÃ¨ge Classique",
        question: "Pourquoi la phrase Â« Many researches have given useful informations Â» comporte-t-elle deux fautes graves en anglais ?",
        answer: "Les noms Â« research Â» et Â« information Â» (tout comme advice, progress, equipment, evidence) sont INDÃ‰NOMBRABLES en anglais : ils ne prennent jamais de Â« -s Â» au pluriel et s'accordent toujours au singulier. Il faut Ã©crire : Â« Much research has provided useful information Â».",
      }),
      makeBuiltinFlashcard({
        id: "ang-01-fc-02",
        category: "DÃ©finition",
        question: "Traduire correctement les faux-amis suivants : 1) Actuellement / Actually â€” 2) Ã‰ventuellement / Eventually â€” 3) Sensible / Sensible.",
        answer: "1) Actuellement = currently / at present (tandis que actually = en rÃ©alitÃ©).\n2) Ã‰ventuellement = possibly / potentially (tandis que eventually = finalement, Ã  la longue).\n3) Sensible = sensitive (tandis que sensible = raisonnable, sensÃ©).",
      }),
      makeBuiltinFlashcard({
        id: "ang-01-fc-03",
        category: "Formule Critique",
        question: "Comment construit-on une inversion emphatique commenÃ§ant par Â« Not only... Â» ?",
        answer: "On inverse le sujet et l'auxiliaire dans la premiÃ¨re proposition (comme dans une question) : Â« Not only DOES this technology save energy, but it also cuts costs. Â»",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "ang-01-qcm-01",
        question: "Choose the grammatically correct sentence for an engineering exam essay:",
        choices: [
          "The latest equipment installed in the plant has provided reliable evidence of efficiency.",
          "The latest equipments installed in the plant have provided reliable evidences of efficiency.",
          "A new equipment installed in the plant has provided a reliable evidence.",
          "The latest equipment have provided many informations on efficiency.",
        ],
        correctIndex: 0,
        steps: [
          "In English, 'equipment', 'evidence', 'information', and 'research' are uncountable nouns.",
          "They never take a plural '-s', cannot be preceded by 'a/an', and always take a singular verb ('has provided').",
        ],
        keyFormula: "\\text{Uncountable nouns} \\implies \\text{Singular verb, no '-s'}",
      }),
      makeBuiltinQcm({
        id: "ang-01-qcm-02",
        question: "Which sentence correctly translates: Â« Plus les batteries sont lÃ©gÃ¨res, plus l'autonomie du vÃ©hicule est grande Â» ?",
        choices: [
          "The lighter the batteries are, the greater the vehicle's range is.",
          "More the batteries are light, more the range of the vehicle is big.",
          "The more light are the batteries, the more great is the range.",
          "As lighter as the batteries are, so greater is the range.",
        ],
        correctIndex: 0,
        steps: [
          "The double comparative structure requires 'The + comparative + Subject + Verb, the + comparative + Subject + Verb'.",
          "'Light' is a one-syllable adjective so its comparative is 'lighter' (not 'more light').",
        ],
        keyFormula: "\\text{The} + \\text{Comp}_1 + S_1 + V_1, \\; \\text{the} + \\text{Comp}_2 + S_2 + V_2",
      }),
    ],
  },

  "anglais/02": {
    course: `
## 1. MÃ©thodologie de la SynthÃ¨se de Dossier (*Synthesis*) Ã  l'Ã‰crit

L'Ã©preuve Ã©crite d'anglais au concours ATS demande gÃ©nÃ©ralement de rÃ©diger une **synthÃ¨se objective** d'un dossier de $3$ ou $4$ documents (articles de *The Economist*, *The Guardian*, *New Scientist*, graphiques) en **$250$ Ã  $300$ mots** ($\pm 10\\,\\%$), suivie d'un **essai argumentÃ© (*Essay*)**.

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Structure en 4 Ã©tapes d'une SynthÃ¨se de Dossier rÃ©ussie">

1. **Introduction compacte (1 seul paragraphe, 35â€“45 mots) :** PrÃ©sentez la thÃ©matique commune et la problÃ©matique qui relie les documents (sans faire une liste mÃ©canique *Â« Document 1 is an article from... Document 2 is... Â»* : intÃ©grez les sources au fil du dÃ©veloppement).
2. **DÃ©veloppement croisÃ© en 2 ou 3 paragraphes thÃ©matiques :** Chaque paragraphe confronte au moins **deux documents** autour d'une idÃ©e directrice (*While Author A highlights..., Author B warns against...*).
3. **Interdiction absolue de citer et de donner son avis :** Reformulez intÃ©gralement (*paraphrasing*) sans guillemets et sans jamais employer *Â« I think Â»* dans la synthÃ¨se.
4. **BrÃ¨ve phrase de bilan :** Concluez sur l'enjeu global soulevÃ© par le corpus (sans introduire d'idÃ©e extÃ©rieure aux textes).

</CriticalFormula>

## 2. La KhÃ´lle Audio et l'Oral de Concours (Compte rendu + Commentaire)

Ã€ l'oral (prÃ©paration $20$ minutes sur un enregistrement audio de $3$ minutes de la BBC ou NPR, puis $20$ minutes de passage), votre exposÃ© doit suivre un minutage prÃ©cis :
* **1. Introduction ($1\\text{ min }30$) :** Source, date, intervenants, sujet gÃ©nÃ©ral et **tension centrale** (*At the heart of this report lies the question of whether...*).
* **2. RÃ©sumÃ© structurÃ© de l'enregistrement ($4\\text{ Ã  }5\\text{ min}$) :** OrganisÃ© par **axes thÃ©matiques** (et non phrase par phrase).
* **3. Commentaire personnel (*Commentary*, $4\\text{ Ã  }5\\text{ min}$) :** Prenez de la hauteur en ouvrant sur les enjeux techniques, Ã©conomiques ou Ã©thiques du sujet avant l'entretien avec l'examinateur.
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” Connecteurs Logiques AcadÃ©miques (Essay & Oral)">

* **Opposition / Concession :** *Whereas, while, albeit, nevertheless, nonetheless, however, on the other hand, despite (+ nom / V-ing).*
* **Cause / ConsÃ©quence :** *Stemming from, owing to, thereby (+ V-ing), hence, consequently, as a result.*
* **Confrontation des auteurs :** *Both articles converge on the idea that..., Conversely, Smith challenges this view by arguing that...*

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-02-fc-01",
        category: "MÃ©thode",
        question: "Quelle est la diffÃ©rence grammaticale d'emploi entre Â« Although / Even though Â» et Â« Despite / In spite of Â» ?",
        answer: "- Â« Although / Even though Â» sont des conjonctions suivies d'une proposition complÃ¨te (Sujet + Verbe) : Â« Although the cost is high... Â».\n- Â« Despite / In spite of Â» sont des prÃ©positions suivies d'un groupe nominal ou d'un gÃ©rondif (V-ing) : Â« Despite the high cost... Â» (et jamais Â« Despite of Â» !).",
      }),
      makeBuiltinFlashcard({
        id: "ang-02-fc-02",
        category: "MÃ©thode",
        question: "Comment prÃ©senter efficacement un dossier de 3 documents dans l'introduction d'une synthÃ¨se Ã©crite en anglais ?",
        answer: "En regroupant l'origine et la date des documents en une seule phrase synthÃ©tique centrÃ©e sur leur thÃ¨me commun et le paradoxe qu'ils explorent, plutÃ´t que de rÃ©diger une liste fastidieuse document par document.",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "ang-02-qcm-01",
        question: "Which linking structure is grammatically correct to express concession in an academic essay?",
        choices: [
          "Despite investing billions in grid modernization, power outages remain frequent.",
          "Despite of investing billions in grid modernization, power outages remain frequent.",
          "Although the massive investment in grid modernization, power outages remain frequent.",
          "In spite the fact that billions were invested, power outages remain frequent.",
        ],
        correctIndex: 0,
        steps: [
          "'Despite' is never followed by 'of', and must be followed by a noun phrase or a gerund ('investing').",
          "'Although' must be followed by a subject and aconjugated verb ('Although they invested...').",
        ],
        keyFormula: "\\text{Despite} + \\text{Noun / V-ing} \\iff \\text{Although} + \\text{Subject} + \\text{Verb}",
      }),
    ],
  },

  "anglais/03": {
    course: `
## 1. Lexique stratÃ©gique de l'IngÃ©nieur : Ã‰nergie, Industrie 4.0 & IA

Les sujets de concours ATS puisent systÃ©matiquement dans quatre grands thÃ¨mes contemporains : la transition Ã©nergÃ©tique, l'automatisation industrielle, le numÃ©rique/IA et les enjeux gÃ©opolitiques des ressources.

<CriticalFormula title="Ã€ connaÃ®tre absolument â€” Vocabulaire clÃ© de la Transition Ã‰nergÃ©tique & Industrie">

* **RÃ©seau et dÃ©carbonation :** *the power grid* (le rÃ©seau Ã©lectrique), *greenhouse gas (GHG) emissions* (Ã©missions de GES), *fossil fuel phase-out* (sortie des Ã©nergies fossiles), *carbon footprint* (empreinte carbone), *intermittency* (intermittence de l'Ã©olien/solaire), *baseload power* (production Ã©lectrique de base assurÃ©e par le nuclÃ©aire ou l'hydraulique).
* **Industrie, ChaÃ®ne d'approvisionnement et MatiÃ¨res premiÃ¨res :** *supply chain bottlenecks* (goulets d'Ã©tranglement logistiques), *rare-earth elements* (terres rares), *predictive maintenance* (maintenance prÃ©dictive), *automation & robotics*, *reshoring* (relocalisation industrielle), *shortage* (pÃ©nurie).
* **Verbes d'Ã©volution pour commenter un graphique :** *to skyrocket / to surge / to soar* (flamber, bondir), *to plummet / to plunge* (s'effondrer), *to plateau / to level off* (plafonner, se stabiliser), *to outpace* (dÃ©passer en rythme de croissance).

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="SynthÃ¨se â€” Lexique de prÃ©cision pour commenter des donnÃ©es chiffrÃ©es">

* **Hausse forte :** *a sharp rise, to surge, to soar, to skyrocket*.
* **Baisse brutale :** *a steep decline, to plummet, to plunge, to dwindle*.
* **Double enjeu / Revers de la mÃ©daille :** *a double-edged sword, a trade-off between efficiency and resilience*.

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-03-fc-01",
        category: "DÃ©finition",
        question: "Comment traduit-on en anglais : 1) le rÃ©seau Ã©lectrique, 2) une pÃ©nurie de semi-conducteurs, 3) la relocalisation industrielle, 4) un compromis technique ?",
        answer: "1) The power grid (or electricity grid).\n2) A semiconductor shortage.\n3) Industrial reshoring.\n4) A technical trade-off.",
      }),
      makeBuiltinFlashcard({
        id: "ang-03-fc-02",
        category: "DÃ©finition",
        question: "Citer trois verbes anglais prÃ©cis pour traduire Â« monter en flÃ¨che Â» et deux verbes pour Â« chuter brutalement Â» lors d'un commentaire de graphique.",
        answer: "- Monter en flÃ¨che : to skyrocket, to surge, to soar.\n- Chuter brutalement : to plummet, to plunge.",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "ang-03-qcm-01",
        question: "In energy engineering, what does the term 'baseload power' refer to?",
        choices: [
          "The minimum level of continuous power supply required on the electrical grid over 24 hours",
          "The maximum peak voltage reached during a lightning strike",
          "Energy produced exclusively by domestic solar panels at noon",
          "The mechanical friction losses inside an electric motor",
        ],
        correctIndex: 0,
        steps: [
          "'Baseload power' (production de base ou ruban) dÃ©signe la puissance Ã©lectrique minimale continue que le rÃ©seau doit fournir en permanence, souvent assurÃ©e par le nuclÃ©aire ou l'hydraulique pour compenser l'intermittence des Ã©nergies renouvelables.",
        ],
        keyFormula: "\\text{Baseload power} + \\text{Peak load management}",
      }),
    ],
  },
};

function getBuiltinBundle(
  subjectId: string,
  chapterId: string
): BuiltinChapterBundle | null {
  const numPrefix = chapterId.slice(0, 2);
  return BUILTIN_CHAPTERS[`${subjectId}/${numPrefix}`] ?? null;
}

// Cache mÃ©moire en mÃ©moire vive pour Ã©viter les lectures disque fs rÃ©pÃ©titives
const MDX_MEMORY_CACHE = new Map<
  string,
  { frontmatter: Record<string, unknown>; content: string }
>();

export function getMdxContent(
  subjectId: string,
  chapterId: string,
  type: "course" | "summary"
): { frontmatter: Record<string, unknown>; content: string } | null {
  // 1. VÃ©rification dans le cache mÃ©moire
  const cacheKey = `${subjectId}/${chapterId}/${type}`;
  if (MDX_MEMORY_CACHE.has(cacheKey)) {
    return MDX_MEMORY_CACHE.get(cacheKey)!;
  }

  // 2. Lecture sur le disque
  const dir = resolveChapterDir(subjectId, chapterId);
  if (dir) {
    const candidates =
      type === "summary"
        ? ["summary.mdx", "synthesis.mdx"]
        : ["course.mdx"];

    for (const filename of candidates) {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);
        const result = {
          frontmatter: data,
          content: sanitizeMdxForCompiler(content),
        };
        MDX_MEMORY_CACHE.set(cacheKey, result);
        return result;
      }
    }
  }

  // 3. Fallback sur le contenu intÃ©grÃ©
  const builtin = getBuiltinBundle(subjectId, chapterId);
  if (builtin) {
    const result = {
      frontmatter: { title: chapterId },
      content: sanitizeMdxForCompiler(
        type === "summary" ? builtin.summary : builtin.course
      ),
    };
    MDX_MEMORY_CACHE.set(cacheKey, result);
    return result;
  }

  return null;
}

export function getFlashcardsData(
  subjectId: string,
  chapterId: string
): FlashcardItem[] {
  const dir = resolveChapterDir(subjectId, chapterId);
  if (dir) {
    const filePath = path.join(dir, "flashcards.json");
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const rawArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.cards)
          ? parsed.cards
          : [];
        if (rawArray.length > 0) {
          return rawArray.map((item: any, idx: number) =>
            normalizeFlashcard(item, idx)
          );
        }
      } catch {
        // Ignore et passe au fallback
      }
    }
  }

  const builtin = getBuiltinBundle(subjectId, chapterId);
  return builtin ? builtin.flashcards : [];
}

export function getQcmData(
  subjectId: string,
  chapterId: string
): QcmQuestion[] {
  let baseQuestions: QcmQuestion[] = [];

  // 1. Lecture du fichier qcm.json du chapitre sur le disque s'il existe
  const dir = resolveChapterDir(subjectId, chapterId);
  if (dir) {
    const filePath = path.join(dir, "qcm.json");
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        const rawArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.questions)
          ? parsed.questions
          : [];
        if (rawArray.length > 0) {
          baseQuestions = rawArray.map((item: any, idx: number) =>
            normalizeQcmQuestion(item, idx)
          );
        }
      } catch {
        // Ignore erreur JSON
      }
    }
  }

  // 2. Fallback sur les chapitres intÃ©grÃ©s si pas de fichier sur le disque
  if (baseQuestions.length === 0) {
    const builtin = getBuiltinBundle(subjectId, chapterId);
    if (builtin) {
      baseQuestions = builtin.qcm.map((item, idx) =>
        normalizeQcmQuestion(item, idx)
      );
    }
  }

  // 3. Injection systÃ©matique de 3 sÃ©ries de QCM calculatoires Ã  nombres alÃ©atoires pour CE chapitre
  const chapterNum = chapterId.slice(0, 2);
  const dynamicQuestions = generateDynamicQcmBank(3)
    .filter(
      (d) =>
        d.subjectId === subjectId && d.chapterId.slice(0, 2) === chapterNum
    )
    .map((d, idx) => normalizeQcmQuestion(d.question, baseQuestions.length + idx));

  // 4. Fusion + MÃ©lange alÃ©atoire de l'ordre des questions !
  return shuffleArray([...baseQuestions, ...dynamicQuestions]);
}
