import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/home/components/hero-section";
import { homeContent } from "@/features/home/components/home-content";
import { siteConfig } from "@/lib/seo/site";
import {
  buildGraph,
  faqSchema,
  howToSchema,
  serviceSchema,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.title,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function MarketingHomePage() {
  // Le français est la langue servie : le basculement FR/EN est un état
  // client, et il n'existe qu'une seule URL indexable.
  const { faq, howItWorks } = homeContent.fr;

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
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
