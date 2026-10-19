import React from "react";
import { Flame } from "lucide-react";

interface CriticalFormulaProps {
  title: string;
  children: React.ReactNode;
}

export default function CriticalFormula({
  title,
  children,
}: CriticalFormulaProps) {
  return (
    <div className="my-6 rounded-r-xl border-l-4 border-red-600 bg-red-50/70 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wide mb-2">
        <Flame className="w-4 h-4 shrink-0" />
        <span>À connaître absolument — {title}</span>
      </div>
      <div className="text-slate-900 font-medium leading-relaxed overflow-x-auto">
        {children}
      </div>
    </div>
  );
}