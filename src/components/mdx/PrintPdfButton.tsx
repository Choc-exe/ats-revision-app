"use client";

import React from "react";
import { Printer } from "lucide-react";

interface PrintPdfButtonProps {
  label?: string;
}

export default function PrintPdfButton({
  label = "Imprimer / Exporter en PDF (A4)",
}: PrintPdfButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
      title="Générer une fiche PDF A4 propre prête à imprimer"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}