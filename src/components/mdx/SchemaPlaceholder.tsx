"use client";

import React, { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface SchemaPlaceholderProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function SchemaPlaceholder({
  src,
  alt,
  caption,
}: SchemaPlaceholderProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <figure className="my-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {!imageError ? (
        <div className="flex justify-center bg-slate-50 rounded-lg p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="max-h-80 w-auto object-contain rounded"
          />
        </div>
      ) : (
        /* Affichage de secours élégant si l'image n'est pas encore dans /public */
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-xs font-mono text-slate-500 mb-1">
            Schéma attendu : <span className="text-red-600 font-semibold">{src}</span>
          </p>
          <p className="text-sm text-slate-600 max-w-lg">{alt}</p>
        </div>
      )}

      {caption && (
        <figcaption className="mt-3 text-center text-xs font-medium text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}