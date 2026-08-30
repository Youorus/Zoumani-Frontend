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

  /**
   * Les seules routes à ne pas explorer.
   *
   * `/trips` y figurait, hérité d'un espace connecté que ce dépôt n'a
   * jamais servi : l'adresse rend 404, vérifié en production. Un
   * `Disallow` sur une route inexistante n'est pas neutre — il fait
   * croire à un espace privé, et il survit à la création future d'une
   * page qui porterait ce nom.
   *
   * Reste `/api/` : les routes de l'API rendent du JSON, elles n'ont rien
   * à faire dans un index et leur exploration consomme du budget de
   * crawl pour rien.
   */
  const disallow = ["/api/"];

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
