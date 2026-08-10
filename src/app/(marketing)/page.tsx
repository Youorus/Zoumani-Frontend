import type { Metadata } from "next";

import { HeroSection } from "@/features/home/components/hero-section";

export const metadata: Metadata = {
  title: "Zoumani | Envoyez vos colis autrement",
  description:
    "Envoyez vos colis entre l’Afrique et le reste du monde avec des voyageurs de confiance.",
};

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <HeroSection backgroundImageUrl="/images/home/hero-airport-v1.webp" />
    </main>
  );
}
