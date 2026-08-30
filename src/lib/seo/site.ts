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

  /**
   * Compte X officiel, quand il existera.
   *
   * `@zoumani` y figurait. Ce compte n'est pas celui de la marque : il
   * appartient à quelqu'un d'autre, et le déclarer dans `twitter:site`
   * lui attribuait la paternité de chaque page partagée.
   */
  twitter: undefined as string | undefined,

  /**
   * Profils officiels de la marque — et rien d'autre.
   *
   * ═══ Pourquoi cette liste est vide ═══
   *
   * Elle contenait quatre adresses devinées à partir du nom :
   * `facebook.com/zoumani`, `instagram.com/zoumani`,
   * `linkedin.com/company/zoumani`, `x.com/zoumani`. Vérification faite,
   * `instagram.com/zoumani` est le compte personnel d'une personne réelle,
   * sans lien avec la marque.
   *
   * `sameAs` n'est pas une liste de liens : c'est une **déclaration
   * d'identité**. On y affirme à Google que ces profils sont ceux de
   * l'entreprise. Une adresse devinée revient donc à s'approprier le
   * compte d'un tiers dans le graphe de connaissances — et à laisser
   * Google construire l'identité de Zoumani autour de quelqu'un d'autre.
   *
   * Un `sameAs` absent ne coûte rien. Un `sameAs` faux coûte une
   * réclamation et une identité de marque à défaire.
   *
   * N'ajouter ici qu'une adresse **ouverte et contrôlée** par Zoumani.
   */
  social: {} as Readonly<Record<string, string>>,

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
