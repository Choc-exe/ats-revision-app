import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CriticalFormula from "./CriticalFormula";
import WarningBox from "./WarningBox";
import SchemaPlaceholder from "./SchemaPlaceholder";
import PythonSandbox from "./PythonSandbox";

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
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-2xl font-bold text-slate-900 tracking-tight mb-6 pb-3 border-b border-slate-200"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xl font-bold text-slate-900 mt-10 mb-4 flex items-center gap-2.5"
      {...props}
    >
      <span className="w-1.5 h-5 rounded-full bg-red-600 inline-block shrink-0" />
      <span>{props.children}</span>
    </h2>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-base font-bold text-slate-800 mt-6 mb-2"
      {...props}
    />
  ),
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
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className="font-bold text-slate-900 bg-red-50/80 text-red-700 px-1 py-0.5 rounded"
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
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 ${
        variant === "synthetic" ? "border-t-4 border-t-red-600" : ""
      }`}
    >
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