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
      <body className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-red-100 selection:text-red-900">
        <div className="flex min-h-screen">
          {/* Barre latérale fixe à gauche */}
          <Sidebar />

          {/* Zone de contenu principale à droite */}
          <div className="flex-1 pl-72 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}