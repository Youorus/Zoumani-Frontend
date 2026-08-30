"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import type { HomeContent } from "./home-content";

// `language` n'est plus nécessaire : le bouton d'action prend ses deux
// libellés du contenu déjà traduit, et choisit sa destination selon la
// session plutôt que selon la langue.
export function MobileNavigation({ copy }: { copy: HomeContent }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="focus-ring grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerTitle className="font-sans text-2xl font-bold text-foreground">
          {copy.mobileMenu.title}
        </DrawerTitle>
        <DrawerDescription className="mt-1 text-sm text-muted-foreground">
          {copy.mobileMenu.description}
        </DrawerDescription>
        <nav
          aria-label="Navigation mobile"
          className="mt-8 flex flex-col gap-1"
        >
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

        <div className="mt-auto grid gap-3 pt-8">
          <Button asChild className="w-full">
            <Link href="/preinscription" data-cta="mobile-menu">
              {copy.downloadCta}
            </Link>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
