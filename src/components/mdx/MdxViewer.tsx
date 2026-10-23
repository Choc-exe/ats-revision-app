import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CriticalFormula from "./CriticalFormula";
import WarningBox from "./WarningBox";
import SchemaPlaceholder from "./SchemaPlaceholder";
import PythonSandbox from "./PythonSandbox";
import PrintPdfButton from "./PrintPdfButton";

interface MdxViewerProps {
  source: string;
  variant?: "detailed" | "synthetic";
}

// 1. FONCTION UTILITAIRE (placée EN DEHORS de mdxComponents)
// Elle extrait le texte brut du script Python contenu dans <pre><code>...</code></pre>
function extractTextFromChildren(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join("");
  if (React.isValidElement(node)) {
    return extractTextFromChildren(
      (node.props as { children?: React.ReactNode }).children
    );
  }
  return "";
}

// 2. DICTIONNAIRE DES COMPOSANTS MDX
const mdxComponents = {
  CriticalFormula,
  WarningBox,
  SchemaPlaceholder,
  // 1. Masque le <h1> redondant du fichier MDX (déjà affiché dans l'en-tête de page)
  // 1. Masque le <h1> redondant du fichier MDX (déjà affiché dans l'en-tête de page)
  h1: () => null,

  // 2. Titres de sections avec barre bleue d'instrumentation (et non plus rouge)
 h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 flex items-center gap-2.5"
      {...props}
    >
      <span className="w-1.5 h-5 rounded-full bg-blue-600 dark:bg-sky-400 inline-block shrink-0" />
      <span>{props.children}</span>
    </h2>
  ),

  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-base font-bold text-slate-800 dark:text-slate-200 mt-6 mb-2"
      {...props}
    />
  ),

  // 3. Termes définis (**gras**) en ardoise/bleu sobre : le rouge reste 100% réservé aux formules critiques
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded dark:border-sky-400/40"
      {...props}
    />
  ),

  // 3. Termes définis (**gras**) en ardoise/bleu sobre : le rouge reste 100% réservé aux formules critiques
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 leading-7 mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-outside pl-6 space-y-2 mb-5 text-slate-700 leading-7"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-outside pl-6 space-y-2 mb-5 text-slate-700 leading-7"
      {...props}
    />
  ),

  hr: () => <hr className="my-8 border-slate-200" />,

  // C'EST ICI QUE L'ANCIEN BLOC `pre:` EST REMPLACÉ PAR PYTHON SANDBOX :
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    const rawCode = extractTextFromChildren(props.children);
    return <PythonSandbox initialCode={rawCode} />;
  },

  // CODE INLINE (ex: `int`, `+`, `-`)
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="inline-code font-mono text-[13px] [[pre_&]]:bg-transparent [[pre_&]]:text-emerald-300 [[pre_&]]:p-0 [[pre_&]]:border-0 bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 font-semibold"
      {...props}
    />
  ),
};

export default function MdxViewer({
  source,
  variant = "detailed",
}: MdxViewerProps) {
  return (
    <article
  className={`print-article bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 md:p-10 ${
    variant === "synthetic" ? "border-t-4 border-t-blue-600" : ""
  }`}
>
      <div className="no-print flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {variant === "synthetic"
            ? "Fiche Synthèse Officielle — Format Révision Rapide"
            : "Cours Complet & Démonstrations Exigibles"}
        </span>
        <PrintPdfButton
          label={
            variant === "synthetic"
              ? "Exporter la Fiche en PDF"
              : "Exporter le Cours en PDF"
          }
        />
      </div>

      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        }}
      />
    </article>
  );
}