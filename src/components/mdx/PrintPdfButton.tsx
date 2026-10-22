"use client";

import React, { useEffect } from "react";
import { Printer } from "lucide-react";

interface PrintPdfButtonProps {
  label?: string;
}

export default function PrintPdfButton({
  label = "Imprimer / Exporter en PDF (A4)",
}: PrintPdfButtonProps) {
  // Sécurité supplémentaire : intercepte aussi le raccourci clavier Ctrl+P / Cmd+P
  useEffect(() => {
    let wasDark = false;

    const handleBeforePrint = () => {
      if (document.documentElement.classList.contains("dark")) {
        wasDark = true;
        document.documentElement.classList.remove("dark");
      }
    };

    const handleAfterPrint = () => {
      if (wasDark) {
        document.documentElement.classList.add("dark");
        wasDark = false;
      }
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    const htmlEl = document.documentElement;
    const isCurrentlyDark = htmlEl.classList.contains("dark");

    // On retire temporairement .dark pour garantir un rendu 100% clair et net
    if (isCurrentlyDark) {
      htmlEl.classList.remove("dark");
    }

    setTimeout(() => {
      window.print();
      if (isCurrentlyDark) {
        htmlEl.classList.add("dark");
      }
    }, 80);
  };

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
      title="Générer un polycopié PDF A4 vectoriel propre"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}