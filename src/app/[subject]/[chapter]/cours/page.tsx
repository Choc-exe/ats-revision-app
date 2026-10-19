import React from "react";
import { getMdxContent } from "@/lib/content-loader";
import MdxViewer from "@/components/mdx/MdxViewer";
import { FileWarning } from "lucide-react";

interface CoursePageProps {
  params: Promise<{
    subject: string;
    chapter: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { subject, chapter } = await params;
  const data = await getMdxContent(subject, chapter, "course");

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <FileWarning className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Cours en cours de rédaction
        </h2>
        <p className="text-sm text-slate-500">
          Créez le fichier{" "}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-red-600">
            content/{subject}/{chapter}/course.mdx
          </code>{" "}
          pour afficher ce chapitre.
        </p>
      </div>
    );
  }

  return <MdxViewer source={data.content} variant="detailed" />;
}