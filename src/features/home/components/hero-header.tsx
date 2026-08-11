"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { AccountCta } from "@/features/auth/components/account-cta";

import type { HomeContent, HomeLanguage } from "./home-content";
import styles from "./hero-header.module.css";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNavigation } from "./mobile-navigation";

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
        <Link href="/" aria-label="Zoumani, accueil" className="focus-ring rounded-xl">
          <ZoumaniLogo inverse />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-8 xl:flex">
          {copy.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} focus-ring rounded-lg px-1 py-2 text-sm font-semibold whitespace-nowrap text-navigation-foreground transition-colors hover:text-primary`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 xl:gap-3">
          <LanguageSwitcher
            copy={copy.language}
            inverse
            language={language}
            onLanguageChange={onLanguageChange}
          />
          <div className="hidden xl:block">
            <AccountCta
              className="px-7"
              label={copy.travelerCta}
              spaceLabel={copy.spaceCta}
            />
          </div>
          <MobileNavigation copy={copy} />
        </div>
      </div>
    </header>
  );
}
