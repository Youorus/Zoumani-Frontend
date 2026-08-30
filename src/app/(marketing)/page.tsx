import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/home/components/hero-section";
import { PageInstrumentation } from "@/features/home/components/page-instrumentation";
import { homeContent } from "@/features/home/components/home-content";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site";
import {
  buildGraph,
  faqSchema,
  howToSchema,
  serviceSchema,
} from "@/lib/seo/structured-data";

// Le seul titre absolu du site : l'accueil ne porte pas le gabarit
// « … | Zoumani », son titre contient déjà la marque.
export const metadata: Metadata = {
  ...pageMetadata({
    path: "/",
    title: siteConfig.title,
    description: siteConfig.description,
  }),
  title: { absolute: siteConfig.title },
};

export default function MarketingHomePage() {
  // Le français est la langue servie : le basculement FR/EN est un état
  // client, et il n'existe qu'une seule URL indexable.
  const { faq, howItWorks } = homeContent.fr;

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      {/* Ne rend rien : elle écoute, et ne parle qu'au `dataLayer`. */}
      <PageInstrumentation />
      <JsonLd
        schema={buildGraph(
          serviceSchema,
          // Le parcours de l'expéditeur : c'est celui que décrit le HowTo.
          howToSchema(howItWorks.tabs[0].steps),
          faqSchema(faq.items),
        )}
      />
    </main>
  );
}
