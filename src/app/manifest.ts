import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.shortTitle,
    description: siteConfig.shortDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "fr-FR",
    dir: "ltr",
    categories: ["travel", "shopping", "business"],
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    /*
     * ═══ Pourquoi le masquable est un fichier à part ═══
     *
     * `maskable` autorise Android à rogner l'icône — en cercle, en
     * squircle, en goutte selon le lanceur. Le système ne garantit que le
     * disque central de 80 % ; tout ce qui déborde peut disparaître.
     *
     * L'export de la charte livrait le symbole sur fond transparent, en le
     * déclarant masquable. Les deux têtes touchent presque le bord : elles
     * auraient été coupées, et la transparence remplie de noir par le
     * lanceur. `icon-maskable-512.png` est donc une variante distincte —
     * symbole réduit à 62 %, posé sur le crème de la marque.
     *
     * Les autres restent `any` : elles s'affichent telles quelles, ce
     * qu'elles sont réellement.
     */
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
