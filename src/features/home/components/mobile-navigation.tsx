"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils/cn";

import type { HomeContent, HomeLanguage } from "./home-content";
import { StoreBadges } from "./hero/store-badges";
import { LanguageSwitcher } from "./language-switcher";

export function MobileNavigation({
  copy,
  inverse = false,
  language,
  onLanguageChange,
}: {
  copy: HomeContent;
  inverse?: boolean;
  language: HomeLanguage;
  onLanguageChange: (language: HomeLanguage) => void;
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "focus-ring grid size-11 place-items-center rounded-full transition-colors lg:hidden",
            inverse ? "text-inverse-foreground hover:bg-hero-glass" : "text-foreground hover:bg-muted",
          )}
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerTitle className="font-display text-3xl font-medium text-foreground">
          {copy.mobileMenu.title}
        </DrawerTitle>
        <DrawerDescription className="mt-1 text-sm text-muted-foreground">
          {copy.mobileMenu.description}
        </DrawerDescription>
        <nav aria-label="Navigation mobile" className="mt-8 flex flex-col gap-1">
          {copy.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-xl px-3 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Le magasin, depuis le menu aussi : c'est la destination que
            quelqu'un qui ouvre le menu cherche le plus souvent. */}
        <div className="mt-auto flex flex-col gap-5 border-t border-border pt-6">
          {/* La langue vit ici sur un téléphone : la barre n'a plus la place. */}
          <LanguageSwitcher
            copy={copy.language}
            language={language}
            onLanguageChange={onLanguageChange}
          />
          <StoreBadges copy={copy.stores} stack cta="menu" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
