import Link from "next/link";
import type { ReactNode } from "react";

import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { accountContent } from "@/features/account/content/account-content";
import type { AuthenticatedUser } from "@/lib/auth/auth.types";

import { accountLanguage } from "@/features/account/lib/account-language";
import type { VerificationStage } from "@/features/verification/types/verification.types";

import { AccountCopyProvider } from "./account-copy-provider";
import { AccountMenu } from "./account-menu";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";

/**
 * Le cadre de l'espace personnel : un en-tête, la page, un pied discret.
 *
 * ═══ Pourquoi si peu de choses ═══
 *
 * Une barre de navigation chargée oblige à choisir avant de savoir ce
 * qu'on cherche. Ici il n'y a que deux repères : la marque, qui ramène
 * toujours à l'accueil, et soi-même, qui ouvre tout le reste. Ce que la
 * personne vient faire — chercher un voyageur, proposer un trajet — est
 * dans la page, en grand, pas caché dans un menu.
 *
 * ═══ Le pied de page, réduit à ce qui sert ═══
 *
 * Dans un espace connecté, un pied de page riche est du bruit : personne
 * ne vient là pour lire la présentation de l'entreprise. On garde l'aide
 * et les textes légaux — les deux seules choses qu'on y cherche
 * réellement — et rien d'autre.
 */
export function AccountShell({
  user,
  stage,
  children,
}: {
  user: AuthenticatedUser;
  /**
   * Où en est la vérification d'identité.
   *
   * Lue **une fois** par le gabarit et transmise, plutôt que demandée
   * par chaque composant qui l'affiche. Le badge de l'avatar et l'entrée
   * du menu montrent la même chose : les laisser interroger l'API
   * chacun de leur côté produirait deux requêtes par page, et un instant
   * où les deux se contredisent.
   */
  stage: VerificationStage;
  children: ReactNode;
}) {
  const language = accountLanguage(user.preferredLanguage);
  const copy = accountContent[language];

  return (
    <AccountCopyProvider language={language}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-[var(--z-nav)] border-b border-border/70 bg-background/92 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1492px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="focus-ring rounded-xl"
              aria-label="Zoumani, accueil"
            >
              <ZoumaniLogo />
            </Link>

            {/* Deux repères, et deux seulement. Sur téléphone, chacun reste
                une cible d'au moins quarante pixels : c'est le minimum pour
                être atteint du pouce, en marchant, à bout de bras. */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Masquée sur les très petits écrans : trois cibles de
                  quarante pixels et un logo ne tiennent pas côte à côte
                  sur un téléphone étroit, et c'est le compte qui doit
                  rester atteignable. */}
              <span className="hidden sm:inline-flex">
                <ThemeToggle label={copy.theme} />
              </span>
              <NotificationBell />
              <AccountMenu user={user} stage={stage} />
            </div>
          </div>
        </header>

        <main className="flex-1 py-5 sm:py-10">{children}</main>

        <footer className="border-t border-border/70 py-4 sm:py-6">
          <div className="mx-auto flex w-full max-w-[1492px] flex-col-reverse gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-8 sm:text-sm lg:px-12">
            <p className="m-0">{copy.footer.rights}</p>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/#help" className="focus-ring rounded hover:text-foreground">
                {copy.footer.help}
              </Link>
              <Link href="/#help" className="focus-ring rounded hover:text-foreground">
                {copy.footer.terms}
              </Link>
              <Link href="/#help" className="focus-ring rounded hover:text-foreground">
                {copy.footer.privacy}
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </AccountCopyProvider>
  );
}
