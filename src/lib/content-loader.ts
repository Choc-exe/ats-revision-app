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

interface BuiltinChapterBundle {
  course: string;
  summary: string;
  flashcards: FlashcardItem[];
  qcm: QcmQuestion[];
}

/**
 * Normalise n'importe quelle flashcard (issue d'un JSON ou du fallback)
 * pour garantir que card.back est TOUJOURS un objet { mainAnswer, criticalFormula, commonTrap }
 */
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
 * Normalise n'importe quelle question de QCM (issue d'un JSON ou du fallback)
 * pour garantir que questionText, options[], correctOptionId et explanation.steps[] existent toujours
 */
function normalizeQcmQuestion(raw: any, index: number): QcmQuestion {
  const letters = ["a", "b", "c", "d"] as const;
  const rawOptions = Array.isArray(raw?.options)
    ? raw.options
    : Array.isArray(raw?.choices)
    ? raw.choices
    : [];

  const correctIndex: number =
    typeof raw?.correctIndex === "number"
      ? raw.correctIndex
      : typeof raw?.correctOptionId === "string"
      ? Math.max(0, letters.indexOf(raw.correctOptionId.toLowerCase() as any))
      : 0;

  const options = rawOptions.map((opt: any, idx: number) => {
    const id = opt?.id ?? letters[idx] ?? String(idx);
    const text =
      typeof opt === "string"
        ? opt
        : opt?.text ?? opt?.label ?? opt?.latex ?? "";
    return {
      id,
      label: opt?.label ?? id.toUpperCase(),
      text,
      latex: opt?.latex ?? undefined,
      isCorrect:
        typeof opt?.isCorrect === "boolean"
          ? opt.isCorrect
          : idx === correctIndex,
    };
  });

  const correctOptionId =
    raw?.correctOptionId ??
    options.find((o: any) => o.isCorrect)?.id ??
    options[correctIndex]?.id ??
    "a";

  const explanationObj =
    raw?.explanation && typeof raw.explanation === "object"
      ? {
          steps: Array.isArray(raw.explanation.steps)
            ? raw.explanation.steps
            : [String(raw.explanation.main ?? "Voir formule clé ci-dessous.")],
          keyFormula: raw.explanation.keyFormula ?? "",
          commonTrap: raw.explanation.commonTrap ?? undefined,
        }
      : {
          steps:
            typeof raw?.explanation === "string"
              ? [raw.explanation]
              : ["Appliquer la formule du cours."],
          keyFormula: raw?.keyFormula ?? "",
          commonTrap: raw?.commonTrap ?? undefined,
        };

  const qText =
    raw?.questionText ?? raw?.question ?? raw?.prompt ?? `Question ${index + 1}`;

  return {
    id: raw?.id ?? `qcm-${index + 1}`,
    difficulty: raw?.difficulty ?? "Concours ATS",
    questionText: qText,
    question: qText,
    options,
    correctOptionId,
    correctIndex,
    explanation: explanationObj,
  } as unknown as QcmQuestion;
}

/**
 * Constructeurs typés pour nos chapitres intégrés
 */
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
// CONTENU INTÉGRÉ POUR LES 10 NOUVEAUX CHAPITRES
// ============================================================================
const BUILTIN_CHAPTERS: Record<string, BuiltinChapterBundle> = {
  "physique-chimie/08": {
    course: `
## 1. Structure de la matière, Noyau et Isotopes (Annexe V)

Un noyau atomique est représenté par le symbole $^A_Z\\text{X}$, où **$Z$** est le **numéro atomique** (nombre de protons) et **$A = Z + N$** est le **nombre de masse** (nombre total de nucléons : protons + neutrons). Deux **isotopes** possèdent le même numéro atomique $Z$ (même élément chimique) mais un nombre de neutrons $N$ différent.

<CriticalFormula title="À connaître absolument — Quantité de matière et Défaut de masse nucléaire">
La quantité de matière $n$ (en $\\text{mol}$, avec $N_A = 6{,}022 \\times 10^{23}\\text{ mol}^{-1}$) se calcule selon l'état physique par :

$$n = \\frac{m}{M} = \\frac{\\rho \\cdot V}{M} = \\frac{N_{\\text{entités}}}{N_A} = C \\cdot V_{\\text{sol}} = \\frac{P \\cdot V_{\\text{gaz}}}{R \\cdot T}$$

Lors d'une réaction nucléaire (fission ou fusion, vérifiant les lois de conservation de Soddy $\\sum A = \\text{cte}$ et $\\sum Z = \\text{cte}$), l'énergie libérée par la perte de masse $\\Delta m = \\sum m_{\\text{initial}} - \\sum m_{\\text{final}} > 0$ vaut :

$$E_{\\text{libérée}} = \\Delta m \\cdot c^2 \\quad \\text{avec} \\quad c \\approx 3{,}00 \\times 10^8\\text{ m}\\cdot\\text{s}^{-1}$$
</CriticalFormula>

## 2. Transformations chimiques, Avancement et Combustions

Pour une réaction $\\nu_A\\,\\text{A} + \\nu_B\\,\\text{B} \\rightarrow \\nu_C\\,\\text{C} + \\nu_D\\,\\text{D}$, l'**avancement maximal** est $x_{\\max} = \\min\\left(\\frac{n_{A,0}}{\\nu_A}, \\frac{n_{B,0}}{\\nu_B}\\right)$, ce qui identifie le **réactif limitant**.

<CriticalFormula title="À connaître absolument — Combustion complète, Masse de CO₂ et PCI">
$$\\text{C}_x\\text{H}_y\\text{O}_z + \\left(x + \\frac{y}{4} - \\frac{z}{2}\right)\\text{O}_2 \\longrightarrow x\\,\\text{CO}_2 + \\frac{y}{2}\\,\\text{H}_2\\text{O}$$

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
* **Écart normalisé (compatibilité avec une référence $g_{\\text{réf}}$) :**

$$z = \\frac{|g_{\\text{exp}} - g_{\\text{réf}}|}{\\sqrt{u(g_{\\text{exp}})^2 + u(g_{\\text{réf}})^2}} \\le 2 \\quad (\\text{mesure compatible si } z \\le 2)$$
</CriticalFormula>

## 2. Régression linéaire et Analyse des résidus

Une loi affine $Y = a X + b$ est validée si la droite traverse les barres d'incertitude et si les **résidus** $e_i = Y_i - (a X_i + b)$ sont répartis **aléatoirement autour de $0$** (sans forme en « U » ou en « S »).
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
* **Théorème des bornes atteintes :** Toute fonction continue sur un segment fermé borné $[a, b]$ est bornée et atteint son minimum et son maximum.
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
**Formulaire des $\\text{DL}_3(0)$ :**

$$\\begin{aligned}
\\mathrm{e}^x &= 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + o(x^3) \\quad &;\\quad \\ln(1+x) &= x - \\frac{x^2}{2} + \\frac{x^3}{3} + o(x^3) \\\\[4pt]
\\sin x &= x - \\frac{x^3}{6} + o(x^4) \\quad &;\\quad \\cos x &= 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^5) \\\\[4pt]
(1+x)^\\alpha &= 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2}x^2 + o(x^2) \\quad &;\\quad \\arctan x &= x - \\frac{x^3}{3} + o(x^4)
\\end{aligned}$$
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
Pour $f$ $T$-périodique de pulsation $\\omega = \\frac{2\\pi}{T}$ :

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

En un **point critique** $(x_0, y_0)$ vérifiant $\\nabla f(x_0, y_0) = \\vec{0}$, avec $r = \\frac{\\partial^2 f}{\\partial x^2}$, $s = \\frac{\\partial^2 f}{\\partial x \\partial y}$, $t = \\frac{\\partial^2 f}{\\partial y^2}$ :
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
        keyFormula: "\\Delta = r\\,t - s^2 > 0 \\text{ et } r > 0 \\implies \\text{Minimum local}",
      }),
    ],
  },

  "sii/05": {
    course: `
## 1. Ingénierie Système (SysML), Chaîne d'acquisition et Conception (Annexe VI)

L'analyse fonctionnelle et structurelle d'un système industriel s'appuie sur les diagrammes **SysML** :
* **Diagramme des exigences (req)** : extrait les critères, niveaux et flexibilités du cahier des charges.
* **Chaîne d'énergie** : Alimenter $\\to$ Distribuer (préactionneur : hacheur, onduleur, distributeur) $\\to$ Convertir (actionneur : moteur, vérin) $\\to$ Transmettre (réducteur, vis-écrou).
* **Chaîne d'information** : Acquérir (capteurs, codeur incrémental) $\\to$ Traiter (microcontrôleur, CAN) $\\to$ Communiquer (bus, IHM).

<CriticalFormula title="À connaître absolument — Résolution d'un CAN et Codeur incrémental">
* **Convertisseur Analogique-Numérique (CAN) sur $N$ bits** de pleine échelle $U_{\\text{PE}}$ : le quantum (plus petite variation de tension détectable) vaut :

$$q = \\frac{U_{\\text{PE}}}{2^N} \\quad \\text{(ou } \\frac{U_{\\text{PE}}}{2^N - 1}\\text{)}$$

* **Codeur optique incrémental** à $P$ points (fentes) par tour avec exploitation en quadrature des voies A et B ($4$ fronts par fente) : la résolution angulaire vaut $\\Delta \\theta = \\frac{2\\pi}{4 P}\\text{ rad} = \\frac{360^\\circ}{4 P}$.
</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Chaîne d'acquisition et Montage de roulements">
$$q_{\\text{CAN}} = \\frac{U_{\\text{PE}}}{2^N} \\quad ; \\quad \\text{Fréquence de Shannon : } f_e > 2\\,f_{\\max}$$

$$\\text{Roulements à contact radial : bague TOURNANTE par rapport à la charge montée SERRÉE ; bague FIXE montée GLISSANTE.}$$
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
        keyFormula: "\\text{Bague tournante / charge} \\implies \\text{Montage serré}",
      }),
    ],
  },

  "francais-philosophie/01": {
    course: `
## 1. Méthodologie de la Contraction (Résumé de texte) au Concours ATS

L'épreuve écrite de Français-Philosophie au concours ATS associe un **résumé de texte** (sous contrainte stricte de nombre de mots, généralement $100$ mots $\\pm 10\\,\\%$) et une **dissertation** sur le thème annuel.

<CriticalFormula title="À connaître absolument — Les 4 Règles d'Or du Résumé de Texte ATS">
1. **Marge de tolérance de $\\pm 10\\,\\%$ impérative :** Pour une consigne à $100$ mots, le résumé doit compter entre **$90$ et $110$ mots** (et le nombre exact de mots doit être indiqué à la fin de la copie).
2. **Respect du système d'énonciation :** Vous rédigez **à la place de l'auteur** (conservez le *« je »* ou le *« nous »*). Les formules extérieures comme *« L'auteur explique que... »* sont éliminatoires.
3. **Reformulation personnelle intégrale :** Aucun collage ni citation du texte source ; les exemples purement illustratifs sont supprimés au profit de l'idée directrice qu'ils servent.
4. **Fidélité à l'ordre et à la logique :** Respectez l'enchaînement des thèses du texte grâce à des connecteurs logiques précis (*or, toutefois, dès lors, en effet*).
</CriticalFormula>

## 2. Méthodologie de la Dissertation

* **Introduction (en un seul bloc) :** Amorcer le sujet $\\to$ Définir les termes et dégager le **paradoxe** $\\to$ Formuler la **problématique** $\\to$ Annoncer le plan en 3 parties.
* **Développement (3 parties de 2 ou 3 sous-parties) :** Chaque paragraphe argumentatif articule une **idée directrice**, son **analyse conceptuelle** et une **confrontation précise des œuvres au programme**.
`,
    summary: `
<CriticalFormula title="Synthèse — Décompte officiel des mots et Plan de Dissertation">
$$\\text{Fourchette à } 100 \\text{ mots : } [90\\,;\\,110] \\text{ mots} \\quad (\\text{ex. « c'est-à-dire »} = 4 \\text{ mots})$$

$$\\text{Sous-partie de dissertation : Thèse} \\longrightarrow \\text{Explication conceptuelle} \\longrightarrow \\text{Exemple analysé d'une œuvre} \\longrightarrow \\text{Bilan}$$
</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-01-fc-01",
        category: "Méthode",
        question: "Quelles sont les quatre règles formelles impératives du résumé de texte au concours ATS ?",
        answer: "1. Respecter la fourchette de ± 10 % du nombre de mots. 2. Adopter l'énonciation de l'auteur (interdiction d'écrire « L'auteur dit que... »). 3. Reformuler sans citer le texte. 4. Suivre l'ordre du texte.",
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
        keyFormula: "\\text{Énonciation du résumé} = \\text{Énonciation directe de l'auteur}",
      }),
    ],
  },

  "francais-philosophie/02": {
    course: `
## 1. Exploitation comparée des Œuvres au Programme Officiel ATS

En dissertation de Français-Philosophie, les œuvres au programme ne doivent jamais être résumées séparément : elles servent de **laboratoire d'analyse** pour tester et approfondir vos hypothèses de lecture.

<CriticalFormula title="À connaître absolument — Méthode de confrontation des œuvres en une sous-partie">
1. **Thèse directrice :** Énoncez l'idée maîtresse du paragraphe dès la première phrase.
2. **Première œuvre (Mise en situation) :** Mobilisez un passage précis ou un personnage de la première œuvre en analysant ses procédés (métaphore, ironie, dilemme tragique).
3. **Pivot comparatif :** Utilisez un connecteur de rapprochement ou de nuance (*« Cette tension trouve un écho philosophique chez... », « À l'inverse, l'analyse de... déplace le problème vers... »*).
4. **Seconde œuvre (Conceptualisation) :** Montrez comment la seconde œuvre éclaire, confirme ou dépasse la première.
</CriticalFormula>
`,
    summary: `
<CriticalFormula title="Synthèse — Règles de citation et de ponctuation des titres">
$$\\text{Titres d'œuvres : toujours soulignés sur copie manuscrite (en italique à l'écran).}$$

$$\\text{Citation courte : intégrée dans votre phrase entre guillemets et immédiatement analysée.}$$
</CriticalFormula>
`,
    flashcards: [
      makeBuiltinFlashcard({
        id: "fr-02-fc-01",
        category: "Méthode",
        question: "Comment éviter l'écueil de la « juxtaposition des œuvres » dans une partie de dissertation ?",
        answer: "En organisant chaque partie autour d'une idée directrice (un concept) et en faisant dialoguer deux œuvres à l'intérieur d'une même sous-partie, au lieu de consacrer un paragraphe isolé à chaque œuvre.",
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
        keyFormula: "\\text{Idée directrice} \\longrightarrow \\text{Citation courte} \\longrightarrow \\text{Analyse conceptuelle}",
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

// ============================================================================
// FONCTIONS D'ACCÈS AUX RESSOURCES (COMPATIBLES TABLEAUX ET OBJETS .cards/.questions)
// ============================================================================

export function getMdxContent(
  subjectId: string,
  chapterId: string,
  type: "course" | "summary"
): { frontmatter: Record<string, unknown>; content: string } | null {
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
        return { frontmatter: data, content };
      }
    }
  }

  const builtin = getBuiltinBundle(subjectId, chapterId);
  if (builtin) {
    return {
      frontmatter: { title: chapterId },
      content: type === "summary" ? builtin.summary : builtin.course,
    };
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
        // Supporte à la fois un tableau direct [...] ET un objet { cards: [...] } !
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
  const dir = resolveChapterDir(subjectId, chapterId);
  if (dir) {
    const filePath = path.join(dir, "qcm.json");
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        // Supporte à la fois un tableau direct [...] ET un objet { questions: [...] } !
        const rawArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.questions)
          ? parsed.questions
          : [];
        if (rawArray.length > 0) {
          return rawArray.map((item: any, idx: number) =>
            normalizeQcmQuestion(item, idx)
          );
        }
      } catch {
        // Ignore et passe au fallback
      }
    }
  }

  const builtin = getBuiltinBundle(subjectId, chapterId);
  return builtin ? builtin.qcm : [];
}