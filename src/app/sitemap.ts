import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

/**
 * Le plan du site.
 *
 * Une seule URL, et c'est normal : la vitrine n'a qu'une page. Elle en
 * comptait davantage — recherche, connexion, inscription — parties avec
 * l'espace connecté. Un plan de site à une entrée reste utile : il donne
 * la date de dernière modification et signale l'existence du domaine.
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
  ];
}
