"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";

import type { HomeContent, HomeLanguage } from "./home-content";
import styles from "./hero-header.module.css";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNavigation } from "./mobile-navigation";

/**
 * La barre de navigation de la page d'accueil.
 *
 * ═══ Le logo complet, symbole et mot ═══
 *
 * Le symbole seul ne se lit pas encore — la marque est trop jeune pour
 * qu'on la reconnaisse à sa forme. Le mot seul n'a pas d'accroche. Les
 * deux ensemble, c'est le verrou de marque de la charte, et c'est ce que
 * porte aussi l'application mobile.
 *
 * ═══ Elle s'opacifie au défilement ═══
 *
 * Posée sur le hero clair, elle est transparente en haut de page ; dès
 * qu'on descend, elle prend un fond pour rester lisible sur les sections
 * suivantes. Le seuil est bas (24 px) : au-delà, on voit passer un
 * changement d'état au milieu du geste.
 */
interface HeroHeaderProps {
  copy: HomeContent;
  language: HomeLanguage;
  onLanguageChange: (language: HomeLanguage) => void;
}

export function HeroHeader({
  copy,
  language,
  onLanguageChange,
}: HeroHeaderProps) {
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
          <SymboleZoumani largeur={52} />
          <ZoumaniLogo className="text-[1.7rem] sm:text-[2rem]" />
        </Link>

        <nav className={styles.nav} aria-label="Navigation principale">
          {copy.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher
            copy={copy.language}
            language={language}
            onLanguageChange={onLanguageChange}
          />
          <div className="hidden xl:block">
            <Button asChild className="gap-2 px-6">
              <a href="#telecharger">
                <Download className="size-5" />
                {copy.downloadCta}
              </a>
            </Button>
          </div>
          <MobileNavigation copy={copy} />
        </div>
      </div>
    </header>
  );
}
