"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Au chargement, on lit la préférence sauvegardée (ou celle du système)
  useEffect(() => {
    const savedTheme = localStorage.getItem("ats-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ats-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ats-theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
      title="Basculer entre le mode clair et le mode sombre"
    >
      <span className="flex items-center gap-2">
        {isDark ? (
          <Moon className="w-4 h-4 text-red-500" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        <span>{isDark ? "Mode Sombre actif" : "Mode Clair actif"}</span>
      </span>
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
        {isDark ? "DARK" : "LIGHT"}
      </span>
    </button>
  );
}