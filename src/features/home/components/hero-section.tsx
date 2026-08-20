"use client";

import { useState } from "react";

import { AboutSection } from "./about/about-section";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { HomeFooter } from "./footer/home-footer";
import { Hero } from "./hero/hero";
import { HeroHeader } from "./hero-header";
import { homeContent } from "./home-content";
import type { HomeLanguage } from "./home-content";
import { HowItWorks } from "./how-it-works/how-it-works";
import { PromoCards } from "./promo-cards";
import { TrustedPartners } from "./trusted-partners";

/**
 * La page d'accueil, assemblée.
 *
 * ═══ Pourquoi la langue vit ici ═══
 *
 * C'est le plus haut composant client de la page, donc le seul endroit
 * d'où l'état peut descendre à la fois vers l'en-tête — qui porte le
 * sélecteur — et vers les sections qui affichent les textes. Le remonter
 * plus haut ferait basculer le layout racine en composant client, et la
 * page cesserait d'être pré-calculée.
 *
 * ═══ Ce qui a disparu ═══
 *
 * `HeroScenePlaceholder`, `KentePattern`, `TrustCard`, `SocialProof` et
 * `AppCallout` : le hero sur fond sombre qu'ils habillaient n'existe plus.
 * Les garanties qu'ils portaient sont dans le bandeau du nouveau hero,
 * l'appel au téléchargement dans ses badges de magasin.
 */
export function HeroSection() {
  const [language, setLanguage] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];

  return (
    <>
      <HeroHeader
        copy={copy}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* `id` : la cible du bouton « Télécharger l'app » de la barre. Une
          ancre plutôt qu'une page — le site n'en a qu'une. */}
      <div id="telecharger">
        <Hero copy={copy.hero} />
      </div>

      <div className="bg-marketing-page">
        <PromoCards copy={copy.promos} />
        <TrustedPartners copy={copy.partners} />
        <HowItWorks copy={copy.howItWorks} />
        <AboutSection copy={copy.about} />
        <HomeFooter copy={copy.footer} whatsapp={copy.whatsapp} />
      </div>
      <FloatingWhatsApp copy={copy.whatsapp} />
    </>
  );
}
