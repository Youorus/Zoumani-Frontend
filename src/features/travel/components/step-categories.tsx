"use client";

import type { ParcelCategory } from "../types/travel.types";

interface StepCategoriesProps {
  categories: ParcelCategory[];
  prohibited: string[];
  selected: string[];
  onToggle: (code: string) => void;
  error?: string;
}

/**
 * Ce que le voyageur accepte de transporter.
 *
 * ═══ Une grille, pas une liste ═══
 *
 * Dix catégories empilées avec leurs conditions faisaient une page
 * entière à faire défiler, et chaque ligne demandait d'être lue avant
 * d'être cochée. En grille de deux colonnes, les dix tiennent d'un
 * regard : on choisit par reconnaissance plutôt que par lecture.
 *
 * Les conditions n'y figurent donc plus — sauf **l'avertissement** des
 * catégories qui engagent, qui reste visible parce qu'il change la
 * décision. Le détail complet revient à l'écran de récapitulatif, au
 * moment où l'on s'engage vraiment.
 */
export function StepCategories({
  categories,
  prohibited,
  selected,
  onToggle,
  error,
}: StepCategoriesProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((category) => {
          const choisie = selected.includes(category.code);
          return (
            <button
              key={category.code}
              type="button"
              onClick={() => onToggle(category.code)}
              aria-pressed={choisie}
              className={`relative flex min-h-[5.5rem] flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                choisie
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <span className="pr-6 text-sm font-medium leading-snug">
                {category.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {category.unit === "piece" ? "à la pièce" : "au kilo"}
                {category.requiresTravelerConsent && (
                  <span className="ml-1 text-amber-600 dark:text-amber-400">
                    · conditions
                  </span>
                )}
              </span>
              {choisie && (
                <span
                  aria-hidden
                  className="absolute right-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    className="size-3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <details className="rounded-xl border border-border px-4 py-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Ce qui ne voyage jamais
        </summary>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {prohibited.map((interdit) => (
            <li key={interdit}>· {interdit}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
