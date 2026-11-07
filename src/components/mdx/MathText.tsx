"use client";

import React from "react";
import katex from "katex";

interface MathTextProps {
  /** Contenu à rendre (supporte $...$ et $$...$$). Alias : `content` */
  text?: string;
  content?: string;
  className?: string;
  /** Force le mode display (block centré) pour toute la chaîne */
  displayMode?: boolean;
}

/**
 * Composant universel de rendu KaTeX inline.
 * Accepte `text` ou `content` (interchangeables) et reconnaît $...$ / $$...$$.
 * Utilisé dans FlashcardDeck, QcmEngine, ExamenPage, CarnetErreurs, Kholle.
 */
export default function MathText({
  text,
  content,
  className = "",
  displayMode = false,
}: MathTextProps) {
  const raw = text ?? content ?? "";

  // Mode display forcé : on rend tout en un seul bloc display
  if (displayMode) {
    const inner = raw.startsWith("$$") && raw.endsWith("$$")
      ? raw.slice(2, -2)
      : raw.startsWith("$") && raw.endsWith("$")
      ? raw.slice(1, -1)
      : raw;
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
  }

  // Mode mixte : découpe la chaîne autour des délimiteurs $$...$$ et $...$
  const parts = raw.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
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
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
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
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
