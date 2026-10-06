/** Proposition visuelle uniquement : cette configuration ne change aucune offre réelle. */
export const PARTNER_OFFER = {
  complimentaryShipments: 10,
} as const;

/** Des exemples, jamais des statistiques de Zoumani. */
export const PARTNER_DEMO = {
  completedShipments: 7,
  clients: 7,
  revenueEur: 840,
} as const;

export function partnerDemoProgress(quota: number) {
  const total = Math.max(1, Math.floor(quota));
  const completed = Math.min(PARTNER_DEMO.completedShipments, total);
  return { total, completed };
}

/** La photo existante est réutilisée pour la preview, et reste remplaçable ici. */
export const PREVIEW_ASSETS = {
  hero: {
    src: "/images/hero/zoumani-sourire-pagne.webp",
    alt: "Un sourire chaleureux, avec une proche en arrière-plan.",
  },
  app: "/images/hero/zoumani-app-screen.webp",
  traveler: "/images/hero/zoumani-airport-campaign.webp",
} as const;

export const PREVIEW_CITIES = [
  { region: "Europe", cities: ["Paris", "Bruxelles", "Lyon", "Marseille", "Genève", "Londres"] },
  { region: "Afrique", cities: ["Douala", "Abidjan", "Dakar", "Yaoundé", "Kinshasa", "Lomé"] },
] as const;

export const PREVIEW_CORRIDORS = ["Douala", "Abidjan", "Dakar"] as const;
