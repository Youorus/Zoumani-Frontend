import type { MetadataRoute } from "next";

import { ENTRY_PAGES } from "@/features/prelaunch/model/entry-pages";
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
    // Les deux pages d'entrée, construites depuis `ENTRY_PAGES` : le jour
    // où un corridor mérite la sienne, elle entre ici sans que ce fichier
    // change.
    // Obligatoire dès qu'on collecte, et référencée : une politique de
    // confidentialité qu'on ne trouve pas ne vaut pas mieux qu'une absente.
    {
      url: absoluteUrl("/confidentialite"),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    },
    ...ENTRY_PAGES.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
