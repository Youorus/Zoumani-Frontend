import type { Metadata } from "next";

import { LandingPreview } from "@/features/home-preview/components/landing-preview";
import { pageMetadata } from "@/lib/seo/metadata";

/** Route statique isolée, exclue du sitemap et de l’indexation. L’accueil reste intact. */
export const metadata: Metadata = {
  ...pageMetadata({ path: "/preview/v2", title: "Proposition landing V2", description: "Preview de la proposition Zoumani : vos colis voyagent, vos liens restent proches." }),
  robots: { index: false, follow: false },
};

export default function LandingPreviewPage() {
  return <LandingPreview />;
}
