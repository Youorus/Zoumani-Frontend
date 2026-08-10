import { env } from "@/lib/env/env";

/**
 * Source unique de vérité pour tout ce qui touche au référencement.
 * L'URL publique vient de NEXT_PUBLIC_APP_URL : c'est la seule valeur à changer
 * le jour où le domaine définitif est branché.
 */
export const siteUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

export const siteConfig = {
  name: "Zoumani",
  legalName: "Zoumani",
  url: siteUrl,
  locale: "fr_FR",
  themeColor: "#ff6b00",
  backgroundColor: "#fff8f0",

  title: "Zoumani | Envoyez vos colis avec des voyageurs de confiance",
  shortTitle: "Zoumani",
  titleTemplate: "%s | Zoumani",

  description:
    "Zoumani met en relation les expéditeurs de colis et les voyageurs qui ont de la place dans leurs bagages. Trouvez un voyage vers votre destination, vérifiez le profil du voyageur, déclarez votre colis, payez en toute sécurité et suivez la livraison.",

  shortDescription:
    "La marketplace qui relie expéditeurs de colis et voyageurs entre l’Afrique et le reste du monde.",

  keywords: [
    "envoi de colis",
    "envoyer un colis en Afrique",
    "transport de colis par voyageur",
    "cotransportage",
    "colis voyageur",
    "bagage disponible",
    "expédier un colis pas cher",
    "envoi colis diaspora",
    "mise en relation expéditeur voyageur",
    "suivi de colis",
    "marketplace colis",
    "Zoumani",
  ],

  twitter: "@zoumani",

  /** Réseaux sociaux : alimente sameAs dans le JSON-LD. Retirer les entrées non ouvertes. */
  social: {
    facebook: "https://www.facebook.com/zoumani",
    instagram: "https://www.instagram.com/zoumani",
    linkedin: "https://www.linkedin.com/company/zoumani",
    x: "https://x.com/zoumani",
  },

  /**
   * Codes de vérification des consoles moteurs de recherche.
   * À renseigner via variables d'environnement quand les propriétés sont créées.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
} as const;

/** Construit une URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}

/**
 * L'indexation est une décision explicite, jamais déduite de l'environnement :
 * il faut poser NEXT_PUBLIC_SEO_INDEXABLE=true pour autoriser les moteurs.
 *
 * Sans ce drapeau, le site répond `noindex` et un robots.txt bloquant. C'est ce
 * qui empêche un domaine temporaire (preview, sslip.io, préproduction) de se
 * retrouver dans l'index et de faire concurrence au domaine définitif.
 *
 * Le garde-fou localhost reste actif quoi qu'il arrive.
 */
export const isIndexable =
  process.env.NEXT_PUBLIC_SEO_INDEXABLE === "true" &&
  !siteUrl.includes("localhost") &&
  !siteUrl.includes("127.0.0.1");
