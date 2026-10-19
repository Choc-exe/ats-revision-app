"use client";

import React from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  // Découpe la chaîne autour des délimiteurs $$...$$ et $...$
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
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