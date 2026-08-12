"use client";

import type { ReactNode } from "react";

interface WizardShellProps {
  step: number;
  total: number;
  title: string;
  hint?: string;
  onBack?: () => void;
  children: ReactNode;
  /** Le seul appel à l'action de l'écran. */
  cta: { label: string; onClick: () => void; disabled?: boolean; busy?: boolean };
  footnote?: ReactNode;
}

/**
 * Le cadre commun à toutes les étapes du parcours.
 *
 * ═══ Pourquoi un cadre, et pas une longue page ═══
 *
 * Un formulaire qui défile demande de tenir en tête ce qu'on a déjà
 * rempli, ce qu'il reste, et où l'on en est. Découpé en écrans courts,
 * chacun pose **une** question : la charge mentale tombe, et l'abandon
 * avec elle.
 *
 * Trois constantes qui rendent le parcours lisible sans y penser :
 *
 * - **le retour est toujours au même endroit**, en haut à gauche, et il
 *   ne perd jamais la saisie ;
 * - **la progression est visible**, donc l'effort restant est connu —
 *   personne n'abandonne un parcours dont il voit la fin ;
 * - **un seul bouton principal**, ancré en bas, toujours à portée de
 *   pouce. Deux actions de même poids obligent à choisir, et choisir
 *   ralentit.
 *
 * Le contenu occupe la hauteur disponible sans la dépasser. C'est ce qui
 * évite le défilement que la version précédente imposait.
 */
export function WizardShell({
  step,
  total,
  title,
  hint,
  onBack,
  children,
  cta,
  footnote,
}: WizardShellProps) {
  return (
    // Pas de hauteur imposée : l'écran vit **dans** `AccountShell`, qui
    // porte déjà `min-h-screen`. Une seconde hauteur pleine créerait
    // deux zones défilantes emboîtées — précisément ce que ce découpage
    // en étapes courtes cherche à supprimer. Les marges verticales du
    // shell parent sont annulées pour que le pied de page colle au bas.
    <div className="-my-5 flex flex-col sm:-my-10">
      <header className="shrink-0 px-4 pt-4 sm:px-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Étape précédente"
                className="-ml-2 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                  aria-hidden
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            ) : (
              <span className="size-9" aria-hidden />
            )}
            <span className="text-sm text-muted-foreground">
              Étape {step} sur {total}
            </span>
          </div>

          {/* La progression est une barre et non des points : elle se lit
              d'un regard, sans compter. */}
          <div
            className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={total}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
          {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </main>

      {/* Collé au bas de la fenêtre : le bouton reste à portée de pouce
          même quand le contenu d'une étape dépasse un peu. */}
      <footer className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-background/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-lg space-y-2">
          {footnote}
          <button
            type="button"
            onClick={cta.onClick}
            disabled={cta.disabled || cta.busy}
            className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {cta.busy ? "…" : cta.label}
          </button>
        </div>
      </footer>
    </div>
  );
}
