"use client";

import React from "react";
import katex from "katex";

interface MathTextProps {
  /** Contenu à rendre (supporte $...$ et $$...$$). Alias : `content` */
  text?: string;
  content?: string;
  className?: string;
  /**
   * Force le mode display (block centré) pour les formules pures.
   * N'a d'effet que si la chaîne entière est enveloppée dans $...$ ou $$...$$.
   * Pour du texte mixte (prose + formules inline), ce prop est ignoré.
   */
  displayMode?: boolean;
}

/**
 * Composant universel de rendu KaTeX.
 * - Texte pur sans $ → rendu HTML natif React (jamais passé à KaTeX).
 * - Texte avec $...$ ou $$...$$ → parsing et rendu KaTeX des blocs math.
 * - displayMode={true} sur une chaîne purement $...$ → rendu display centré.
 *
 * Utilisé dans FlashcardDeck, QcmEngine, ExamenPage, CarnetErreurs, Kholle.
 */
export default function MathText({
  text,
  content,
  className = "",
  displayMode = false,
}: MathTextProps) {
  const raw = text ?? content ?? "";

  if (!raw) return null;

  // Vérifie si la chaîne ENTIÈRE est une formule pure ($$...$$ ou $...$)
  const isFullDisplayBlock = raw.startsWith("$$") && raw.endsWith("$$") && raw.length > 4;
  const isFullInlineBlock = raw.startsWith("$") && raw.endsWith("$") && raw.length > 2 && !raw.startsWith("$$");

  // Cas 1 : bloc display pur ($$...$$) ou demande de displayMode sur $...$
  if (isFullDisplayBlock || (displayMode && isFullInlineBlock)) {
    const inner = isFullDisplayBlock ? raw.slice(2, -2) : raw.slice(1, -1);
    try {
      const html = katex.renderToString(inner, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
      return (
        <span
          className={`block my-2 overflow-x-auto ${className}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <span className={className}>{inner}</span>;
    }
  }

  // Cas 2 : texte mixte — on découpe autour des délimiteurs $...$ et $$...$$
  // Le texte ordinaire (accents, ponctuation…) est rendu tel quel par React.
  const parts = raw.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          try {
            const html = katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
            return (
              <span
                key={index}
                className="block my-2 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{math}</span>;
          }
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={index}>{math}</span>;
          }
        }

        // Texte ordinaire : rendu React natif — les accents s'affichent parfaitement
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
