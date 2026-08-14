"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

import { ZoumaniLogo } from "@/components/shared/zoumani-logo";

interface SiteHeaderProps {
  /** Vrai quand la personne a une session ouverte. */
  connected: boolean;
}

/**
 * L'en-tête des pages internes.
 *
 * ═══ Pourquoi pas celui de l'accueil ═══
 *
 * Celui de la page d'accueil est `position: fixed`, avec un logo blanc :
 * il est fait pour flotter au-dessus de la photo du hero. Employé sur
 * une page à fond clair, le logo devient invisible et le contenu passe
 * dessous — c'est un en-tête d'accueil, pas un en-tête de site.
 *
 * Celui-ci reste dans le flux, sur un fond opaque, et se contente de ce
 * qu'une page interne demande : revenir chez soi, et savoir où l'on est.
 */
export function SiteHeader({ connected }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1492px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Zoumani, accueil" className="focus-ring rounded-xl">
          <ZoumaniLogo className="text-[1.8rem] sm:text-[2.4rem]" />
        </Link>

        <nav aria-label="Navigation" className="flex items-center gap-1.5 sm:gap-2">
          {connected ? (
            <>
              <Link
                href="/trips/nouveau"
                className="focus-ring hidden rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Proposer un voyage
              </Link>
              <Link
                href="/compte"
                className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Mon espace
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="focus-ring grid size-10 place-items-center rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex sm:size-auto sm:px-3 sm:py-2"
              >
                <LogIn className="size-4 sm:hidden" aria-hidden />
                <span className="sr-only sm:not-sr-only">Se connecter</span>
              </Link>
              <Link
                href="/signup"
                className="focus-ring whitespace-nowrap rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground sm:px-4 sm:text-sm"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
