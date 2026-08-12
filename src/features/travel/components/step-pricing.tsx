"use client";

import type { ParcelCategory } from "../types/travel.types";

interface StepPricingProps {
  categories: ParcelCategory[];
  prices: Record<string, string>;
  remembered: string[];
  onChange: (code: string, value: string) => void;
  errors: Record<string, string>;
}

/**
 * Le tarif de chaque catégorie retenue.
 *
 * ═══ Seulement ce qui a été choisi ═══
 *
 * L'écran ne montre que les catégories cochées à l'étape précédente.
 * Mêler la sélection et la tarification obligeait à faire deux choses à
 * la fois sur une même ligne — cocher, puis chiffrer — et c'est
 * exactement ce qui rendait la page longue et confuse.
 *
 * ═══ Des tarifs proposés, pas un champ vide ═══
 *
 * « Combien vaut un kilo de vêtements Paris–Douala ? » n'a pas de
 * réponse évidente pour quelqu'un qui publie son premier voyage. Trois
 * montants usuels répondent à sa place, en un geste ; le champ reste
 * ouvert pour qui a son idée.
 *
 * Les tarifs du voyage précédent arrivent déjà remplis et le sont
 * **signalés** : sans mention, on ne sait pas si un chiffre vient de soi
 * ou du système, et l'on hésite à le corriger.
 */

/** Montants usuels, en euros. Au kilo, puis à la pièce. */
const SUGGESTIONS: Record<ParcelCategory["unit"], string[]> = {
  kilogram: ["6", "8", "12"],
  piece: ["10", "20", "35"],
};

export function StepPricing({
  categories,
  prices,
  remembered,
  onChange,
  errors,
}: StepPricingProps) {
  return (
    <div className="space-y-3">
      {remembered.length > 0 && (
        <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          Vos tarifs du voyage précédent sont repris. Modifiez-les librement.
        </p>
      )}

      {categories.map((category) => {
        const valeur = prices[category.code] ?? "";
        const suggestions = SUGGESTIONS[category.unit];
        const repris = remembered.includes(category.code);

        return (
          <div key={category.code} className="rounded-xl border border-border p-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{category.label}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {category.unit === "piece" ? "par pièce" : "par kilo"}
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              {suggestions.map((montant) => {
                const actif = valeur === montant;
                return (
                  <button
                    key={montant}
                    type="button"
                    onClick={() => onChange(category.code, montant)}
                    aria-pressed={actif}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                      actif
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    {montant} €
                  </button>
                );
              })}
              <div
                className={`flex w-[5.5rem] shrink-0 items-center gap-1 rounded-lg border px-2.5 py-2 ${
                  errors[category.code] ? "border-destructive" : "border-border"
                }`}
              >
                <input
                  inputMode="decimal"
                  aria-label={`Tarif pour ${category.label}`}
                  value={suggestions.includes(valeur) ? "" : valeur}
                  placeholder="Autre"
                  onChange={(event) => onChange(category.code, event.target.value)}
                  className="w-full min-w-0 bg-transparent text-right text-sm outline-none"
                />
                <span className="text-sm text-muted-foreground">€</span>
              </div>
            </div>

            {repris && (
              <p className="mt-2 text-xs text-muted-foreground">
                Repris de votre dernier voyage
              </p>
            )}
            {errors[category.code] && (
              <p className="mt-2 text-xs text-destructive">{errors[category.code]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
