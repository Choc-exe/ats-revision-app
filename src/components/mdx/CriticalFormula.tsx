import React from "react";
import { BookmarkCheck } from "lucide-react";

interface CriticalFormulaProps {
  title?: string;
  children: React.ReactNode;
}

export default function CriticalFormula({
  title = "À connaître absolument",
  children,
}: CriticalFormulaProps) {
  return (
    <div className="print-keep-together my-6 rounded-xl border border-red-200/90 dark:border-red-900/60 border-l-4 border-l-red-600 dark:border-l-red-500 bg-red-50/40 dark:bg-red-950/25 p-5">
      <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold text-sm mb-2.5">
        <BookmarkCheck className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
        <span>{title}</span>
      </div>
      <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}