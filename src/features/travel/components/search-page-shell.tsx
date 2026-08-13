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
   * L'espace connecté porte déjà son propre en-tête et sa navigation :
   * en ajouter un second empilerait deux barres et deux logos. Le
   * visiteur, lui, arrive sans rien autour — il lui faut de quoi
   * revenir, comprendre où il est, et repartir.
   */
  connected: boolean;
}

/**
 * Le cadre de la page de résultats.
 *
 * ═══ Deux contextes, une seule page ═══
 *
 * La recherche est la même pour un visiteur et pour quelqu'un de
 * connecté : mêmes offres, même classement. Ce qui change est ce qu'il y
 * a autour. Une page de résultats nue, sans en-tête ni pied, laisse
 * quelqu'un sans issue quand il ne trouve rien — et sans rien qui dise
 * chez qui il se trouve.
 */
export function SearchPageShell({ children, connected }: SearchPageShellProps) {
  const [language] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];

  if (connected) {
    return (
      <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
        <ShipmentSearch
          className="px-0 sm:px-0 lg:px-0"
          copy={copy.search}
          language={language}
        />
        <div className="mt-6">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* L'en-tête des pages internes, pas celui de l'accueil : ce
          dernier est `fixed` avec un logo blanc, fait pour flotter au
          dessus de la photo du hero. Sur fond clair, son logo devient
          invisible et le contenu passe dessous. */}
      <SiteHeader connected={false} />

      <main className="flex-1">
        {/* La barre reste en haut des résultats : affiner une recherche
            est le geste le plus fréquent sur cet écran, et l'obliger à
            remonter à l'accueil pour cela ferait perdre les résultats
            déjà obtenus. */}
        <div className="pt-6 sm:pt-10">
          <ShipmentSearch copy={copy.search} language={language} />
        </div>
        <div className="mt-8">{children}</div>
      </main>

      <HomeFooter copy={copy.footer} language={language} whatsapp={copy.whatsapp} />
    </div>
  );
}
