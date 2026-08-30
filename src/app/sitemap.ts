import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

/**
 * Le plan du site.
 *
 * Deux URL. La vitrine n'en avait qu'une depuis le départ de l'espace
 * connecté ; la préinscription en ajoute une, parce qu'elle porte son
 * propre contenu et sa propre requête — « rejoindre la liste » n'est pas
 * « qu'est-ce que Zoumani ».
 *
 * Sans paramètre `type` : `?type=sender` et `?type=traveler` mènent au
 * même contenu, et les indexer produirait trois adresses pour une page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/preinscription"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
