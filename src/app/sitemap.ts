import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo/site";

/**
 * Sitemap des pages publiques indexables.
 * Les routes applicatives (/trips) sont exclues : elles sont dynamiques et
 * destinees aux utilisateurs connectes, pas aux moteurs de recherche.
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
