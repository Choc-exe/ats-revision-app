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
            return <div key={idx} className="my-2 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />;
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
          "$f$ est continue et $\\mathcal{C}^1$ par morceaux sur $\\mathbb{R}$, donc d'après le théorème de Dirichlet, pour tout $t \\in \\mathbb{R}$ : $$f(t) = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{+\\infty} \\frac{(-1)^n}{n^2}\\cos(nt)$$ En $t = \\pi$, $f(\\pi) = \\pi^2$ et $\\cos(n\\pi) = (-1)^n$, soit $(-1)^n\\cos(n\\pi) = (-1)^{2n} = 1$ : $$\\pi^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{+\\infty}\\frac{1}{n^2} \\implies \\sum_{n=1}^{+\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}$$ En $t = 0$, $f(0) = 0 \\implies \\sum_{n=1}^{+\\infty} \\frac{(-1)^{n-1}}{n^2} = \\frac{\\pi^2}{12}$.",
      },
      {
        number: "2.b",
        points: 3,
        prompt:
          "En appliquant la formule de Parseval à la fonction $f$, calculer la somme exacte $S_4 = \\sum_{n=1}^{+\\infty} \\frac{1}{n^4}$.",
        hint: "Calculez d'abord la valeur moyenne de $|f(t)|^2 = t^4$ sur $[-\\pi, \\pi]$.",
        solution:
          "D'une part, $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi} t^4\\,\\mathrm{d}t = \\frac{1}{\\pi}\\left[\\frac{t^5}{5}\\right]_0^\\pi = \\frac{\\pi^4}{5}$. D'autre part, par Parseval : $$\\frac{\\pi^4}{5} = a_0^2 + \\frac{1}{2}\\sum_{n=1}^{+\\infty} a_n^2 = \\frac{\\pi^4}{9} + \\frac{1}{2}\\sum_{n=1}^{+\\infty} \\frac{16}{n^4} = \\frac{\\pi^4}{9} + 8\\sum_{n=1}^{+\\infty}\\frac{1}{n^4}$$ On en déduit : $$8\\sum_{n=1}^{+\\infty}\\frac{1}{n^4} = \\pi^4\\left(\\frac{1}{5} - \\frac{1}{9}\\right) = \\frac{4\\pi^4}{45} \\implies \\sum_{n=1}^{+\\infty}\\frac{1}{n^4} = \\frac{\\pi^4}{90}$$",
      },
    ],
  },
  {
    id: "kholle-phys-induction-rail-laplace",
    subjectId: "physique-chimie",
    subjectTitle: "Physique-Chimie",
    chapterHref: "/physique-chimie/06-induction-electromagnetique/cours",
    title: "Planche 02 — Rail de Laplace générateur, Loi de Faraday et Bilan énergétique",
    difficulty: "Oral Centrale / ENSAM",
    courseQuestion: {
      points: 6,
      prompt:
        "Énoncer la loi de Faraday donnant la force électromotrice induite $e$ dans un circuit fermé, la loi de modération de Lenz, ainsi que l'expression de la résultante des forces de Laplace $\\vec{F}_L$ sur une tige rectiligne de longueur $L$ parcourue par un courant $i$ dans un champ $\\vec{B}$ uniforme.",
      solution:
        "Loi de Faraday : $e = -\\frac{\\mathrm{d}\\Phi}{\\mathrm{d}t}$ où $\\Phi = \\iint \\vec{B}\\cdot\\mathrm{d}\\vec{S}$ est le flux magnétique à travers le circuit orienté. Loi de Lenz : le sens du courant induit est tel que par ses effets électromagnétiques, il s'oppose à la cause qui lui donne naissance. Force de Laplace sur un conducteur rectiligne de vecteur longueur $\\vec{L}$ orienté dans le sens du courant $i$ : $$\\vec{F}_L = i\\,\\vec{L} \\wedge \\vec{B}$$",
    },
    problemContext:
      "Une barre conductrice $MN$ de masse $m$, de longueur $a$ et de résistance électrique $R$ glisse sans frottement selon l'axe horizontal $(Ox)$ sur deux rails parallèles parfaitement conducteurs reliés entre eux à l'origine par un fil de résistance négligeable. L'ensemble est plongé dans un champ magnétique uniforme et stationnaire $\\vec{B} = B_0\\,\\vec{u}_z$ vertical ascendant. À $t = 0$, la barre est lancée avec une vitesse initiale $\\vec{v}(0) = v_0\\,\\vec{u}_x$. On néglige l'auto-induction du circuit.",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "En orientant le circuit dans le sens trigonométrique autour de $\\vec{u}_z$, exprimer le flux $\\Phi(t)$, la f.é.m. induite $e(t)$ et l'intensité $i(t)$ en fonction de la vitesse $v(t) = \\dot{x}(t)$.",
        hint: "La surface balayée par le circuit rectangulaire de largeur $a$ et d'abscisse $x(t)$ vaut $S(t) = a\\cdot x(t)$.",
        solution:
          "Avec l'orientation choisie, la normale $\\vec{n} = \\vec{u}_z$ est colinéaire et de même sens que $\\vec{B}$. Le flux coupé vaut $\\Phi(t) = B_0\\,a\\,x(t)$. Par la loi de Faraday : $$e(t) = -\\frac{\\mathrm{d}\\Phi}{\\mathrm{d}t} = -B_0\\,a\\,v(t)$$ D'après le schéma électrique équivalent en convention générateur : $$i(t) = \\frac{e(t)}{R} = -\\frac{B_0\\,a}{R}\\,v(t)$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "Calculer la force de Laplace $\\vec{F}_L$ exercée sur la barre, établir l'équation différentielle vérifiée par $v(t)$ et déterminer la constante de temps mécanique $\\tau$.",
        hint: "Appliquez le Principe Fondamental de la Dynamique (PFD) projeté sur $\\vec{u}_x$. Vérifiez que la force de Laplace est bien freinante (Loi de Lenz).",
        solution:
          "Le courant circule selon $+\\vec{u}_y$ avec l'intensité algébrique $i(t)$ : $\\vec{F}_L = i(t)(a\\,\\vec{u}_y)\\wedge (B_0\\,\\vec{u}_z) = i(t)a B_0\\,\\vec{u}_x = -\\frac{B_0^2 a^2}{R}v(t)\\,\\vec{u}_x$. La force s'oppose bien au mouvement (Lenz). Par le PFD selon $(Ox)$ : $$m\\frac{\\mathrm{d}v}{\\mathrm{d}t} = -\\frac{B_0^2 a^2}{R}v \\iff \\frac{\\mathrm{d}v}{\\mathrm{d}t} + \\frac{v}{\\tau} = 0 \\quad \\text{avec} \\quad \\tau = \\frac{m\\,R}{B_0^2\\,a^2}$$ D'où $v(t) = v_0\\,\\mathrm{e}^{-t/\\tau}$.",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Effectuer un bilan énergétique complet entre $t = 0$ et $t \\to +\\infty$ en calculant l'énergie dissipée par effet Joule dans la résistance $R$.",
        hint: "Intégrez la puissance Joule $P_J(t) = R\\,i(t)^2$ de $0$ à $+\\infty$ et comparez-la à l'énergie cinétique initiale $\\frac{1}{2}m v_0^2$.",
        solution:
          "La puissance dissipée par effet Joule vaut $P_J(t) = R\\,i(t)^2 = \\frac{B_0^2 a^2}{R}v_0^2\\,\\mathrm{e}^{-2t/\\tau} = \\frac{m}{\\tau}v_0^2\\,\\mathrm{e}^{-2t/\\tau}$. En intégrant sur $[0, +\\infty[$ : $$E_J = \\int_0^{+\\infty} P_J(t)\\,\\mathrm{d}t = \\frac{m\\,v_0^2}{\\tau}\\left[-\\frac{\\tau}{2}\\mathrm{e}^{-2t/\\tau}\\right]_0^{+\\infty} = \\frac{1}{2}m\\,v_0^2 = E_{c,\\text{initiale}}$$ Toute l'énergie cinétique initiale de la barre a été convertie en énergie électrique puis dissipée par effet Joule.",
      },
    ],
  },
  {
    id: "kholle-sii-asservissement-correcteur",
    subjectId: "sii",
    subjectTitle: "Sciences Industrielles (SII)",
    chapterHref: "/sii/01-systemes-asservis-slci/cours",
    title: "Planche 03 — Asservissement de position, Précision, Stabilité et Marge de phase",
    difficulty: "Écrit Concours ATS",
    courseQuestion: {
      points: 6,
      prompt:
        "Soit un système bouclé à retour unitaire de FTBO $T(p) = \\frac{K}{p^\\alpha(1 + \\tau_1 p)(1 + \\tau_2 p)}$ où $\\alpha \\in \\{0, 1, 2\\}$ est la classe du système. Donner sans démonstration le tableau de l'erreur statique $\\varepsilon_s$ (échelon $E_0/p$) et de l'erreur de traînage $\\varepsilon_v$ (rampe $V_0/p^2$) selon la valeur de $\\alpha$, puis définir la pulsation de coupure à $0\\text{ dB}$ ($\\omega_{0\\text{dB}}$) et la marge de phase $M_\\varphi$.",
      solution:
        "Par le théorème de la valeur finale $\\varepsilon(\\infty) = \\lim_{p\\to 0} p\\,\\varepsilon(p) = \\lim_{p\\to 0} \\frac{p\\,E(p)}{1 + T(p)}$ : \n- Si $\\alpha = 0$ (classe 0) : $\\varepsilon_s = \\frac{E_0}{1+K}$ et $\\varepsilon_v = +\\infty$.\n- Si $\\alpha = 1$ (1 intégrateur en BO) : $\\varepsilon_s = 0$ (erreur statique nulle) et $\\varepsilon_v = \\frac{V_0}{K}$.\n- Si $\\alpha \\ge 2$ : $\\varepsilon_s = 0$ et $\\varepsilon_v = 0$.\nLa marge de phase est définie à la pulsation $\\omega_{0\\text{dB}}$ telle que $|T(\\mathrm{j}\\omega_{0\\text{dB}})| = 1$ ($G_{\\text{dB}}(\\omega_{0\\text{dB}}) = 0\\text{ dB}$) par : $$M_\\varphi = 180^\\circ + \\arg\\big(T(\\mathrm{j}\\omega_{0\\text{dB}})\\big)$$",
    },
    problemContext:
      "Un axe robotisé de suivi de trajectoire possède une fonction de transfert en boucle ouverte non corrigée $T(p) = \\frac{K}{p(1 + 0{,}1\\,p)}$ avec un gain réglable $K > 0$. Le cahier des charges exige : (Exigence 1) une erreur en régime permanent sur une entrée en rampe unitaire ($v_c(t) = t\\,u(t)$) inférieure ou égale à $5\\,\\%$ ; (Exigence 2) une marge de phase $M_\\varphi \\ge 45^\\circ$.",
    subQuestions: [
      {
        number: "1.a",
        points: 4,
        prompt:
          "Quelle est la valeur minimale $K_{\\min}$ du gain $K$ permettant de satisfaire l'Exigence 1 de précision en poursuite ?",
        hint: "La FTBO comporte un intégrateur ($\\alpha = 1$), donc l'erreur de traînage pour une rampe de pente $1$ vaut $\\varepsilon_v = \\frac{1}{K}$.",
        solution:
          "Comme la FTBO est de classe $\\alpha = 1$ et de gain statique $K$, l'erreur de traînage pour une rampe unitaire vaut $\\varepsilon_v = \\frac{1}{K}$. La condition $\\varepsilon_v \\le 0{,}05$ impose : $$\\frac{1}{K} \\le 0{,}05 \\iff K \\ge K_{\\min} = 20\\text{ s}^{-1}$$",
      },
      {
        number: "1.b",
        points: 5,
        prompt:
          "En fixant $K = 20\\text{ s}^{-1}$, exprimer la fonction de transfert en boucle fermée $H(p) = \\frac{T(p)}{1 + T(p)}$ sous forme canonique du second ordre et déterminer $\\omega_0$ et le facteur d'amortissement $\\xi$.",
        hint: "Mettez $H(p)$ sous la forme $\\frac{1}{1 + \\frac{2\\xi}{\\omega_0}p + \\frac{p^2}{\\omega_0^2}}$.",
        solution:
          "Avec $K = 20$ et $\\tau = 0{,}1\\text{ s}$ : $$H(p) = \\frac{\\frac{20}{p(1 + 0{,}1p)}}{1 + \\frac{20}{p(1 + 0{,}1p)}} = \\frac{1}{1 + \\frac{1}{20}p + \\frac{0{,}1}{20}p^2} = \\frac{1}{1 + 0{,}05\\,p + 0{,}005\\,p^2}$$ Par identification : $\\omega_0 = \\frac{1}{\\sqrt{0{,}005}} = \\sqrt{200} = 10\\sqrt{2} \\approx 14{,}14\\text{ rad/s}$ et $\\frac{2\\xi}{\\omega_0} = 0{,}05 \\implies \\xi = \\frac{0{,}05 \\times 10\\sqrt{2}}{2} = \\frac{\\sqrt{2}}{4} \\approx 0{,}354$.",
      },
      {
        number: "2.a",
        points: 5,
        prompt:
          "Calculer la pulsation $\\omega_{0\\text{dB}}$ et la marge de phase $M_\\varphi$ pour $K = 20$. Le cahier des charges est-il respecté sans correcteur à avance de phase ?",
        hint: "Résolvez $|T(\\mathrm{j}\\omega)|^2 = \\frac{400}{\\omega^2(1 + 0{,}01\\omega^2)} = 1$ en posant $X = \\omega^2$.",
        solution:
          "À $\\omega = \\omega_{0\\text{dB}}$, $0{,}01\\omega^4 + \\omega^2 - 400 = 0$. Le discriminant vaut $\\Delta = 1 + 16 = 17$, donc $\\omega_{0\\text{dB}}^2 = \\frac{-1 + \\sqrt{17}}{0{,}02} \\approx 156{,}16 \\implies \\omega_{0\\text{dB}} \\approx 12{,}5\\text{ rad/s}$. Or $\\arg(T(\\mathrm{j}\\omega)) = -90^\\circ - \\arctan(0{,}1\\,\\omega)$, d'où : $$M_\\varphi = 180^\\circ - 90^\\circ - \\arctan(1{,}25) \\approx 90^\\circ - 51{,}3^\\circ = 38{,}7^\\circ < 45^\\circ$$ L'Exigence 2 n'est pas satisfaite : il faut ajouter un correcteur à avance de phase pour apporter environ $+10^\\circ$ de phase autour de $\\omega_{0\\text{dB}}$.",
      },
    ],
  },
];

export default function KhollePage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [activeBoardId, setActiveBoardId] = useState<string>(KHOLLE_BOARDS[0].id);

  // États de révélation des indices, solutions et barème d'auto-évaluation
  const [revealedCourse, setRevealedCourse] = useState<boolean>(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selfScores, setSelfScores] = useState<Record<string, number>>({});

  // Chronomètre de Khôlle : "prep" (20 min préparation) | "oral" (20 min passage)
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
      {/* EN-TÊTE DU SIMULATEUR DE KHÔLLE & PROBLÈMES ÉCRITS */}
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

          {/* Chronomètre officiel 20 min Prépa / 20 min Oral */}
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

        {/* Sélecteur de matière et de planche */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {[
              { id: "all", label: "Toutes les matières" },
              { id: "mathematiques", label: "Mathématiques" },
              { id: "physique-chimie", label: "Physique-Chimie" },
              { id: "sii", label: "Sciences Industrielles (SII)" },
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

        {/* Liste des planches disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

      {/* PARTIE 1 DE LA PLANCHE : QUESTION DE COURS & DÉMONSTRATION (SUR 6 PTS) */}
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

      {/* PARTIE 2 DE LA PLANCHE : PROBLÈME À TIROIRS (SUR 14 PTS) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-sky-950/70 dark:text-sky-300">
            Partie II • Problème d'Approfondissement (14 pts)
          </span>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed pt-2">
            <SafeMath text={activeBoard.problemContext} />
          </div>
        </div>

        {/* Sous-questions liées */}
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