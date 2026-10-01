"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";

import type { HomeContent, HomeLanguage } from "./home-content";
import styles from "./hero-header.module.css";
import { APP_STORE_URL } from "./hero/store-badges";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNavigation } from "./mobile-navigation";

/**
 * La barre de navigation de la page d'accueil.
 *
 * ═══ Elle vit sur deux fonds ═══
 *
 * En haut de page, elle est posée sur le hero sombre : ses textes sont
 * clairs, et elle n'a pas de fond. Dès qu'on descend, elle prend une
 * capsule crème translucide et repasse en sombre, pour rester lisible
 * sur les sections claires. Le seuil est bas (24 px) : au-delà, on voit
 * le changement d'état au milieu du geste.
 *
 * ═══ Le bouton est revenu, et il nomme sa destination ═══
 *
 * La barre a porté un « Rejoindre la liste » qui ne disait pas ce qu'on
 * rejoignait, puis plus rien. Depuis que l'application est publiée, il
 * y a une destination évidente : le magasin. « Télécharger » la nomme.
 */
interface HeroHeaderProps {
  copy: HomeContent;
  language: HomeLanguage;
  onLanguageChange: (language: HomeLanguage) => void;
}

export function HeroHeader({ copy, language, onLanguageChange }: HeroHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header
      className={styles.header}
      data-home-navigation=""
      data-scrolled={isScrolled ? "true" : "false"}
    >
      <div className={styles.shell}>
        <Link
          href="/"
          aria-label="Zoumani, accueil"
          className="focus-ring flex items-center gap-2.5 rounded-xl"
        >
          <SymboleZoumani largeur={48} />
          <ZoumaniLogo className={`text-[1.55rem] sm:text-[1.8rem] ${styles.wordmark}`} />
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {copy.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <div className={styles.language}>
            <LanguageSwitcher
              copy={copy.language}
              language={language}
              onLanguageChange={onLanguageChange}
              inverse={!isScrolled}
            />
          </div>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className={`focus-ring ${styles.cta}`}
            data-cta="header-store"
          >
            {copy.headerCta}
          </a>
          <MobileNavigation
            copy={copy}
            inverse={!isScrolled}
            language={language}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>
    </header>
  );
}
