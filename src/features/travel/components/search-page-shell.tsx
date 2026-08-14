"use client";

import { useState } from "react";

import { homeContent, type HomeLanguage } from "@/features/home/components/home-content";
import { HomeFooter } from "@/features/home/components/footer/home-footer";
import { SiteHeader } from "./site-header";
import { ShipmentSearch } from "@/features/home/components/shipment-search";

interface SearchPageShellProps {
  children: React.ReactNode;
  /**
   * Vrai quand la personne a une session.
   *
   * `/search` reste une route publique, hors du layout du compte. Elle
   * doit donc toujours rendre son propre cadre ; seule l'action à droite
   * change entre « créer un compte » et « mon espace ».
   */
  connected: boolean;
  criteria: { origin: string; destination: string; categories: string[] };
}

/**
 * Le cadre de la page de résultats.
 *
 * ═══ Deux contextes, une seule page ═══
 *
 * La recherche est la même pour un visiteur et pour quelqu'un de
 * connecté : mêmes offres, même classement, même header et même footer.
 * Seules les actions de session changent, sans faire sauter la structure
 * pendant l'hydratation.
 */
export function SearchPageShell({ children, connected, criteria }: SearchPageShellProps) {
  const [language] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];

  return (
    <div
      className="flex min-h-screen flex-col bg-background text-foreground"
      data-brand="zoumani"
      data-color-scheme="light"
    >
      {/* L'en-tête des pages internes, pas celui de l'accueil : ce
          dernier est `fixed` avec un logo blanc, fait pour flotter au
          dessus de la photo du hero. Sur fond clair, son logo devient
          invisible et le contenu passe dessous. */}
      <SiteHeader connected={connected} />

      <main className="flex-1">
        {/* La barre reste en haut des résultats : affiner une recherche
            est le geste le plus fréquent sur cet écran, et l'obliger à
            remonter à l'accueil pour cela ferait perdre les résultats
            déjà obtenus. */}
        <div className="border-b border-border/70 bg-background/92 py-3 backdrop-blur lg:sticky lg:top-16 lg:z-20">
          <ShipmentSearch
            key={`${criteria.origin}:${criteria.destination}:${criteria.categories.join(",")}`}
            copy={copy.search}
            language={language}
            variant="compact"
            initialFilters={criteria}
          />
        </div>
        <div className="mt-7 sm:mt-10">{children}</div>
      </main>

      <HomeFooter
        copy={copy.footer}
        language={language}
        whatsapp={copy.whatsapp}
        routeHomeAnchors
      />
    </div>
  );
}
