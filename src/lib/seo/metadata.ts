import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/seo/site";

/**
 * Le constructeur de métadonnées d'une page.
 *
 * ═══ Pourquoi il a fallu l'écrire ═══
 *
 * Dans Next, `openGraph` d'une page **remplace** celui du layout au lieu
 * de le compléter. Une page qui déclarait `openGraph: { title,
 * description }` perdait donc silencieusement l'image sociale et l'URL
 * héritées — sans erreur, sans avertissement, et sans que rien ne se voie
 * avant de partager le lien.
 *
 * Les deux moitiés du site en portaient chacune une conséquence : les
 * pages contractuelles annonçaient `og:url = https://zoumani.fr` quelle
 * que soit la page, et les trois pages stratégiques — préinscription,
 * envoyer un colis, proposer un voyage — partaient **sans aucune image
 * sociale**. Partagées sur WhatsApp ou LinkedIn, elles s'affichaient en
 * lien nu.
 *
 * ═══ Ce que la fonction garantit ═══
 *
 * Une page ne décrit plus que ce qui la distingue : son chemin, son
 * titre, sa description. Tout ce qui doit rester cohérent — canonique,
 * `og:url`, image, `siteName`, carte Twitter — est calculé à partir du
 * chemin, une fois, ici. Le défaut ne peut pas revenir par oubli : il
 * n'y a plus rien à ne pas oublier.
 */
export interface PageMetadataInput {
  /** Chemin absolu depuis la racine, sans domaine : `/preinscription`. */
  path: string;
  /**
   * Titre de la page, **sans** le suffixe de marque : le gabarit du
   * layout ajoute « | Zoumani ». Vise 60 caractères une fois le suffixe
   * compté, au-delà Google tronque.
   */
  title: string;
  /** 155 à 160 caractères. Au-delà, le moteur coupe au milieu d'un mot. */
  description: string;
  /**
   * Titre pour le partage, quand il doit différer.
   *
   * Un onglet de navigateur et une carte de partage n'ont pas la même
   * largeur ni le même lecteur. À défaut, le titre de la page sert, avec
   * le nom de la marque ajouté — une carte sociale n'hérite d'aucun
   * gabarit.
   */
  ogTitle?: string;
  /** Description pour le partage, quand elle doit différer. */
  ogDescription?: string;
}

export function pageMetadata({
  path,
  title,
  description,
  ogTitle,
  ogDescription,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const partageTitre = ogTitle ?? `${title} | ${siteConfig.name}`;
  const partageTexte = ogDescription ?? description;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: partageTitre,
      description: partageTexte,
      url,
      images: [
        {
          // Générée par `src/app/opengraph-image.tsx`, en 1200×630.
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${siteConfig.shortDescription}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: partageTitre,
      description: partageTexte,
      images: [absoluteUrl("/opengraph-image")],
    },
  };
}
