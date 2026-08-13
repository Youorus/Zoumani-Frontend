"use client";

import Link from "next/link";

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
          <ZoumaniLogo />
        </Link>

        <nav aria-label="Navigation" className="flex items-center gap-2">
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
                className="focus-ring rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
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
