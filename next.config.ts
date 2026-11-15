import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimise le tree-shaking des librairies avec de nombreux exports nommés
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "katex",
    ],
  },

  // Compression Gzip/Brotli automatique
  compress: true,

  // Désactive le X-Powered-By header (léger gain sécurité)
  poweredByHeader: false,

  // Optimisation des images (formats modernes)
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
