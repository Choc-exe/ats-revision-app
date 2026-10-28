"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Eye,
  EyeOff,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Filter,
  RotateCcw,
  Award,
  ChevronRight,
} from "lucide-react";
import "katex/dist/katex.min.css";
import katex from "katex";

function SafeMath({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
            return (
              <div
                key={idx}
                className="my-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <div key={idx}>{math}</div>;
          }
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
            return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch {
            return <span key={idx}>{math}</span>;
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

interface KholleSubQuestion {
  number: string;
  points: number;
  prompt: string;
  hint: string;
  solution: string;
}

interface KholleBoard {
  id: string;
  subjectId: string;
  subjectTitle: string;
  chapterHref: string;
  title: string;
  difficulty: "Khôlle Standard" | "Écrit Concours ATS" | "Oral Centrale / ENSAM";
  courseQuestion: {
    points: number;
    prompt: string;
    solution: string;
  };
  problemContext: string;
  subQuestions: KholleSubQuestion[];
}

const KHOLLE_BOARDS: KholleBoard[] = [
  {
    id: "kholle-math-fourier-parseval",
    subjectId: "mathematiques",
    subjectTitle: "Mathématiques",
    chapterHref: "/mathematiques/10-series-numeriques-fourier/cours",
    title: "Planche 01 — Séries de Fourier, Dirichlet et Calcul de ∑ 1/n² et ∑ 1/n⁴",
    difficulty: "Écrit Concours ATS",
    courseQuestion: {
      points: 6,
      prompt:
        "Énoncer précisément le théorème de Dirichlet et la formule de Parseval pour une fonction $f : \\mathbb{R} \\to \\mathbb{R}$ qui est $2\\pi$-périodique et de classe $\\mathcal{C}^1$ par morceaux. Préciser la simplification des coefficients $a_n$ et $b_n$ lorsque $f$ est paire.",
      solution:
        "Si $f$ est $2\\pi$-périodique et paire, alors $\\forall n \\ge 1, \\; b_n = 0$, $a_0 = \\frac{1}{\\pi}\\int_0^\\pi f(t)\\,\\mathrm{d}t$ et $a_n = \\frac{2}{\\pi}\\int_0^\\pi f(t)\\cos(nt)\\,\\mathrm{d}t$. $$\\text{Dirichlet : } a_0 + \\sum_{n=1}^{+\\infty} a_n\\cos(nt) = \\frac{f(t^+) + f(t^-)}{2}$$ $$\\text{Parseval : } \\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} |f(t)|^2\\,\\mathrm{d}t = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty} a_n^2$$",
    },
    problemContext:
      "Soit $f : \\mathbb{R} \\to \\mathbb{R}$ la fonction $2\\pi$-périodique définie par $f(t) = t^2$ pour tout $t \\in [-\\pi, \\pi]$.",
    subQuestions: [
      {
        number: "1.a",
        points: 3,
        prompt:
          "Étudier la parité et la continuité de $f$ sur $\\mathbb{R}$, puis calculer la valeur moyenne $a_0$ de $f$.",
        hint: "Vérifiez que $f(-\\pi) = f(\\pi)$ pour justifier la continuité aux points de raccordement $(2k+1)\\pi$.",
        solution:
          "$f$ est paire sur $[-\\pi, \\pi]$ et $f(-\\pi) = (-\\pi)^2 = \\pi^2 = f(\\pi)$, donc $f$ est continue sur $\\mathbb{R}$ tout entier. Par parité, $b_n = 0$ pour tout $n \\ge 1$, et : $$a_0 = \\frac{1}{\\pi}\\int_0^\\pi t^2\\,\\mathrm{d}t = \\frac{1}{\\pi}\\left[\\frac{t^3}{3}\\right]_0^\\pi = \\frac{\\pi^2}{3}$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "À l'aide d'une double intégration par parties, démontrer que pour tout $n \\ge 1$, $a_n = \\frac{4(-1)^n}{n^2}$.",
        hint: "Posez $u(t) = t^2$ et $v'(t) = \\cos(nt)$, et n'oubliez pas que $\\sin(n\\pi) = 0$ et $\\cos(n\\pi) = (-1)^n$.",
        solution:
          "Par parité : $a_n = \\frac{2}{\\pi}\\int_0^\\pi t^2\\cos(nt)\\,\\mathrm{d}t$. Première IPP : $$a_n = \\frac{2}{\\pi}\\left(\\left[t^2\\frac{\\sin(nt)}{n}\\right]_0^\\pi - \\int_0^\\pi 2t\\frac{\\sin(nt)}{n}\\,\\mathrm{d}t\\right) = -\\frac{4}{n\\pi}\\int_0^\\pi t\\sin(nt)\\,\\mathrm{d}t$$ Seconde IPP : $$a_n = -\\frac{4}{n\\pi}\\left(\\left[-t\\frac{\\cos(nt)}{n}\\right]_0^\\pi + \\int_0^\\pi \\frac{\\cos(nt)}{n}\\,\\mathrm{d}t\\right) = \\frac{4(-1)^n}{n^2}$$",
      },
      {
        number: "2.a",
        points: 3,
        prompt:
          "En appliquant le théorème de Dirichlet en un point judicieusement choisi, déterminer les sommes $\\sum_{n=1}^{+\\infty} \\frac{1}{n^2}$ et $\\sum_{n=1}^{+\\infty} \\frac{(-1)^{n-1}}{n^2}$.",
        hint: "Évaluez la série de Fourier en $t = \\pi$ (où $\\cos(n\\pi) = (-1)^n$) puis en $t = 0$.",
        solution:
          "$f$ est continue et $\\mathcal{C}^1$ par morceaux sur $\\mathbb{R}$, donc d'après le théorème de Dirichlet, pour tout $t \\in \\mathbb{R}$ : $$f(t) = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{+\\infty} \\frac{(-1)^n}{n^2}\\cos(nt)$$ En $t = \\pi$, $f(\\pi) = \\pi^2$ et $(-1)^n\\cos(n\\pi) = 1$ : $$\\pi^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{+\\infty}\\frac{1}{n^2} \\implies \\sum_{n=1}^{+\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}$$ En $t = 0$, $f(0) = 0 \\implies \\sum_{n=1}^{+\\infty} \\frac{(-1)^{n-1}}{n^2} = \\frac{\\pi^2}{12}$.",
      },
      {
        number: "2.b",
        points: 3,
        prompt:
          "En appliquant la formule de Parseval à la fonction $f$, calculer la somme exacte $S_4 = \\sum_{n=1}^{+\\infty} \\frac{1}{n^4}$.",
        hint: "Calculez d'abord la valeur moyenne de $|f(t)|^2 = t^4$ sur $[-\\pi, \\pi]$.",
        solution:
          "D'une part, $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} t^4\\,\\mathrm{d}t = \\frac{\\pi^4}{5}$. D'autre part, par Parseval : $$\\frac{\\pi^4}{5} = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty} a_n^2 = \\frac{\\pi^4}{9} + 8\\sum_{n=1}^{+\\infty}\\frac{1}{n^4} \\implies \\sum_{n=1}^{+\\infty}\\frac{1}{n^4} = \\frac{\\pi^4}{90}$$",
      },
    ],
  },
  {
    id: "kholle-math-diagonalisation-systeme",
    subjectId: "mathematiques",
    subjectTitle: "Mathématiques",
    chapterHref: "/mathematiques/06-reduction-endomorphismes/cours",
    title: "Planche 02 — Diagonalisation d'une matrice 3×3, Puissances Aⁿ et Système différentiel",
    difficulty: "Oral Centrale / ENSAM",
    courseQuestion: {
      points: 6,
      prompt:
        "Donner la définition d'une valeur propre et d'un vecteur propre d'une matrice $A \\in \\mathcal{M}_n(\\mathbb{R})$. Énoncer la condition nécessaire et suffisante de diagonalisabilité portant sur les dimensions des sous-espaces propres $E_\\lambda = \\ker(A - \\lambda I_n)$, ainsi que le théorème spectral pour les matrices symétriques réelles.",
      solution:
        "$\\lambda$ est valeur propre de $A$ s'il existe $X \\neq 0$ tel que $AX = \\lambda X$, soit $\\det(A - \\lambda I_n) = 0$. $A$ est diagonalisable sur $\\mathbb{R}$ si et seulement si son polynôme caractéristique est scindé sur $\\mathbb{R}$ et pour chaque valeur propre $\\lambda_i$ de multiplicité algébrique $m_i$, $\\dim E_{\\lambda_i} = n - \\text{rg}(A - \\lambda_i I_n) = m_i$. Théorème spectral : toute matrice symétrique réelle ($A^T = A$) est diagonalisable dans une base orthonormée de vecteurs propres ($A = P D P^T$ avec $P^{-1} = P^T$).",
    },
    problemContext:
      "On considère la matrice réelle symétrique $A = \\begin{pmatrix} 1 & 1 & 1 \\\\ 1 & 1 & 1 \\\\ 1 & 1 & 1 \\end{pmatrix} \\in \\mathcal{M}_3(\\mathbb{R})$ et la matrice $M = A + 2 I_3$.",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "Sans calculer de déterminant, déterminer le rang de $A$, en déduire que $0$ est valeur propre de $A$ en précisant la dimension de $E_0(A)$, puis trouver la dernière valeur propre à l'aide de la trace de $A$.",
        hint: "Les trois colonnes de $A$ sont identiques donc $\\text{rg}(A) = 1$. Utilisez le théorème du rang puis $\\text{Tr}(A) = \\lambda_1 + \\lambda_2 + \\lambda_3$.",
        solution:
          "Les 3 colonnes de $A$ sont égales à $(1,1,1)^T$, donc $\\text{rg}(A) = 1$. D'après le théorème du rang, $\\dim(\\ker A) = 3 - \\text{rg}(A) = 2$ : ainsi $\\lambda = 0$ est valeur propre de $A$ d'ordre au moins 2 ($\\dim E_0(A) = 2$). Comme $A$ est symétrique réelle, elle est diagonalisable et $\\text{Tr}(A) = 1 + 1 + 1 = 3 = 0 + 0 + \\lambda_3 \\implies \\lambda_3 = 3$ (de vecteur propre $V_3 = (1, 1, 1)^T$).",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "En déduire les valeurs propres de $M = A + 2 I_3$, exprimer $A^k$ pour tout $k \\ge 1$, puis calculer explicitement $M^n$ pour tout $n \\in \\mathbb{N}$ à l'aide de la formule du binôme de Newton.",
        hint: "Vérifiez que $A^2 = 3A$, d'où $A^k = 3^{k-1}A$ pour $k \\ge 1$. Comme $A$ et $2I_3$ commutent, appliquez le binôme de Newton.",
        solution:
          "Les valeurs propres de $M = A + 2I_3$ sont $0+2 = 2$ (double) et $3+2 = 5$ (simple). Par calcul direct, $A^2 = 3A$, donc par récurrence $\\forall k \\ge 1, \\; A^k = 3^{k-1}A$. Comme $A$ et $2I_3$ commutent : $$M^n = (2I_3 + A)^n = 2^n I_3 + \\sum_{k=1}^n \\binom{n}{k} 2^{n-k} 3^{k-1} A = 2^n I_3 + \\frac{1}{3}\\left((2+3)^n - 2^n\\right)A = 2^n I_3 + \\frac{5^n - 2^n}{3}A$$",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Résoudre le système différentiel couplé $X'(t) = M\\,X(t)$ où $X(t) = (x(t), y(t), z(t))^T$ avec la condition initiale $X(0) = (1, 0, -1)^T$.",
        hint: "Remarquez que le vecteur initial $X(0) = (1, 0, -1)^T$ vérifie $x(0) + y(0) + z(0) = 0$, donc $X(0) \\in E_0(A) = E_2(M)$ !",
        solution:
          "On observe que $A\\,X(0) = (0, 0, 0)^T$, donc $M\\,X(0) = 2\\,X(0)$ : le vecteur initial $X(0)$ est un vecteur propre de $M$ associé à la valeur propre $\\lambda = 2$. La solution unique du problème de Cauchy est donc immédiatement : $$X(t) = \\mathrm{e}^{2t}\\,X(0) = \\begin{pmatrix} \\mathrm{e}^{2t} \\\\ 0 \\\\ -\\mathrm{e}^{2t} \\end{pmatrix}$$",
      },
    ],
  },
  {
    id: "kholle-phys-induction-rail-laplace",
    subjectId: "physique-chimie",
    subjectTitle: "Physique-Chimie",
    chapterHref: "/physique-chimie/06-induction-electromagnetique/cours",
    title: "Planche 03 — Rail de Laplace générateur, Loi de Faraday et Bilan énergétique",
    difficulty: "Oral Centrale / ENSAM",
    courseQuestion: {
      points: 6,
      prompt:
        "Énoncer la loi de Faraday donnant la force électromotrice induite $e$ dans un circuit fermé, la loi de modération de Lenz, ainsi que l'expression de la résultante des forces de Laplace $\\vec{F}_L$ sur une tige rectiligne de longueur $L$ parcourue par un courant $i$ dans un champ $\\vec{B}$ uniforme.",
      solution:
        "Loi de Faraday : $e = -\\frac{\\mathrm{d}\\Phi}{\\mathrm{d}t}$ où $\\Phi = \\iint \\vec{B}\\cdot\\mathrm{d}\\vec{S}$ est le flux magnétique à travers le circuit orienté. Loi de Lenz : le sens du courant induit est tel que par ses effets électromagnétiques, il s'oppose à la cause qui lui donne naissance. Force de Laplace : $$\\vec{F}_L = i\\,\\vec{L} \\wedge \\vec{B}$$",
    },
    problemContext:
      "Une barre conductrice $MN$ de masse $m$, de longueur $a$ et de résistance électrique $R$ glisse sans frottement selon l'axe horizontal $(Ox)$ sur deux rails parallèles parfaitement conducteurs reliés entre eux à l'origine par un fil de résistance négligeable. L'ensemble est plongé dans un champ magnétique uniforme et stationnaire $\\vec{B} = B_0\\,\\vec{u}_z$ vertical ascendant. À $t = 0$, la barre est lancée avec une vitesse initiale $\\vec{v}(0) = v_0\\,\\vec{u}_x$.",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "En orientant le circuit dans le sens trigonométrique autour de $\\vec{u}_z$, exprimer le flux $\\Phi(t)$, la f.é.m. induite $e(t)$ et l'intensité $i(t)$ en fonction de la vitesse $v(t) = \\dot{x}(t)$.",
        hint: "La surface balayée par le circuit rectangulaire de largeur $a$ et d'abscisse $x(t)$ vaut $S(t) = a\\cdot x(t)$.",
        solution:
          "Le flux coupé vaut $\\Phi(t) = B_0\\,a\\,x(t)$. Par la loi de Faraday : $$e(t) = -\\frac{\\mathrm{d}\\Phi}{\\mathrm{d}t} = -B_0\\,a\\,v(t) \\quad \\text{et} \\quad i(t) = \\frac{e(t)}{R} = -\\frac{B_0\\,a}{R}\\,v(t)$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "Calculer la force de Laplace $\\vec{F}_L$ exercée sur la barre, établir l'équation différentielle vérifiée par $v(t)$ et déterminer la constante de temps mécanique $\\tau$.",
        hint: "Appliquez le Principe Fondamental de la Dynamique (PFD) projeté sur $\\vec{u}_x$.",
        solution:
          "$\\vec{F}_L = i(t)(a\\,\\vec{u}_y)\\wedge (B_0\\,\\vec{u}_z) = -\\frac{B_0^2 a^2}{R}v(t)\\,\\vec{u}_x$. Par le PFD selon $(Ox)$ : $$m\\frac{\\mathrm{d}v}{\\mathrm{d}t} + \\frac{B_0^2 a^2}{R}v = 0 \\iff \\frac{\\mathrm{d}v}{\\mathrm{d}t} + \\frac{v}{\\tau} = 0 \\quad \\text{avec} \\quad \\tau = \\frac{m\\,R}{B_0^2\\,a^2}$$ D'où $v(t) = v_0\\,\\mathrm{e}^{-t/\\tau}$.",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Effectuer un bilan énergétique complet entre $t = 0$ et $t \\to +\\infty$ en calculant l'énergie dissipée par effet Joule dans la résistance $R$.",
        hint: "Intégrez la puissance Joule $P_J(t) = R\\,i(t)^2$ de $0$ à $+\\infty$.",
        solution:
          "$$E_J = \\int_0^{+\\infty} R\\,i(t)^2\\,\\mathrm{d}t = \\frac{m\\,v_0^2}{\\tau}\\int_0^{+\\infty}\\mathrm{e}^{-2t/\\tau}\\,\\mathrm{d}t = \\frac{1}{2}m\\,v_0^2 = E_{c,\\text{initiale}}$$",
      },
    ],
  },
  {
    id: "kholle-phys-thermo-cycle-diesel",
    subjectId: "physique-chimie",
    subjectTitle: "Physique-Chimie",
    chapterHref: "/physique-chimie/02-thermodynamique/cours",
    title: "Planche 04 — Machine thermique, Premier et Second Principes, Cycle de Carnot & Rendement",
    difficulty: "Écrit Concours ATS",
    courseQuestion: {
      points: 6,
      prompt:
        "Énoncer le Premier Principe et le Second Principe de la thermodynamique pour un système fermé décrivant un cycle ditherme en contact avec une source chaude à $T_C$ et une source froide à $T_F$. Démontrer le théorème de Carnot donnant le rendement maximal $\\eta_{\\text{Carnot}}$ d'un moteur ditherme.",
      solution:
        "Sur un cycle complet, $\\Delta U_{\\text{cycle}} = W + Q_C + Q_F = 0$ (1er principe) et $\\Delta S_{\\text{cycle}} = \\frac{Q_C}{T_C} + \\frac{Q_F}{T_F} + S_{\\text{créée}} = 0$ avec $S_{\\text{créée}} \\ge 0$ (inégalité de Clausius : $\\frac{Q_C}{T_C} + \\frac{Q_F}{T_F} \\le 0$). Pour un moteur ($W < 0$, $Q_C > 0$, $Q_F < 0$), le rendement vaut $\\eta = \\frac{-W}{Q_C} = \\frac{Q_C + Q_F}{Q_C} = 1 + \\frac{Q_F}{Q_C}$. Or $\\frac{Q_F}{T_F} \\le -\\frac{Q_C}{T_C} \\implies \\frac{Q_F}{Q_C} \\le -\\frac{T_F}{T_C}$, d'où : $$\\eta \\le \\eta_{\\text{Carnot}} = 1 - \\frac{T_F}{T_C}$$",
    },
    problemContext:
      "Une mole ($n = 1\\text{ mol}$) de gaz parfait diatomique (rapport $\\gamma = \\frac{c_P}{c_V} = 1{,}4$, capacité molaire $C_{V,m} = \\frac{R}{\\gamma - 1} = \\frac{5}{2}R$) subit un cycle moteur réversible de Beau de Rochas (Otto) composé de : (1→2) compression adiabatique réversible de $V_1$ à $V_2 = V_1 / a$ où $a = 8$ est le taux de compression volumétrique ; (2→3) échauffement isochore ($Q_{23} = Q_C > 0$) jusqu'à $T_3$ ; (3→4) détente adiabatique réversible de $V_2$ à $V_1$ ; (4→1) refroidissement isochore ($Q_{41} = Q_F < 0$).",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "À l'aide de la loi de Laplace sur les transformations adiabatiques réversibles $1\\to 2$ et $3\\to 4$, exprimer $T_2$ en fonction de $T_1$ et $a$, puis $T_3$ en fonction de $T_4$ et $a$.",
        hint: "En variables $(T, V)$, la loi de Laplace s'écrit $T\\,V^{\\gamma - 1} = \\text{cte}$.",
        solution:
          "Sur l'adiabatique réversible $1\\to 2$ : $T_1 V_1^{\\gamma-1} = T_2 V_2^{\\gamma-1} \\implies T_2 = T_1\\left(\\frac{V_1}{V_2}\\right)^{\\gamma-1} = T_1\\,a^{\\gamma-1}$. De même sur $3\\to 4$ ($V_3 = V_2$ et $V_4 = V_1$) : $$T_3 = T_4\\,a^{\\gamma - 1}$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "Exprimer les transferts thermiques $Q_C = Q_{23}$ et $Q_F = Q_{41}$ en fonction de $n, C_{V,m}$ et des températures aux sommets du cycle.",
        hint: "Sur une transformation isochore ($V = \\text{cte}$), le travail des forces de pression est nul ($W = 0$), donc $Q = \\Delta U = n\\,C_{V,m}\\,\\Delta T$.",
        solution:
          "Sur les deux transformations isochores $2\\to 3$ et $4\\to 1$, $W_{23} = W_{41} = 0$, donc par le premier principe : $$Q_C = Q_{23} = \\Delta U_{23} = n\\,C_{V,m}(T_3 - T_2) > 0 \\quad \\text{et} \\quad Q_F = Q_{41} = \\Delta U_{41} = n\\,C_{V,m}(T_1 - T_4) < 0$$",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Établir que le rendement thermodynamique du cycle vaut $\\eta = 1 - \\frac{1}{a^{\\gamma - 1}}$ et calculer sa valeur numérique pour $a = 8$ et $\\gamma = 1{,}4$.",
        hint: "Remplacez $T_2 = a^{\\gamma-1}T_1$ et $T_3 = a^{\\gamma-1}T_4$ dans $\\eta = 1 + \\frac{Q_F}{Q_C}$.",
        solution:
          "Le rendement du cycle moteur vaut : $$\\eta = \\frac{-W_{\\text{cycle}}}{Q_C} = 1 + \\frac{Q_F}{Q_C} = 1 - \\frac{T_4 - T_1}{T_3 - T_2} = 1 - \\frac{T_4 - T_1}{a^{\\gamma-1}(T_4 - T_1)} = 1 - \\frac{1}{a^{\\gamma - 1}}$$ Application numérique pour $a = 8$ et $\\gamma - 1 = 0{,}4$ : $8^{0{,}4} \\approx 2{,}297$, d'où $\\eta = 1 - \\frac{1}{2{,}297} \\approx 0{,}565 = 56{,}5\\,\\%$.",
      },
    ],
  },
  {
    id: "kholle-sii-asservissement-correcteur",
    subjectId: "sii",
    subjectTitle: "Sciences Industrielles (SII)",
    chapterHref: "/sii/01-systemes-asservis-slci/cours",
    title: "Planche 05 — Asservissement de position, Précision, Stabilité et Marge de phase",
    difficulty: "Écrit Concours ATS",
    courseQuestion: {
      points: 6,
      prompt:
        "Soit un système bouclé à retour unitaire de FTBO $T(p) = \\frac{K}{p^\\alpha(1 + \\tau_1 p)(1 + \\tau_2 p)}$ où $\\alpha \\in \\{0, 1, 2\\}$ est la classe du système. Donner le tableau de l'erreur statique $\\varepsilon_s$ (échelon $E_0/p$) et de l'erreur de traînage $\\varepsilon_v$ (rampe $V_0/p^2$) selon $\\alpha$, puis définir la marge de phase $M_\\varphi$.",
      solution:
        "Par le théorème de la valeur finale $\\varepsilon(\\infty) = \\lim_{p\\to 0} \\frac{p\\,E(p)}{1 + T(p)}$ : \n- Si $\\alpha = 0$ : $\\varepsilon_s = \\frac{E_0}{1+K}$ et $\\varepsilon_v = +\\infty$.\n- Si $\\alpha = 1$ : $\\varepsilon_s = 0$ et $\\varepsilon_v = \\frac{V_0}{K}$.\n- Si $\\alpha \\ge 2$ : $\\varepsilon_s = 0$ et $\\varepsilon_v = 0$.\nLa marge de phase à $\\omega_{0\\text{dB}}$ ($|T(\\mathrm{j}\\omega_{0\\text{dB}})| = 1$) vaut : $$M_\\varphi = 180^\\circ + \\arg\\big(T(\\mathrm{j}\\omega_{0\\text{dB}})\\big)$$",
    },
    problemContext:
      "Un axe robotisé de suivi de trajectoire possède une FTBO non corrigée $T(p) = \\frac{K}{p(1 + 0{,}1\\,p)}$ avec $K > 0$. Le cahier des charges exige : (1) une erreur de traînage pour une rampe unitaire $\\varepsilon_v \\le 0{,}05$ ; (2) une marge de phase $M_\\varphi \\ge 45^\\circ$.",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "Quelle est la valeur minimale $K_{\\min}$ du gain $K$ permettant de satisfaire l'exigence de précision en poursuite ?",
        hint: "La FTBO comporte un intégrateur ($\\alpha = 1$), donc $\\varepsilon_v = \\frac{1}{K}$.",
        solution:
          "$$\\varepsilon_v = \\frac{1}{K} \\le 0{,}05 \\iff K \\ge K_{\\min} = 20\\text{ s}^{-1}$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "En fixant $K = 20\\text{ s}^{-1}$, exprimer la FTBF $H(p) = \\frac{T(p)}{1 + T(p)}$ sous forme canonique du second ordre et déterminer $\\omega_0$ et $\\xi$.",
        hint: "Identifiez avec $\\frac{1}{1 + \\frac{2\\xi}{\\omega_0}p + \\frac{p^2}{\\omega_0^2}}$.",
        solution:
          "$$H(p) = \\frac{1}{1 + 0{,}05\\,p + 0{,}005\\,p^2} \\implies \\omega_0 = \\sqrt{200} \\approx 14{,}14\\text{ rad/s} \\quad \\text{et} \\quad \\xi = \\frac{\\sqrt{2}}{4} \\approx 0{,}354$$",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Calculer $\\omega_{0\\text{dB}}$ et la marge de phase $M_\\varphi$ pour $K = 20$. Conclure.",
        hint: "Résolvez $|T(\\mathrm{j}\\omega)|^2 = \\frac{400}{\\omega^2(1 + 0{,}01\\omega^2)} = 1$.",
        solution:
          "On obtient $\\omega_{0\\text{dB}} \\approx 12{,}5\\text{ rad/s}$ et $M_\\varphi = 90^\\circ - \\arctan(1{,}25) \\approx 38{,}7^\\circ < 45^\\circ$ : il faut ajouter un correcteur à avance de phase.",
      },
    ],
  },
  {
    id: "kholle-info-python-euler-trapezes",
    subjectId: "informatique",
    subjectTitle: "Informatique (Python)",
    chapterHref: "/informatique/02-methodes-numeriques-analyse/cours",
    title: "Planche 06 — Intégration par la Méthode des Trapèzes et Schéma d'Euler Explicite",
    difficulty: "Oral Centrale / ENSAM",
    courseQuestion: {
      points: 6,
      prompt:
        "Donner la formule géométrique d'approximation de $I = \\int_a^b f(x)\\,\\mathrm{d}x$ par la méthode des trapèzes composite sur $n$ sous-intervalles de pas $h = \\frac{b-a}{n}$, ainsi que la récurrence du schéma d'Euler explicite pour résoudre le problème de Cauchy $y'(t) = F(t, y(t))$ avec $y(t_0) = y_0$.",
      solution:
        "En notant $x_k = a + k\\,h$ pour $k \\in \\{0, \\dots, n\\}$ avec $h = \\frac{b-a}{n}$, la formule composite des trapèzes s'écrit : $$I_n = h\\left(\\frac{f(a) + f(b)}{2} + \\sum_{k=1}^{n-1} f(x_k)\\right)$$ Pour le schéma d'Euler explicite de pas $h$ : $t_{k+1} = t_k + h$ et $y_{k+1} = y_k + h\\,F(t_k, y_k)$.",
    },
    problemContext:
      "On souhaite calculer numériquement en Python une valeur approchée de $\\ln(2) = \\int_1^2 \\frac{1}{x}\\,\\mathrm{d}x$ et simuler la décharge d'un condensateur régie par $u'(t) = -\\frac{u(t)}{\\tau}$ avec $u(0) = E_0$.",
    subQuestions: [
      {
        number: "1.a",
        points: 5,
        prompt:
          "Écrire une fonction Python `trapezes(f, a, b, n)` de complexité $\\mathcal{O}(n)$ qui retourne l'approximation $I_n$ sans utiliser de bibliothèque externe.",
        hint: "Initialisez l'accumulateur avec `s = 0.5 * (f(a) + f(b))` puis parcourez `k` de `1` à `n - 1`.",
        solution:
          "`def trapezes(f, a: float, b: float, n: int) -> float:`\n`    h = (b - a) / n`\n`    s = 0.5 * (f(a) + f(b))`\n`    for k in range(1, n):`\n`        s += f(a + k * h)`\n`    return h * s`",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "En appliquant le schéma d'Euler explicite de pas $h > 0$ à l'équation $u'(t) = -\\frac{u(t)}{\\tau}$, exprimer $u_k$ en fonction de $u_0 = E_0$, $h$, $\\tau$ et $k$. À quelle condition sur le pas $h$ la suite numérique $(u_k)$ converge-t-elle vers $0$ sans osciller ?",
        hint: "Écrivez $u_{k+1} = u_k - \\frac{h}{\\tau}u_k = \\left(1 - \\frac{h}{\\tau}\\right)u_k$ et reconnaissez une suite géométrique.",
        solution:
          "La relation de récurrence donne $u_{k+1} = \\left(1 - \\frac{h}{\\tau}\\right)u_k$, soit $u_k = E_0\\left(1 - \\frac{h}{\\tau}\\right)^k$. Pour que $(u_k)$ converge vers $0$ (stabilité numérique) il faut $|1 - h/\\tau| < 1 \\iff h < 2\\tau$, et pour qu'elle décroisse de façon monotone sans changer de signe à chaque pas, il faut : $$0 < h < \\tau$$",
      },
      {
        number: "2.a",
        points: 4,
        prompt:
          "Quel est l'ordre de convergence de la méthode des trapèzes et celui de la méthode d'Euler explicite lorsque le pas $h \\to 0$ ? Conclure sur l'effet d'une division par $10$ du pas $h$.",
        hint: "Trapèzes est d'ordre 2 ($\\mathcal{O}(h^2)$) et Euler explicite est d'ordre 1 ($\\mathcal{O}(h)$).",
        solution:
          "L'erreur globale de la méthode des trapèzes est en $\\mathcal{O}(h^2)$ (diviser $h$ par $10$ divise l'erreur par $100$), tandis que l'erreur globale d'Euler explicite est en $\\mathcal{O}(h)$ (diviser $h$ par $10$ ne divise l'erreur que par $10$).",
      },
    ],
  },
  {
    id: "kholle-anglais-transition-energetique",
    subjectId: "anglais",
    subjectTitle: "Anglais ATS",
    chapterHref: "/anglais/02-methodologie-synthese-essay/cours",
    title: "Planche 07 — Khôlle Audio & Essay : Nuclear Power, Renewables and Grid Stability",
    difficulty: "Oral Centrale / ENSAM",
    courseQuestion: {
      points: 6,
      prompt:
        "Donner la structure complète et les expressions idiomatiques d'introduction d'un compte rendu oral de Khôlle d'anglais (Audio report BBC/NPR), ainsi que 4 verbes précis pour décrire une hausse brutale et une chute brutale de production énergétique.",
      solution:
        "Structure d'introduction : « This audio report, broadcast on the BBC in..., deals with the pressing issue of... At the heart of this recording lies a fundamental tension between... and... ». Verbes de hausse brutale : *to skyrocket, to surge, to soar, to體驗 a sharp rise*. Verbes de chute brutale : *to plummet, to plunge, to nose-dive, to dwindle*.",
    },
    problemContext:
      "Lors de votre oral ou de votre essai écrit, le sujet suivant vous est proposé : « To what extent can intermittent renewable energies replace baseload nuclear power in a decarbonized industrial economy? »",
    subQuestions: [
      {
        number: "1.a",
        points: 5,
        prompt:
          "Rédiger en anglais une phrase de problématique utilisant une structure en « Not only..., but also... » ou un double comparatif « The more..., the more... ».",
        hint: "N'oubliez pas l'inversion auxiliaire-sujet après « Not only » en tête de phrase.",
        solution:
          "« **Not only does** the transition to net-zero require a massive expansion of solar and wind power, **but it also** demands reliable baseload capacity to prevent grid blackouts. » — ou : « **The more** countries rely on intermittent renewables, **the more** critical grid-scale battery storage becomes. »",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "Traduire sans faute grammaticale en anglais : « Bien que les énergies renouvelables aient fait des progrès considérables depuis dix ans, les équipements de stockage restent coûteux. »",
        hint: "Attention aux indénombrables « progress » et « equipment » (toujours au singulier sans -s) et à l'emploi du Present Perfect avec « over the past decade ».",
        solution:
          "« **Although** renewable energies **have made considerable progress** over the past decade, storage **equipment remains** expensive. »",
      },
      {
        number: "2.a",
        points: 4,
        prompt:
          "Proposer en anglais une conclusion nuancée (30–40 mots) articulant le compromis technique (*trade-off*) entre nucléaire et renouvelables.",
        hint: "Utilisez des connecteurs académiques tels que « Ultimately », « far from being mutually exclusive », « complementary ».",
        solution:
          "« **Ultimately**, far from being mutually exclusive, nuclear energy and renewables are complementary pillars: while wind and solar drive rapid decarbonization, nuclear power provides the carbon-free baseload stability required by heavy industry. »",
      },
    ],
  },
];

export default function KhollePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activeBoardId, setActiveBoardId] = useState<string>(KHOLLE_BOARDS[0].id);

  const [revealedCourse, setRevealedCourse] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});

  const [timerPhase, setTimerPhase] = useState<"idle" | "prep" | "oral">("idle");
  const [secondsLeft, setSecondsLeft] = useState<number>(20 * 60);

  const filteredBoards = useMemo(() => {
    if (selectedSubject === "all") return KHOLLE_BOARDS;
    return KHOLLE_BOARDS.filter((b) => b.subjectId === selectedSubject);
  }, [selectedSubject]);

  const activeBoard = useMemo(() => {
    return (
      filteredBoards.find((b) => b.id === activeBoardId) ??
      filteredBoards[0] ??
      KHOLLE_BOARDS[0]
    );
  }, [filteredBoards, activeBoardId]);

  useEffect(() => {
    if (timerPhase === "idle") return;
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [timerPhase, secondsLeft]);

  const selectBoard = (id: string) => {
    setActiveBoardId(id);
    setRevealedCourse(false);
    setRevealedHints({});
    setRevealedSolutions({});
    setSelfScores({});
    setTimerPhase("idle");
    setSecondsLeft(20 * 60);
  };

  const startPhase = (phase: "prep" | "oral") => {
    setTimerPhase(phase);
    setSecondsLeft(20 * 60);
  };

  const totalEarnedPoints = useMemo(() => {
    return Object.values(selfScores).reduce((acc, v) => acc + v, 0);
  }, [selfScores]);

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Entraînement intensif « Objectif Major »
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Planches de Khôlle & Problèmes Écrits à Tiroirs
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Travaillez sur feuille blanche dans les conditions exactes des écrits et des oraux du Concours ATS : démonstration de cours + problème progressif avec barème sur 20.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {formatClock(secondsLeft)}
              </span>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-sky-900/60 dark:text-sky-300">
                {timerPhase === "prep"
                  ? "Préparation (20m)"
                  : timerPhase === "oral"
                  ? "Passage (20m)"
                  : "Prêt"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => startPhase("prep")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Lancer Prépa (20m)
              </button>
              <button
                type="button"
                onClick={() => startPhase("oral")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Passage Tableau (20m)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerPhase("idle");
                  setSecondsLeft(20 * 60);
                }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Réinitialiser le chronomètre"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {[
              { id: "all", label: "Toutes (${KHOLLE_BOARDS.length})".replace("${KHOLLE_BOARDS.length}", String(KHOLLE_BOARDS.length)) },
              { id: "mathematiques", label: "Mathématiques" },
              { id: "physique-chimie", label: "Physique-Chimie" },
              { id: "sii", label: "SII" },
              { id: "informatique", label: "Informatique Python" },
              { id: "anglais", label: "Anglais ATS" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubject(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedSubject === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3.5 py-1.5 rounded-xl">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Auto-évaluation :{" "}
              <strong className="font-mono">{totalEarnedPoints} / 20 pts</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBoards.map((board) => {
            const isSelected = board.id === activeBoard.id;
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => selectBoard(board.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 dark:border-sky-400 dark:bg-sky-950/40"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                    {board.subjectTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {board.difficulty}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {board.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PARTIE I : QUESTION DE COURS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
              Partie I • Question de Cours ({activeBoard.courseQuestion.points} pts)
            </span>
            <Link
              href={activeBoard.chapterHref}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Voir le chapitre associé</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Points obtenus :</span>
            {[0, 3, activeBoard.courseQuestion.points].map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() =>
                  setSelfScores((prev) => ({ ...prev, course: pt }))
                }
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold cursor-pointer ${
                  selfScores["course"] === pt
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {pt} pt{pt > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <SafeMath text={activeBoard.courseQuestion.prompt} />
        </div>

        <button
          type="button"
          onClick={() => setRevealedCourse(!revealedCourse)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 cursor-pointer"
        >
          {revealedCourse ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Masquer le corrigé de cours</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Afficher la réponse attendue par l'examinateur</span>
            </>
          )}
        </button>

        {revealedCourse && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-600 bg-red-50/40 dark:bg-red-950/20 p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
            <div className="font-bold text-red-800 dark:text-red-300">
              Éléments de cours exigés au tableau :
            </div>
            <SafeMath text={activeBoard.courseQuestion.solution} />
          </div>
        )}
      </div>

      {/* PARTIE II : PROBLÈME D'APPROFONDISSEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-sky-950/70 dark:text-sky-300">
            Partie II • Problème d'Approfondissement (14 pts)
          </span>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed pt-2">
            <SafeMath text={activeBoard.problemContext} />
          </div>
        </div>

        <div className="space-y-5">
          {activeBoard.subQuestions.map((sq) => {
            const hintOpen = Boolean(revealedHints[sq.number]);
            const solOpen = Boolean(revealedSolutions[sq.number]);

            return (
              <div
                key={sq.number}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-sky-400">
                    Question {sq.number} ({sq.points} pts)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Barème :</span>
                    {[0, Math.floor(sq.points / 2), sq.points].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() =>
                          setSelfScores((prev) => ({
                            ...prev,
                            [sq.number]: pt,
                          }))
                        }
                        className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold cursor-pointer ${
                          selfScores[sq.number] === pt
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {pt} pt{pt > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                  <SafeMath text={sq.prompt} />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedHints((prev) => ({
                        ...prev,
                        [sq.number]: !prev[sq.number],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{hintOpen ? "Masquer l'indice" : "Coup de pouce (Indice)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRevealedSolutions((prev) => ({
                        ...prev,
                        [sq.number]: !prev[sq.number],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {solOpen ? "Masquer la démonstration" : "Voir le corrigé rédigé"}
                    </span>
                  </button>
                </div>

                {hintOpen && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200">
                    <strong>Indice méthodologique : </strong>
                    <SafeMath text={sq.hint} />
                  </div>
                )}

                {solOpen && (
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-sky-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5">
                    <div className="font-bold text-blue-700 dark:text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Rédaction type attendue au concours :
                    </div>
                    <SafeMath text={sq.solution} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}