import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css"; // Indispensable pour le rendu mathématique KaTeX
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prépa ATS — Plateforme de Révision Locale",
  description: "Application locale de révision du programme officiel CPGE ATS Ingénierie Industrielle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      {/* Fond gris très doux (bg-slate-50) et texte contrasté non agressif (text-slate-800) */}
      <body className="bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased min-h-screen">
        <Sidebar />
        {/* 0px de marge à gauche sur mobile/tablette + 56px en haut pour la barre mobile ; 288px à gauche sur Desktop (lg:) */}
        <main className="lg:pl-72 pt-14 lg:pt-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}