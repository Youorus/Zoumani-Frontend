"use client";

import { useEffect, useState } from "react";

import { Audiences } from "./audiences/audiences";
import { DownloadBand } from "./download/download-band";
import { FaqSection } from "./faq/faq-section";
import { HomeFooter } from "./footer/home-footer";
import { Hero } from "./hero/hero";
import { HeroHeader } from "./hero-header";
import { homeContent } from "./home-content";
import type { HomeLanguage } from "./home-content";
import { HowItWorks } from "./how-it-works/how-it-works";
import { NetworkSection } from "./network/network-section";
import { ReachSection } from "./reach/reach-section";
import { SignalsStrip } from "./proof/signals-strip";
import { TrustedPartners } from "./trusted-partners";

/**
 * La page d'accueil, assemblée.
 *
 * ═══ L'ordre raconte une histoire ═══
 *
 * La promesse et l'application (hero) ; les chiffres qui disent qu'on
 * joue déjà ; les réseaux qu'on emprunte ; à qui l'on parle, un chapitre par public (expéditeur,
 * voyageur, entreprise) ; comment ça marche ; avec qui le colis avance
 * (réseau) ; les questions ; le dernier appel à télécharger ; le pied.
 *
 * C'est l'ordre dans lequel un visiteur se pose les questions : est-ce
 * pour moi, est-ce sûr, comment, avec qui, et maintenant quoi.
 *
 * ═══ Pourquoi la langue vit ici ═══
 *
 * C'est le plus haut composant client de la page, donc le seul endroit
 * d'où l'état peut descendre à la fois vers l'en-tête — qui porte le
 * sélecteur — et vers les sections. Le remonter plus haut ferait
 * basculer le layout racine en composant client, et la page cesserait
 * d'être pré-calculée. Les sections elles-mêmes sont rendues par le
 * serveur : le HTML servi contient tout le texte français.
 */
export function HeroSection() {
  const [language, setLanguage] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-story-section]"));

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
      { rootMargin: "0px 0px -8%", threshold: 0.06 },
    );

    chapters.forEach((chapter) => observer.observe(chapter));

    return () => {
      observer.disconnect();
      root.classList.remove("story-motion");
    };
  }, []);

  return (
    <>
      <HeroHeader copy={copy} language={language} onLanguageChange={setLanguage} />
      <Hero copy={copy.hero} stores={copy.stores} whatsapp={copy.whatsapp} />
      <SignalsStrip copy={copy.signals} />
      <TrustedPartners copy={copy.partners} />
      <ReachSection copy={copy.reach} />
      <Audiences copy={copy.audiences} stores={copy.stores} whatsapp={copy.whatsapp} />
      <HowItWorks copy={copy.howItWorks} />
      <NetworkSection copy={copy.network} />
      <FaqSection copy={copy.faq} whatsapp={copy.whatsapp} />
      <DownloadBand copy={copy.download} stores={copy.stores} />
      <HomeFooter copy={copy.footer} stores={copy.stores} whatsapp={copy.whatsapp} />
    </>
  );
}
