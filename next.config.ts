import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  // Produit .next/standalone : image Docker minimale, sans node_modules complet.
  output: "standalone",

  // Masque la version de Next dans les reponses HTTP.
  poweredByHeader: false,

  // Une URL canonique unique par page : evite le contenu duplique.
  trailingSlash: false,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Identifie la version deployee : evite les erreurs de version skew
  // quand un ancien onglet demande des assets d'un build precedent.
  deploymentId: process.env.DEPLOYMENT_ID,

  async redirects() {
    return [
      {
        // Une seule adresse canonique : www redirige en 301 vers le domaine nu.
        // Evite que le meme contenu soit servi sous deux hotes differents.
        source: "/:path*",
        has: [{ type: "host", value: "www\\.(?<domain>.*)" }],
        destination: "https://:domain/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Traefik ne met pas les reponses en tampon : preserve le streaming SSR.
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
      {
        // Le sitemap change avec le contenu : cache court cote CDN.
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
