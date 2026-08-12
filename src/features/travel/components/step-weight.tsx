"use client";

/**
 * Combien de kilos le voyageur libère.
 *
 * ═══ Les valeurs proposées d'abord, la saisie ensuite ═══
 *
 * Presque tout le monde répond 10, 23 ou 32 : ce sont les franchises
 * réelles des compagnies. Trois boutons répondent donc à la question en
 * un geste, et le champ libre reste là pour les autres. L'inverse — un
 * champ vide face à quelqu'un qui ne sait pas quoi mettre — est ce qui
 * fait abandonner.
 */

const SUGGESTIONS = [
  { kg: 10, libelle: "10 kg", detail: "Un bagage cabine" },
  { kg: 23, libelle: "23 kg", detail: "Une valise en soute" },
  { kg: 32, libelle: "32 kg", detail: "Une grande valise" },
];

interface StepWeightProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function StepWeight({ value, onChange, error }: StepWeightProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2.5">
        {SUGGESTIONS.map((suggestion) => {
          const choisi = value === String(suggestion.kg);
          return (
            <button
              key={suggestion.kg}
              type="button"
              onClick={() => onChange(String(suggestion.kg))}
              aria-pressed={choisi}
              className={`flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
                choisi
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/20"
              }`}
            >
              <span>
                <span className="block font-medium">{suggestion.libelle}</span>
                <span className="block text-sm text-muted-foreground">
                  {suggestion.detail}
                </span>
              </span>
              <span
                aria-hidden
                className={`flex size-5 items-center justify-center rounded-full border-2 ${
                  choisi ? "border-primary bg-primary" : "border-muted-foreground/30"
                }`}
              >
                {choisi && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    className="size-3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
        <label htmlFor="weight-libre" className="shrink-0 text-sm text-muted-foreground">
          Autre
        </label>
        <input
          id="weight-libre"
          inputMode="decimal"
          value={SUGGESTIONS.some((s) => String(s.kg) === value) ? "" : value}
          placeholder="18,5"
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-right text-lg font-medium outline-none"
        />
        <span className="shrink-0 text-muted-foreground">kg</span>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
