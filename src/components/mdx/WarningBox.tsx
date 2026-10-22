import React from "react";
import { AlertTriangle } from "lucide-react";

interface WarningBoxProps {
  title?: string;
  children: React.ReactNode;
}

export default function WarningBox({
  title = "Point de vigilance / Piège classique",
  children,
}: WarningBoxProps) {
  return (
    <div className="my-6 rounded-xl border border-red-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-600 mb-1">{title}</h4>
          <div className="text-sm text-slate-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
<div className="print-keep-together my-6 rounded-xl border border-red-200 bg-white p-5 shadow-xs"></div>