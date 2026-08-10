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

/** Explique le fonctionnement de la plateforme — éligible aux résultats enrichis HowTo. */
export const howItWorksSchema = {
  "@type": "HowTo",
  name: "Comment envoyer un colis avec Zoumani",
  description:
    "Les étapes pour confier un colis à un voyageur vérifié via la marketplace Zoumani.",
  totalTime: "PT10M",
  step: [
    {
      name: "Rechercher un voyage",
      text: "Indiquez la ville de départ et la destination pour trouver les voyageurs disposant d'espace dans leurs bagages.",
    },
    {
      name: "Choisir un voyageur vérifié",
      text: "Comparez les profils, consultez les vérifications d'identité et sélectionnez le voyageur qui vous convient.",
    },
    {
      name: "Déclarer le colis",
      text: "Décrivez le contenu, le poids et la valeur du colis à expédier.",
    },
    {
      name: "Payer en toute sécurité",
      text: "Réglez via le paiement sécurisé de la plateforme, qui protège l'expéditeur comme le voyageur.",
    },
    {
      name: "Suivre la livraison",
      text: "Suivez l'avancement de la transaction jusqu'à la remise du colis au destinataire.",
    },
  ].map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
} as const;

/** Questions fréquentes — éligible au bloc FAQ dans les résultats de recherche. */
export const faqSchema = {
  "@type": "FAQPage",
  mainEntity: [
    {
      question: "Comment fonctionne Zoumani ?",
      answer:
        "Zoumani est une marketplace qui met en relation des expéditeurs souhaitant envoyer un colis et des voyageurs disposant d'espace disponible dans leurs bagages. La plateforme gère la recherche de voyage, la mise en relation, la vérification des utilisateurs, la déclaration du colis, le paiement sécurisé et le suivi de la transaction.",
    },
    {
      question: "Zoumani transporte-t-il les colis ?",
      answer:
        "Non. Zoumani n'est pas un transporteur. Le transport est effectué par les voyageurs qui utilisent la plateforme. Zoumani fournit le cadre de mise en relation, de vérification, de paiement sécurisé et de suivi.",
    },
    {
      question: "Comment les voyageurs sont-ils vérifiés ?",
      answer:
        "Chaque utilisateur passe par un processus de vérification avant de pouvoir proposer ou réserver un espace bagage. Les profils vérifiés sont identifiés sur la plateforme.",
    },
    {
      question: "Le paiement est-il sécurisé ?",
      answer:
        "Oui. Le paiement est réalisé via la plateforme et sécurisé pour protéger l'expéditeur comme le voyageur pendant toute la durée de la transaction.",
    },
    {
      question: "Puis-je suivre mon colis ?",
      answer:
        "Oui. Le suivi de la transaction est disponible depuis votre espace Zoumani, de la mise en relation jusqu'à la remise du colis.",
    },
  ].map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
} as const;

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
