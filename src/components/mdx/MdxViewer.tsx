import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CriticalFormula from "./CriticalFormula";
import WarningBox from "./WarningBox";
import SchemaPlaceholder from "./SchemaPlaceholder";

interface MdxViewerProps {
  source: string;
  variant?: "detailed" | "synthetic";
}

// Personnalisation des balises HTML et injection des composants MDX
// Personnalisation des balises HTML et injection des composants MDX
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
    <ul className="list-disc list-outside pl-6 space-y-2 mb-5 text-slate-700 leading-7" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-outside pl-6 space-y-2 mb-5 text-slate-700 leading-7" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className="font-bold text-slate-900 bg-red-50/80 text-red-700 px-1 py-0.5 rounded"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-slate-200" />,

  // BLOC DE SCRIPT COMPLET (ex: ```python ... ```) -> Fenêtre style IDE
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-md">
      {/* Barre supérieure type terminal / VS Code */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Script Python 3 — Norme ATS
        </span>
      </div>
      {/* Contenu du script avec défilement horizontal et indentation préservée */}
      <pre
        className="p-4 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed text-emerald-300 selection:bg-red-500/30"
        {...props}
      />
    </div>
  ),

  // CODE INLINE (ex: `int`, `+`, `-`) vs CODE DANS UN BLOC <pre>
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