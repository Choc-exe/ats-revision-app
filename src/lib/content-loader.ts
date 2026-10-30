import { generateDynamicQcmBank } from "@/lib/dynamic-qcm";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { FlashcardItem, QcmQuestion } from "@/types/pedagogy";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/**
 * Résout automatiquement le vrai dossier sur le disque dans content/<subjectId>/ :
 * - Si content/<subjectId>/<chapterId> existe, on l'utilise.
 * - Sinon, on cherche tout dossier qui commence par le même numéro (ex: "02-").
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
 * Sécurise n'importe quel contenu MDX avant compilation par next-mdx-remote
 * (Évite définitivement l'erreur "Expected a closing tag for <CriticalFormula>")
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
          commonTrap:
            raw.back.commonTrap ?? raw.back.trap ?? raw.tip ?? undefined,
        }
      : {
          mainAnswer:
            typeof raw?.back === "string"
              ? raw.back
              : typeof raw?.answer === "string"
              ? raw.answer
              : "",
          criticalFormula: raw?.criticalFormula ?? raw?.latex ?? undefined,
          commonTrap: raw?.commonTrap ?? raw?.tip ?? undefined,
        };

  return {
    id: raw?.id ?? `fc-${index + 1}`,
    category: raw?.category ?? "Formule Critique",
    difficulty: raw?.difficulty ?? "Concours ATS",
    front: frontText,
    back: backObj,
  } as unknown as FlashcardItem;
}

/**
 * Mélange un tableau sur place (Algorithme de Fisher-Yates)
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
 * ET mélange aléatoirement l'emplacement des options A, B, C, D pour que
 * la bonne réponse ne soit JAMAIS au même endroit !
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

  // 1. On type explicitement le tableau avant le mélange
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

  // 2. MÉLANGE ALÉATOIRE DES EMPLACEMENTS (A, B, C, D)
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
              : ["Appliquer la méthode du cours."],
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
    | "Théorème"
    | "Définition"
    | "Méthode"
    | "Piège Classique";
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
// CONTENU INTÉGRÉ POUR LES CHAPITRES DE COMPLÉMENT (INCLUT ANGLAIS ATS)
// ============================================================================
const BUILTIN_CHAPTERS: Record<string, BuiltinChapterBundle> = {
  "physique-chimie/08": {
    course: `
## 1. Structure de la matière, Noyau et Isotopes (Annexe V)

Un noyau atomique est représenté par le symbole $^A_Z\\text{X}$, où **$Z$** est le **numéro atomique** (nombre de protons) et **$A = Z + N$** est le **nombre de masse** (nombre total de nucléons : protons + neutrons). Deux **isotopes** possèdent le même numéro atomique $Z$ (même élément chimique) mais un nombre de neutrons $N$ différent.

<CriticalFormula title="À connaître absolument — Quantité de matière et Défaut de masse nucléaire">

$$n = \\frac{m}{M} = \\frac{\\rho \\cdot V}{M} = \\frac{N_{\\text{entités}}}{N_A} = C \\cdot V_{\\text{sol}} = \\frac{P \\cdot V_{\\text{gaz}}}{R \\cdot T}$$

$$E_{\\text{libérée}} = \\Delta m \\cdot c^2 \\quad \\text{avec} \\quad c \\approx 3{,}00 \\times 10^8\\text{ m}\\cdot\\text{s}^{-1}$$

</CriticalFormula>

## 2. Transformations chimiques, Avancement et Combustions

Pour une réaction $\\nu_A\\,\\text{A} + \\nu_B\\,\\text{B} \\rightarrow \\nu_C\\,\\text{C} + \\nu_D\\,\\text{D}$, l'**avancement maximal** est $x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)$, ce qui identifie le **réactif limitant**.

<CriticalFormula title="À connaître absolument — Combustion complète, Masse de CO₂ et PCI">

$$\\text{C}_x\\text{H}_y\\text{O}_z + \\left(x + \\frac{y}{4} - \\frac{z}{2}\\right)\\text{O}_2 \\longrightarrow x\\,\\text{CO}_2 + \\frac{y}{2}\\,\\text{H}_2\\text{O}$$

$$m(\\text{CO}_2) = x \\cdot \\frac{M_{\\text{CO}_2}}{M_{\\text{carb}}} \\cdot m_{\\text{carb}} \\quad (M_{\\text{CO}_2} = 44{,}0\\text{ g}\\cdot\\text{mol}^{-1}) \\quad \\text{et} \\quad Q_{\\text{lib}} = m_{\\text{carb}} \\cdot \\text{PCI}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Quantité de matière, Combustions et Nucléaire">

$$n = \\frac{m}{M} = C\\,V_{\\text{sol}} = \\frac{P\\,V_{\\text{gaz}}}{R\\,T} \\quad ; \\quad x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)$$

$$m(\\text{CO}_2) = x \\cdot \\frac{44{,}0}{M_{\\text{carb}}} \\cdot m_{\\text{carb}} \\quad ; \\quad Q_{\\text{lib}} = m_{\\text{carb}} \\cdot \\text{PCI} \\quad ; \\quad E_{\\text{nucl}} = \\Delta m \\cdot c^2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "pc-08-fc-01",
        category: "Définition",
        question: "Que représentent $A$, $Z$ et $N = A - Z$ dans la notation $^A_Z\\text{X}$ et qu'appelle-t-on isotopes ?",
        answer: "$Z$ est le nombre de protons (numéro atomique), $A$ le nombre de nucléons et $N = A-Z$ le nombre de neutrons. Deux isotopes ont le même $Z$ mais un nombre de masse $A$ différent.",
        criticalFormula: "A = Z + N \\quad ; \\quad n = \\frac{m}{M} = \\frac{N_{\\text{entités}}}{N_A}",
      }),
      makeBuiltinFlashcard({
        id: "pc-08-fc-02",
        category: "Formule Critique",
        question: "Quelle masse de $\\text{CO}_2$ ($M=44\\text{ g/mol}$) rejette la combustion complète de $1{,}00\\text{ kg}$ d'octane $\\text{C}_8\\text{H}_{18}$ ($M=114\\text{ g/mol}$) ?",
        answer: "Chaque mole d'octane brûlée produit 8 moles de dioxyde de carbone, soit environ $3{,}09\\text{ kg}$ de $\\text{CO}_2$ par kilogramme de carburant.",
        criticalFormula: "m(\\text{CO}_2) = 8 \\times \\frac{44}{114} \\times 1{,}00\\text{ kg} \\approx 3{,}09\\text{ kg}",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "pc-08-qcm-01",
        question: "On brûle $2{,}0\\text{ mol}$ de $\\text{CH}_4$ avec $3{,}0\\text{ mol}$ de $\\text{O}_2$ selon $\\text{CH}_4 + 2\\,\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\,\\text{H}_2\\text{O}$. Que vaut l'avancement maximal $x_{\\max}$ ?",
        choices: [
          "$x_{\\max} = 1{,}5\\text{ mol}$",
          "$x_{\\max} = 2{,}0\\text{ mol}$",
          "$x_{\\max} = 3{,}0\\text{ mol}$",
          "$x_{\\max} = 1{,}0\\text{ mol}$",
        ],
        correctIndex: 0,
        steps: [
          "On calcule les rapports stœchiométriques initiaux : $n_0(\\text{CH}_4)/1 = 2{,}0\\text{ mol}$ et $n_0(\\text{O}_2)/2 = 3{,}0/2 = 1{,}5\\text{ mol}$.",
          "Le dioxygène $\\text{O}_2$ est le réactif limitant et impose $x_{\\max} = 1{,}5\\text{ mol}$.",
        ],
        keyFormula: "x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)",
        commonTrap: "Oublier de diviser la quantité initiale de dioxygène par son coefficient stœchiométrique $\\nu = 2$.",
      }),
    ],
  },

  "physique-chimie/09": {
    course: `
## 1. Incertitudes-types (Type A et Type B) et Propagation (Annexe V)

<CriticalFormula title="À connaître absolument — Incertitudes-types A/B, Propagation et Score z">

* **Type A ($N$ mesures d'écart-type $s_{n-1}$) :** $u(\\bar{x}) = \\dfrac{s_{n-1}}{\\sqrt{N}}$.
* **Type B (demi-étendue $\\pm a$) :** $u(x) = \\dfrac{a}{\\sqrt{3}}$.
* **Propagation sur produit/quotient ($G = k X^\\alpha Y^\\beta$) :** $\\dfrac{u(G)}{|G|} = \\sqrt{\\alpha^2\\left(\\dfrac{u(X)}{X}\\right)^2 + \\beta^2\\left(\\dfrac{u(Y)}{Y}\\right)^2}$.

$$z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{\\sqrt{u(g_{\\text{exp}})^2 + u(g_{\\text{réf}})^2}} \\le 2 \\quad (\\text{mesure compatible si } z \\le 2)$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Incertitudes-types et Validation expérimentale">

$$u_{\\text{A}}(\\bar{x}) = \\frac{s_{n-1}}{\\sqrt{N}} \\quad ; \\quad u_{\\text{B}}(x) = \\frac{a}{\\sqrt{3}} \\quad ; \\quad z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{u(g_{\\text{exp}})} \\le 2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "pc-09-fc-01",
        category: "Formule Critique",
        question: "Quelle est la condition sur l'écart normalisé $z$ pour valider la compatibilité d'une mesure $g_{\\text{exp}} \\pm u(g_{\\text{exp}})$ avec $g_{\\text{réf}}$ ?",
        answer: "L'écart normalisé doit rester inférieur ou égal à 2 (niveau de confiance de 95 %).",
        criticalFormula: "z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{u(g_{\\text{exp}})} \\le 2",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "pc-09-qcm-01",
        question: "On mesure $g_{\\text{exp}} = 9{,}72 \\pm 0{,}06\\text{ m}\\cdot\\text{s}^{-2}$ pour $g_{\\text{réf}} = 9{,}81\\text{ m}\\cdot\\text{s}^{-2}$. Que vaut l'écart normalisé $z$ ?",
        choices: [
          "$z = 1{,}50 \\le 2$ (compatible)",
          "$z = 2{,}50 > 2$ (incompatible)",
          "$z = 0{,}09$ (compatible)",
          "$z = 0{,}75$ (compatible)",
        ],
        correctIndex: 0,
        steps: [
          "On calcule l'écart absolu $|9{,}72 - 9{,}81| = 0{,}09\\text{ m}\\cdot\\text{s}^{-2}$.",
          "On divise par l'incertitude-type $u(g_{\\text{exp}}) = 0{,}06$ : $z = 0{,}09 / 0{,}06 = 1{,}50 \\le 2$.",
        ],
        keyFormula: "z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{u(g_{\\text{exp}})}",
      }),
    ],
  },

  "mathematiques/07": {
    course: `
## 1. Convergence des suites réelles et Équivalents (Annexe III)

<CriticalFormula title="À connaître absolument — Convergence monotone, Suites adjacentes et TVI">

* **Convergence monotone :** Toute suite réelle **croissante et majorée** (ou décroissante et minorée) converge.
* **Suites adjacentes :** Si $(u_n)$ est croissante, $(v_n)$ est décroissante et $\\lim_{n\\to+\\infty}(v_n - u_n) = 0$, elles convergent vers la même limite $\\ell$.
* **Théorème des Valeurs Intermédiaires (TVI) :** Si $f$ est continue sur $[a, b]$ et $f(a)f(b) \\le 0$, l'équation $f(x) = 0$ admet au moins une solution dans $[a, b]$ (unique si $f$ est strictement monotone).

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Suites, Équivalents en 0 et Continuité">

$$\\text{Pour } u_n \\to 0 : \\quad \\sin(u_n) \\sim u_n \\quad ; \\quad \\ln(1+u_n) \\sim u_n \\quad ; \\quad \\mathrm{e}^{u_n} - 1 \\sim u_n \\quad ; \\quad 1 - \\cos(u_n) \\sim \\frac{u_n^2}{2}$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-07-fc-01",
        category: "Théorème",
        question: "Quelles sont les hypothèses du théorème de la bijection monotone sur un intervalle $I$ ?",
        answer: "$f$ doit être continue et strictement monotone sur l'intervalle $I$. Elle réalise alors une bijection de $I$ sur l'intervalle image $J = f(I)$.",
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
          "Par équivalent usuel, $1 - \\cos(u_n) \\sim u_n^2 / 2 = (4/n^2)/2 = 2/n^2$, donc $n^2(1 - \\cos(2/n)) \\to 2$.",
        ],
        keyFormula: "1 - \\cos(u_n) \\underset{u_n \\to 0}{\\sim} \\frac{u_n^2}{2}",
      }),
    ],
  },

  "mathematiques/08": {
    course: `
## 1. Théorème de Rolle, Accroissements Finis et Développements Limités

<CriticalFormula title="À connaître absolument — Accroissements Finis (TAF) et Taylor-Young">

Si $f$ est continue sur $[a, b]$ et dérivable sur $]a, b[$, il existe $c \\in ]a, b[$ tel que $f(b) - f(a) = f'(c)(b - a)$.

$$\\mathrm{e}^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + o(x^3) \\quad ; \\quad \\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3)$$

$$\\sin x = x - \\frac{x^3}{6} + o(x^4) \\quad ; \\quad \\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^5)$$

$$(1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2}x^2 + o(x^2) \\quad ; \\quad \\arctan x = x - \\frac{x^3}{3} + o(x^4)$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Développements Limités usuels en 0">

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
          "On écrit les $\\text{DL}_2(0)$ : $\\mathrm{e}^x - 1 = x + x^2/2 + o(x^2)$ et $\\sin x = x + o(x^2)$.",
          "La différence vaut $x^2/2 + o(x^2)$, donc le quotient par $x^2$ tend vers $1/2$.",
        ],
        keyFormula: "\\mathrm{e}^x = 1 + x + \\frac{x^2}{2} + o(x^2)",
      }),
    ],
  },

  "mathematiques/09": {
    course: `
## 1. Intégration sur un segment et Intégrales impropres (Riemann)

<CriticalFormula title="À connaître absolument — IPP, Changement de variable et Critères de Riemann">

$$\\int_a^b u(x)\\,v'(x)\\,\\mathrm{d}x = \\Big[u(x)\\,v(x)\\Big]_a^b - \\int_a^b u'(x)\\,v(x)\\,\\mathrm{d}x$$

$$\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha} \\text{ converge} \\iff \\mathbf{\\alpha > 1} \\quad \\text{et} \\quad \\int_0^1 \\frac{\\mathrm{d}t}{t^\\alpha} \\text{ converge} \\iff \\mathbf{\\alpha < 1}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Sommes de Riemann et Intégrales généralisées">

$$\\lim_{n\\to+\\infty}\\frac{1}{n}\\sum_{k=1}^n f\\left(\\frac{k}{n}\\right) = \\int_0^1 f(t)\\,\\mathrm{d}t \\quad ; \\quad \\int_0^{+\\infty} \\mathrm{e}^{-\\lambda t}\\,\\mathrm{d}t = \\frac{1}{\\lambda} \\;(\\lambda > 0)$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-09-fc-01",
        category: "Théorème",
        question: "Pour quelles valeurs de $\\alpha$ l'intégrale $\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha}$ converge-t-elle ? Et sur $]0, 1]$ ?",
        answer: "Sur $[1, +\\infty[$, elle converge si et seulement si $\\alpha > 1$. Sur $]0, 1]$, elle converge si et seulement si $\\alpha < 1$.",
        criticalFormula: "\\int_1^{+\\infty} \\frac{\\mathrm{d}t}{t^\\alpha} < +\\infty \\iff \\alpha > 1",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-09-qcm-01",
        question: "Que vaut $\\int_1^{\\mathrm{e}} x\\ln(x)\\,\\mathrm{d}x$ par intégration par parties ?",
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
## 1. Séries numériques et Séries de Fourier d'un signal $T$-périodique

<CriticalFormula title="À connaître absolument — Coefficients de Fourier, Dirichlet et Parseval">

$$a_0 = \\frac{1}{T}\\int_0^T f(t)\\,\\mathrm{d}t \\quad ; \\quad a_n = \\frac{2}{T}\\int_0^T f(t)\\cos(n\\omega t)\\,\\mathrm{d}t \\quad ; \\quad b_n = \\frac{2}{T}\\int_0^T f(t)\\sin(n\\omega t)\\,\\mathrm{d}t$$

* **Théorème de Dirichlet :** $S_f(t) = \\dfrac{f(t^+) + f(t^-)}{2}$.
* **Formule de Parseval :** $\\dfrac{1}{T}\\int_0^T |f(t)|^2\\,\\mathrm{d}t = a_0^2 + \\dfrac{1}{2}\\sum_{n=1}^{+\\infty}\\left(a_n^2 + b_n^2\\right)$.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Séries de Riemann et Symétries de Fourier">

$$\\sum_{n\\ge 1}\\frac{1}{n^\\alpha} \\text{ converge} \\iff \\alpha > 1 \\quad ; \\quad f \\text{ paire} \\implies b_n = 0 \\quad ; \\quad f \\text{ impaire} \\implies a_n = 0$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-10-fc-01",
        category: "Formule Critique",
        question: "Énoncer l'égalité de Parseval pour une fonction $T$-périodique.",
        answer: "La puissance moyenne du signal sur une période est égale à la somme des puissances moyennes de ses harmoniques.",
        criticalFormula: "\\frac{1}{T}\\int_0^T f(t)^2\\,\\mathrm{d}t = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty}(a_n^2 + b_n^2)",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "math-10-qcm-01",
        question: "Un signal a pour série de Fourier $u(t) = 3 + 4\\cos(\\omega t) + 2\\sqrt{2}\\sin(2\\omega t)$. Que vaut sa valeur efficace $U_{\\text{eff}}$ ?",
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
## 1. Dérivées partielles, Gradient, Schwarz et Extremums locaux

<CriticalFormula title="À connaître absolument — Gradient, Plan tangent et Critère rt - s² de Monge">

$$\\overrightarrow{\\text{grad}}\\,f(x, y) = \\nabla f(x, y) = \\begin{pmatrix} \\partial f/\\partial x \\\\ \\partial f/\\partial y \\end{pmatrix} \\quad ; \\quad \\mathrm{d}f = \\frac{\\partial f}{\\partial x}\\mathrm{d}x + \\frac{\\partial f}{\\partial y}\\mathrm{d}y$$

* Si **$rt - s^2 > 0$** : **extremum local** (minimum si $r > 0$, maximum si $r < 0$).
* Si **$rt - s^2 < 0$** : **point col (ou point selle)**, pas d'extremum.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Théorème de Schwarz et Matrice Hessienne">

$$\\text{Classe } \\mathcal{C}^2 \\implies \\frac{\\partial^2 f}{\\partial x \\partial y} = \\frac{\\partial^2 f}{\\partial y \\partial x} \\quad ; \\quad \\det H_f(x_0, y_0) = r\\,t - s^2$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "math-11-fc-01",
        category: "Méthode",
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
          "On calcule les dérivées secondes : $r = 2$, $s = -2$ et $t = 6$.",
          "Comme $rt - s^2 = 12 - 4 = 8 > 0$ et $r = 2 > 0$, $(0, 0)$ est un minimum local strict.",
        ],
        keyFormula: "\\Delta = r\\,t - s^2 > 0 \\text{ et } r > 0 \\implies \\text{Minimum}",
      }),
    ],
  },

  "sii/05": {
    course: `
## 1. Ingénierie Système (SysML), Chaîne d'acquisition et Conception (Annexe VI)

<CriticalFormula title="À connaître absolument — Résolution d'un CAN et Codeur incrémental">

$$q = \\frac{U_{\\text{PE}}}{2^N} \\quad \\text{et} \\quad \\Delta \\theta_{\\text{quad}} = \\frac{2\\pi}{4\\,P}\\text{ rad} = \\frac{360^\\circ}{4\\,P}$$

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Chaîne d'acquisition et Montage de roulements">

$$q_{\\text{CAN}} = \\frac{U_{\\text{PE}}}{2^N} \\quad ; \\quad f_e > 2\\,f_{\\max}$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "sii-05-fc-01",
        category: "Formule Critique",
        question: "Quel est le quantum $q$ d'un Convertisseur Analogique-Numérique (CAN) de $12\\text{ bits}$ sur une plage $0\\text{–}10\\text{ V}$ ?",
        answer: "Le CAN possède $2^{12} = 4096$ niveaux de quantification.",
        criticalFormula: "q = \\frac{U_{\\text{PE}}}{2^N} = \\frac{10}{4096} \\approx 2{,}44\\text{ mV}",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "sii-05-qcm-01",
        question: "Dans un guidage en rotation par deux roulements à billes à contact radial, si l'arbre tourne et la charge radiale a une direction fixe (poids), comment doivent être montées les bagues ?",
        choices: [
          "Bagues intérieures (tournantes) montées serrées sur l'arbre ; bagues extérieures (fixes) montées glissantes dans l'alésage",
          "Bagues intérieures montées glissantes ; bagues extérieures montées serrées",
          "Toutes les bagues montées serrées",
          "Toutes les bagues montées glissantes",
        ],
        correctIndex: 0,
        steps: [
          "La bague intérieure liée à l'arbre tourne par rapport à la direction fixe de la charge : elle doit être montée serrée.",
          "La bague extérieure liée à l'alésage est fixe par rapport à la charge : elle est montée glissante.",
        ],
        keyFormula: "N_{\\text{obstacles bagues serrées}} = 4 \\quad ; \\quad N_{\\text{obstacles bagues glissantes}} = 2",
      }),
    ],
  },

  "francais-philosophie/01": {
    course: `
## 1. Méthodologie de la Contraction (Résumé de texte) au Concours ATS

<CriticalFormula title="À connaître absolument — Les 4 Règles d'Or du Résumé de Texte ATS">

1. **Marge de tolérance de $\\pm 10\\,\\%$ impérative :** Pour une consigne à $100$ mots, le résumé doit compter entre **$90$ et $110$ mots**.
2. **Respect du système d'énonciation :** Vous rédigez **à la place de l'auteur**.
3. **Reformulation personnelle intégrale :** Aucun collage ni citation du texte source.
4. **Fidélité à l'ordre et à la logique :** Respectez l'enchaînement des thèses du texte.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Décompte officiel des mots">

$$90 \\le N_{\\text{mots}} \\le 110 \\quad (\\text{pour une consigne à } 100 \\text{ mots})$$

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-01-fc-01",
        category: "Méthode",
        question: "Quelles sont les quatre règles formelles impératives du résumé de texte au concours ATS ?",
        answer: "1. Respecter la fourchette de ± 10 % du nombre de mots. 2. Adopter l'énonciation de l'auteur (interdiction d'écrire « L'auteur dit que... »). 3. Reformuler sans citer le texte. 4. Suivre l'ordre du texte.",
        criticalFormula: "90 \\le N_{\\text{mots}} \\le 110",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "fr-01-qcm-01",
        question: "Dans un résumé de texte au concours ATS dont la consigne est de 100 mots (± 10 %), laquelle de ces pratiques est une faute méthodologique grave ?",
        choices: [
          "Commencer par « Dans cet extrait, l'auteur démontre que... »",
          "Utiliser la première personne « je » ou « nous » comme dans le texte source",
          "Rédiger un texte de 96 mots",
          "Remplacer une longue énumération d'exemples par le concept général qu'elle illustre",
        ],
        correctIndex: 0,
        steps: [
          "Le candidat doit se substituer à l'auteur du texte en conservant son système d'énonciation.",
          "Toute mention extérieure (« l'auteur pense que », « selon ce texte ») est sanctionnée.",
        ],
        keyFormula: "90 \\le N_{\\text{mots}} \\le 110",
      }),
    ],
  },

  "francais-philosophie/02": {
    course: `
## 1. Exploitation comparée des Œuvres au Programme Officiel ATS

<CriticalFormula title="À connaître absolument — Méthode de confrontation des œuvres en une sous-partie">

1. **Thèse directrice :** Énoncez l'idée maîtresse du paragraphe dès la première phrase.
2. **Première œuvre :** Mobilisez un passage précis en analysant ses procédés.
3. **Pivot comparatif :** Utilisez un connecteur de rapprochement ou de nuance.
4. **Seconde œuvre :** Montrez comment la seconde œuvre éclaire ou dépasse la première.

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Règles de citation et de ponctuation des titres">

* **Titre d'œuvre intégrale :** toujours souligné sur copie manuscrite (sans guillemets).
* **Citation courte :** intégrée entre guillemets et immédiatement analysée.

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-02-fc-01",
        category: "Méthode",
        question: "Comment éviter l'écueil de la « juxtaposition des œuvres » dans une partie de dissertation ?",
        answer: "En organisant chaque partie autour d'une idée directrice (un concept) et en faisant dialoguer deux œuvres à l'intérieur d'une même sous-partie.",
      }),
    ],
    qcm: [
      makeBuiltinQcm({
        id: "fr-02-qcm-01",
        question: "Quelle est la bonne méthode pour utiliser une citation issue d'une œuvre au programme dans une copie de concours ?",
        choices: [
          "L'insérer de façon fluide, l'expliquer et montrer en quoi elle prouve l'argument de la sous-partie",
          "Recopier une citation de dix lignes sans la commenter",
          "Enchaîner trois citations à la suite en fin de paragraphe",
          "Raconter toute l'intrigue du livre avant de citer une phrase",
        ],
        correctIndex: 0,
        steps: [
          "Une citation ne constitue pas une preuve à elle seule : elle doit être expliquée et reliée à la thèse du paragraphe.",
        ],
        keyFormula: "3 \\text{ parties} \\times 3 \\text{ sous-parties}",
      }),
    ],
  },

  // ==========================================================================
  // NOUVELLE MATIÈRE : ANGLAIS CONCOURS ATS (CHAPITRES 01, 02 ET 03)
  // ==========================================================================
  "anglais/01": {
    course: `
## 1. Concordance des temps, Aspect *Present Perfect* vs *Preterite*

La maîtrise grammaticale est évaluée aussi bien dans la synthèse écrite que lors de la khôlle orale du concours ATS. L'erreur la plus sanctionnée concerne la confusion entre le **prétérit** (action passée datée, coupée du présent) et le **present perfect** ($\text{have/has} + \text{participe passé}$ : bilan dans le présent ou action commencée dans le passé qui continue).

<CriticalFormula title="À connaître absolument — Marqueurs temporels et Structures en FOR / SINCE">

* **Preterite obligatoire (rupture avec le présent) :** avec *ago*, *yesterday*, *in $2022$*, *last decade*, *when* :
  * *« Engineers **designed** this grid ten years ago. »*
* **Present Perfect (lien avec le présent ou durée ouverte) :** avec *since* (point de départ), *for* (durée jusqu'à aujourd'hui), *so far*, *over the past few years*, *already / yet* :
  * *« Renewable output **has increased** significantly over the past decade. »*
* **Present Perfect Continuous ($\text{have been} + \text{V-ing}$) :** insiste sur l'activité en cours depuis une durée :
  * *« Researchers **have been working** on solid-state batteries **for** five years. »*

</CriticalFormula>

## 2. Les Structures de haut niveau qui valorisent une copie de concours

Pour viser $16+/20$ à l'écrit, remplacez les tournures scolaires par des structures idiomatiques anglaises :

* **Double comparatif d'accroissement corrélé (*The more..., the more...*) :**
  * *« **The more** automated factories become, **the higher** the demand for skilled maintenance engineers. »*
* **Passif impersonnel des articles scientifiques :**
  * *« Nuclear fusion **is often said to be** the holy grail of clean energy. »* (au lieu du calque français fautif *« On dit souvent que... »*).
* **Inversion emphatique en tête de phrase après un adverbe restrictif (*Not only..., Seldom..., Never...*) :**
  * *« **Not only does** this process reduce carbon emissions, **but it also** lowers production costs. »*

<WarningBox title="Pièges éliminatoires des francophones (Faux-amis et Indénombrables)">

1. **Les noms indénombrables singuliers en anglais :** *information, advice, research, progress, equipment, evidence, news, knowledge* ne prennent **JAMAIS** d'article *« a »* ni de marque du pluriel *« -s »* ! On écrit : *« **Further research is** needed »* ou *« **A piece of advice** »*.
2. **Faux-amis majeurs :** *actually* = en réalité (et non « actuellement » = *currently*) ; *eventually* = finalement / à terme (et non « éventuellement » = *possibly / potentially*) ; *sensible* = raisonnable / judicieux (et non « sensible » = *sensitive*).

</WarningBox>
`,
    summary: `
<CriticalFormula title="Synthèse — Règles d'Or Grammaticales Concours ATS">

* **Indénombrables toujours au singulier sans « -s » :** *information, research, progress, equipment, evidence, advice*.
* **Double comparatif :** *The + comparatif + Sujet + Verbe, the + comparatif + Sujet + Verbe*.
* **Inversion après Not only :** *Not only + auxiliaire + Sujet + BV..., but also...*

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-01-fc-01",
        category: "Piège Classique",
        question: "Pourquoi la phrase « Many researches have given useful informations » comporte-t-elle deux fautes graves en anglais ?",
        answer: "Les noms « research » et « information » (tout comme advice, progress, equipment, evidence) sont INDÉNOMBRABLES en anglais : ils ne prennent jamais de « -s » au pluriel et s'accordent toujours au singulier. Il faut écrire : « Much research has provided useful information ».",
      }),
      makeBuiltinFlashcard({
        id: "ang-01-fc-02",
        category: "Définition",
        question: "Traduire correctement les faux-amis suivants : 1) Actuellement / Actually — 2) Éventuellement / Eventually — 3) Sensible / Sensible.",
        answer: "1) Actuellement = currently / at present (tandis que actually = en réalité).\n2) Éventuellement = possibly / potentially (tandis que eventually = finalement, à la longue).\n3) Sensible = sensitive (tandis que sensible = raisonnable, sensé).",
      }),
      makeBuiltinFlashcard({
        id: "ang-01-fc-03",
        category: "Formule Critique",
        question: "Comment construit-on une inversion emphatique commençant par « Not only... » ?",
        answer: "On inverse le sujet et l'auxiliaire dans la première proposition (comme dans une question) : « Not only DOES this technology save energy, but it also cuts costs. »",
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
        question: "Which sentence correctly translates: « Plus les batteries sont légères, plus l'autonomie du véhicule est grande » ?",
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
## 1. Méthodologie de la Synthèse de Dossier (*Synthesis*) à l'Écrit

L'épreuve écrite d'anglais au concours ATS demande généralement de rédiger une **synthèse objective** d'un dossier de $3$ ou $4$ documents (articles de *The Economist*, *The Guardian*, *New Scientist*, graphiques) en **$250$ à $300$ mots** ($\pm 10\\,\\%$), suivie d'un **essai argumenté (*Essay*)**.

<CriticalFormula title="À connaître absolument — Structure en 4 étapes d'une Synthèse de Dossier réussie">

1. **Introduction compacte (1 seul paragraphe, 35–45 mots) :** Présentez la thématique commune et la problématique qui relie les documents (sans faire une liste mécanique *« Document 1 is an article from... Document 2 is... »* : intégrez les sources au fil du développement).
2. **Développement croisé en 2 ou 3 paragraphes thématiques :** Chaque paragraphe confronte au moins **deux documents** autour d'une idée directrice (*While Author A highlights..., Author B warns against...*).
3. **Interdiction absolue de citer et de donner son avis :** Reformulez intégralement (*paraphrasing*) sans guillemets et sans jamais employer *« I think »* dans la synthèse.
4. **Brève phrase de bilan :** Concluez sur l'enjeu global soulevé par le corpus (sans introduire d'idée extérieure aux textes).

</CriticalFormula>

## 2. La Khôlle Audio et l'Oral de Concours (Compte rendu + Commentaire)

À l'oral (préparation $20$ minutes sur un enregistrement audio de $3$ minutes de la BBC ou NPR, puis $20$ minutes de passage), votre exposé doit suivre un minutage précis :
* **1. Introduction ($1\\text{ min }30$) :** Source, date, intervenants, sujet général et **tension centrale** (*At the heart of this report lies the question of whether...*).
* **2. Résumé structuré de l'enregistrement ($4\\text{ à }5\\text{ min}$) :** Organisé par **axes thématiques** (et non phrase par phrase).
* **3. Commentaire personnel (*Commentary*, $4\\text{ à }5\\text{ min}$) :** Prenez de la hauteur en ouvrant sur les enjeux techniques, économiques ou éthiques du sujet avant l'entretien avec l'examinateur.
`,
    summary: `
<CriticalFormula title="Synthèse — Connecteurs Logiques Académiques (Essay & Oral)">

* **Opposition / Concession :** *Whereas, while, albeit, nevertheless, nonetheless, however, on the other hand, despite (+ nom / V-ing).*
* **Cause / Conséquence :** *Stemming from, owing to, thereby (+ V-ing), hence, consequently, as a result.*
* **Confrontation des auteurs :** *Both articles converge on the idea that..., Conversely, Smith challenges this view by arguing that...*

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-02-fc-01",
        category: "Méthode",
        question: "Quelle est la différence grammaticale d'emploi entre « Although / Even though » et « Despite / In spite of » ?",
        answer: "- « Although / Even though » sont des conjonctions suivies d'une proposition complète (Sujet + Verbe) : « Although the cost is high... ».\n- « Despite / In spite of » sont des prépositions suivies d'un groupe nominal ou d'un gérondif (V-ing) : « Despite the high cost... » (et jamais « Despite of » !).",
      }),
      makeBuiltinFlashcard({
        id: "ang-02-fc-02",
        category: "Méthode",
        question: "Comment présenter efficacement un dossier de 3 documents dans l'introduction d'une synthèse écrite en anglais ?",
        answer: "En regroupant l'origine et la date des documents en une seule phrase synthétique centrée sur leur thème commun et le paradoxe qu'ils explorent, plutôt que de rédiger une liste fastidieuse document par document.",
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
## 1. Lexique stratégique de l'Ingénieur : Énergie, Industrie 4.0 & IA

Les sujets de concours ATS puisent systématiquement dans quatre grands thèmes contemporains : la transition énergétique, l'automatisation industrielle, le numérique/IA et les enjeux géopolitiques des ressources.

<CriticalFormula title="À connaître absolument — Vocabulaire clé de la Transition Énergétique & Industrie">

* **Réseau et décarbonation :** *the power grid* (le réseau électrique), *greenhouse gas (GHG) emissions* (émissions de GES), *fossil fuel phase-out* (sortie des énergies fossiles), *carbon footprint* (empreinte carbone), *intermittency* (intermittence de l'éolien/solaire), *baseload power* (production électrique de base assurée par le nucléaire ou l'hydraulique).
* **Industrie, Chaîne d'approvisionnement et Matières premières :** *supply chain bottlenecks* (goulets d'étranglement logistiques), *rare-earth elements* (terres rares), *predictive maintenance* (maintenance prédictive), *automation & robotics*, *reshoring* (relocalisation industrielle), *shortage* (pénurie).
* **Verbes d'évolution pour commenter un graphique :** *to skyrocket / to surge / to soar* (flamber, bondir), *to plummet / to plunge* (s'effondrer), *to plateau / to level off* (plafonner, se stabiliser), *to outpace* (dépasser en rythme de croissance).

</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Lexique de précision pour commenter des données chiffrées">

* **Hausse forte :** *a sharp rise, to surge, to soar, to skyrocket*.
* **Baisse brutale :** *a steep decline, to plummet, to plunge, to dwindle*.
* **Double enjeu / Revers de la médaille :** *a double-edged sword, a trade-off between efficiency and resilience*.

</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "ang-03-fc-01",
        category: "Définition",
        question: "Comment traduit-on en anglais : 1) le réseau électrique, 2) une pénurie de semi-conducteurs, 3) la relocalisation industrielle, 4) un compromis technique ?",
        answer: "1) The power grid (or electricity grid).\n2) A semiconductor shortage.\n3) Industrial reshoring.\n4) A technical trade-off.",
      }),
      makeBuiltinFlashcard({
        id: "ang-03-fc-02",
        category: "Définition",
        question: "Citer trois verbes anglais précis pour traduire « monter en flèche » et deux verbes pour « chuter brutalement » lors d'un commentaire de graphique.",
        answer: "- Monter en flèche : to skyrocket, to surge, to soar.\n- Chuter brutalement : to plummet, to plunge.",
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
          "'Baseload power' (production de base ou ruban) désigne la puissance électrique minimale continue que le réseau doit fournir en permanence, souvent assurée par le nucléaire ou l'hydraulique pour compenser l'intermittence des énergies renouvelables.",
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

// Cache mémoire en mémoire vive pour éviter les lectures disque fs répétitives
const MDX_MEMORY_CACHE = new Map<
  string,
  { frontmatter: Record<string, unknown>; content: string }
>();

export function getMdxContent(
  subjectId: string,
  chapterId: string,
  type: "course" | "summary"
): { frontmatter: Record<string, unknown>; content: string } | null {
  // 1. Vérification dans le cache mémoire
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

  // 3. Fallback sur le contenu intégré
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

  // 2. Fallback sur les chapitres intégrés si pas de fichier sur le disque
  if (baseQuestions.length === 0) {
    const builtin = getBuiltinBundle(subjectId, chapterId);
    if (builtin) {
      baseQuestions = builtin.qcm.map((item, idx) =>
        normalizeQcmQuestion(item, idx)
      );
    }
  }

  // 3. Injection systématique de 3 séries de QCM calculatoires à nombres aléatoires pour CE chapitre
  const chapterNum = chapterId.slice(0, 2);
  const dynamicQuestions = generateDynamicQcmBank(3)
    .filter(
      (d) =>
        d.subjectId === subjectId && d.chapterId.slice(0, 2) === chapterNum
    )
    .map((d, idx) => normalizeQcmQuestion(d.question, baseQuestions.length + idx));

  // 4. Fusion + Mélange aléatoire de l'ordre des questions !
  return shuffleArray([...baseQuestions, ...dynamicQuestions]);
}