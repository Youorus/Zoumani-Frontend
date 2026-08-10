import type { MetadataRoute } from "next";

import { absoluteUrl, isIndexable, siteUrl } from "@/lib/seo/site";

/**
 * Regles de crawl. Tant qu'aucun domaine public n'est configure
 * (NEXT_PUBLIC_APP_URL sur localhost), tout est bloque pour eviter
 * qu'un environnement de test finisse dans un index.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  // Routes applicatives et techniques : sans valeur pour la recherche.
  const disallow = ["/api/", "/trips", "/trips/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        // Googlebot-Image : autorise l'indexation des visuels du site.
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/opengraph-image"],
      },
      {
        // Yandex accepte une directive de nettoyage des parametres de tracking.
        userAgent: "Yandex",
        allow: "/",
        disallow,
        other: { "Clean-param": "utm_source&utm_medium&utm_campaign&fbclid&gclid" },
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
