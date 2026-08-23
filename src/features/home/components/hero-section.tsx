"use client";

import { useEffect, useState } from "react";

import { FaqSection } from "./faq/faq-section";
import { HomeFooter } from "./footer/home-footer";
import { Hero } from "./hero/hero";
import { HeroHeader } from "./hero-header";
import { homeContent } from "./home-content";
import type { HomeLanguage } from "./home-content";
import { HowItWorks } from "./how-it-works/how-it-works";
import { TrustedPartners } from "./trusted-partners";

/**
 * La page d'accueil, assemblée.
 *
 * ═══ Quatre sections, et rien d'autre ═══
 *
 * Le slogan et les magasins ; à qui l'on fait confiance ; comment ça
 * marche ; les questions que l'on se pose. Puis le pied de page. Chaque
 * section répond à une question qu'un visiteur se pose vraiment, dans
 * l'ordre où elle lui vient.
 *
 * ═══ Ce qui a disparu ═══
 *
 * `PromoCards` (deux cartes qui redisaient le slogan), `AboutSection` (un
 * manifeste de six paragraphes), la frise photographique à six étapes, et
 * le bouton WhatsApp flottant. WhatsApp reste joignable depuis la FAQ et
 * le pied de page — deux endroits où l'on va quand on a une question, au
 * lieu d'une pastille qui suit le défilement.
 *
 * ═══ Pourquoi la langue vit ici ═══
 *
 * C'est le plus haut composant client de la page, donc le seul endroit
 * d'où l'état peut descendre à la fois vers l'en-tête — qui porte le
 * sélecteur — et vers les sections qui affichent les textes. Le remonter
 * plus haut ferait basculer le layout racine en composant client, et la
 * page cesserait d'être pré-calculée.
 */
export function HeroSection() {
  const [language, setLanguage] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-story-section]"),
    );

    chapters.forEach((chapter) => {
      chapter.dataset.storyVisible = "false";
    });
    root.classList.add("story-motion");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.storyVisible = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );

    chapters.forEach((chapter) => observer.observe(chapter));

    return () => {
      observer.disconnect();
      root.classList.remove("story-motion");
    };
  }, []);

  return (
    <>
      <HeroHeader
        copy={copy}
        language={language}
        onLanguageChange={setLanguage}
      />
      <Hero copy={copy.hero} stores={copy.stores} />
      <TrustedPartners copy={copy.partners} />
      <HowItWorks copy={copy.howItWorks} />
      <FaqSection copy={copy.faq} whatsapp={copy.whatsapp} />
      <HomeFooter
        copy={copy.footer}
        stores={copy.stores}
        whatsapp={copy.whatsapp}
      />
    </>
  );
}
