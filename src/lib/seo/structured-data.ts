import { absoluteUrl, siteConfig, siteUrl } from "./site";

/**
 * Données structurées schema.org (JSON-LD).
 * Google, Bing, Yandex et les assistants IA s'en servent pour comprendre
 * l'entité Zoumani et afficher des résultats enrichis.
 */

const sameAs = Object.values(siteConfig.social);

/** Identifiants stables : permettent de relier les graphes entre eux. */
export const schemaIds = {
  organization: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
  service: `${siteUrl}/#service`,
} as const;

export const organizationSchema = {
  "@type": "Organization",
  "@id": schemaIds.organization,
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: siteUrl,
  description: siteConfig.description,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl("/icon-512.png"),
    contentUrl: absoluteUrl("/icon-512.png"),
    width: 512,
    height: 512,
    caption: siteConfig.name,
  },
  image: absoluteUrl("/opengraph-image"),
  sameAs,
} as const;

export const websiteSchema = {
  "@type": "WebSite",
  "@id": schemaIds.website,
  url: siteUrl,
  name: siteConfig.name,
  description: siteConfig.description,
  publisher: { "@id": schemaIds.organization },
  inLanguage: ["fr-FR", "en-US"],
} as const;

/**
 * Zoumani n'est pas un transporteur : le service rendu est la mise en relation.
 * Le type retenu est donc Service (et non DeliveryService / MovingCompany),
 * ce qui évite toute déclaration trompeuse auprès des moteurs.
 */
export const serviceSchema = {
  "@type": "Service",
  "@id": schemaIds.service,
  name: "Mise en relation expéditeurs et voyageurs",
  serviceType: "Marketplace de cotransportage de colis",
  provider: { "@id": schemaIds.organization },
  url: siteUrl,
  areaServed: { "@type": "Place", name: "International" },
  audience: [
    { "@type": "Audience", audienceType: "Expéditeurs de colis" },
    { "@type": "Audience", audienceType: "Voyageurs avec bagage disponible" },
  ],
  description:
    "Zoumani facilite la recherche d'un voyage correspondant à une destination, la mise en relation, la vérification des utilisateurs, la déclaration du colis, le paiement sécurisé et le suivi de la transaction. Le transport est effectué par les voyageurs utilisant la plateforme.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Étapes du service Zoumani",
    itemListElement: [
      "Recherche d'un voyage vers une destination",
      "Mise en relation avec un voyageur vérifié",
      "Déclaration du colis",
      "Paiement sécurisé",
      "Suivi de la transaction",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
} as const;

/**
 * Explique le fonctionnement de la plateforme — éligible aux résultats
 * enrichis HowTo.
 *
 * Les étapes viennent du contenu affiché, et non d'une liste recopiée ici :
 * une page qui promet aux moteurs des étapes qu'elle n'affiche pas est
 * exactement ce que la documentation de Google appelle du balisage
 * trompeur. Le seul moyen de garantir qu'elles ne divergent jamais est de
 * n'en avoir qu'un exemplaire.
 */
export function howToSchema(
  steps: ReadonlyArray<{ title: string; detail: string }>,
) {
  return {
    "@type": "HowTo",
    name: "Comment envoyer un colis avec Zoumani",
    description:
      "Les étapes pour confier un colis à un voyageur vérifié via la marketplace Zoumani.",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.detail,
    })),
  } as const;
}

/**
 * Questions fréquentes — éligible au bloc FAQ dans les résultats de
 * recherche. Même règle que ci-dessus : ce sont les questions réellement
 * affichées dans la section FAQ de la page.
 */
export function faqSchema(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  } as const;
}

/** Fil d'Ariane : améliore l'affichage du chemin de page dans les résultats. */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Regroupe plusieurs schémas dans un unique graphe @graph. */
export function buildGraph(...nodes: readonly object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
