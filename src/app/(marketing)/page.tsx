import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { HeroSection } from "@/features/home/components/hero-section";
import { siteConfig } from "@/lib/seo/site";
import {
  buildGraph,
  faqSchema,
  howItWorksSchema,
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
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <HeroSection />
      <JsonLd schema={buildGraph(serviceSchema, howItWorksSchema, faqSchema)} />
    </main>
  );
}
