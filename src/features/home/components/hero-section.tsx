"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import { HeroHeader } from "./hero-header";
import { HeroScenePlaceholder } from "./hero-scene-placeholder";
import { HomeFooter } from "./footer/home-footer";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { HowItWorks } from "./how-it-works/how-it-works";
import { homeContent } from "./home-content";
import type { HomeLanguage } from "./home-content";
import styles from "./home-hero.module.css";
import { KentePattern } from "./kente-pattern";
import { AboutSection } from "./about/about-section";
import { PromoCards } from "./promo-cards";
import { ShipmentSearch } from "./shipment-search";
import { SocialProof } from "./social-proof";
import { TrustCard } from "./trust-card";
import { TrustedPartners } from "./trusted-partners";

interface HeroSectionProps {
  backgroundImageUrl?: string;
}

type HeroStyle = CSSProperties & {
  "--hero-background-image"?: string;
};

export function HeroSection({ backgroundImageUrl }: HeroSectionProps) {
  const [language, setLanguage] = useState<HomeLanguage>("fr");
  const copy = homeContent[language];
  const heroStyle: HeroStyle | undefined = backgroundImageUrl
    ? { "--hero-background-image": `url("${backgroundImageUrl}")` }
    : undefined;

  return (
    <>
      <HeroHeader copy={copy} language={language} onLanguageChange={setLanguage} />
      <section
        className={`${styles.hero} min-h-[auto] rounded-b-[1.1rem] pb-8 text-inverse-foreground lg:min-h-[730px] lg:pb-0`}
        style={heroStyle}
      >
        <div className={styles.heroBackground} />
        {!backgroundImageUrl ? <HeroScenePlaceholder /> : null}
        <KentePattern />
        <TrustCard copy={copy.trustCard} />

        <div
          className={`${styles.heroContent} relative z-20 mx-auto w-full max-w-[1536px]`}
        >
          <div className={`${styles.contentReveal} ${styles.heroCopy} max-w-[560px]`}>
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-rating uppercase sm:text-base">
              <span className="h-1 w-6 rounded-full bg-rating" aria-hidden="true" />
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-5 font-sans text-[2.75rem] leading-[1.02] font-black tracking-[-0.045em] text-inverse-foreground sm:text-[3.5rem]">
              {copy.hero.titleLineOne}
              <br />
              {copy.hero.titleLineTwoPrefix}
              <span className="text-rating">
                {copy.hero.titleHighlightOne}
                <br />
                {copy.hero.titleHighlightTwo}
              </span>
              {copy.hero.titleSuffix}
            </h1>
            <p className="mt-5 max-w-[500px] text-base leading-7 text-inverse-foreground sm:text-lg">
              {copy.hero.description}
            </p>
            <div className="mt-4">
              <SocialProof copy={copy.socialProof} />
            </div>
          </div>
        </div>

        <ShipmentSearch
          className={`${styles.searchReveal} mt-9 lg:absolute lg:inset-x-0 lg:bottom-11 lg:mt-0`}
          copy={copy.search}
          language={language}
        />
      </section>

      <div className="bg-marketing-page">
        <PromoCards copy={copy.promos} language={language} />
        <TrustedPartners copy={copy.partners} />
        <HowItWorks copy={copy.howItWorks} language={language} />
        <AboutSection copy={copy.about} />
        <HomeFooter copy={copy.footer} language={language} whatsapp={copy.whatsapp} />
      </div>
      <FloatingWhatsApp copy={copy.whatsapp} />
    </>
  );
}
