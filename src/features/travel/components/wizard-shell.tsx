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
    <div className="-my-5 flex flex-col overflow-hidden sm:-my-10">
      <header className="shrink-0 border-b border-border/70 bg-surface/80 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-between gap-3">
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
            <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-primary sm:block">
              De la place qui rapproche
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
        </div>
      </header>

      <main className="relative flex-1 px-4 py-5 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -left-32 top-4 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-72 rounded-full bg-secondary/15 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_28px_80px_-48px_rgb(43_29_23_/_0.55)] lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="relative overflow-hidden bg-inverse-surface px-6 py-6 text-inverse-foreground sm:px-8 lg:min-h-[34rem] lg:py-9">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 15%, var(--primary) 0 2px, transparent 3px), linear-gradient(135deg, transparent 46%, var(--primary) 47% 48%, transparent 49%)",
                backgroundSize: "38px 38px, 76px 76px",
              }}
            />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <span className="inline-flex size-11 items-center justify-center rounded-full border border-primary/50 bg-primary/15 font-display text-xl text-primary">
                  {step}
                </span>
                <p className="mt-6 max-w-xs font-display text-2xl leading-tight sm:text-3xl">
                  Un voyage pour vous. Une vraie différence pour une famille.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-inverse-muted-foreground">
                  Zoumani vérifie votre trajet avant toute mise en relation. Vous gardez
                  la maîtrise de vos kilos, de ce que vous acceptez et de votre prix.
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-white/10 pt-5 text-xs text-inverse-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                Identité vérifiée · billet contrôlé · colis inspecté
              </div>
            </div>
          </aside>

          <section className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Votre prochain voyage
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {hint && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {hint}
              </p>
            )}
            <div className="mt-7">{children}</div>
          </section>
        </div>
      </main>

      {/* Collé au bas de la fenêtre : le bouton reste à portée de pouce
          même quand le contenu d'une étape dépasse un peu. */}
      <footer className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-background/92 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto w-full max-w-5xl space-y-2 lg:pl-[calc(36%+2.5rem)]">
          {footnote}
          <button
            type="button"
            onClick={cta.onClick}
            disabled={cta.disabled || cta.busy}
            className="focus-ring w-full rounded-xl bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground shadow-[0_14px_30px_-18px_var(--primary)] transition-[transform,opacity] hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
          >
            {cta.busy ? "…" : cta.label}
          </button>
        </div>
      </footer>
    </div>
  );
}
