"use client";

import { Check, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { estimateInsurance } from "../api/payment-client";
import type { InsuranceOffer } from "../types/payment.types";

interface InsuranceStepProps {
  lines: { categoryCode: string; label: string }[];
  currency: string;
  selected: boolean;
  values: Record<string, string>;
  onSelectedChange: (selected: boolean) => void;
  onValuesChange: (values: Record<string, string>) => void;
}

export function InsuranceStep({
  lines,
  currency,
  selected,
  values,
  onSelectedChange,
  onValuesChange,
}: InsuranceStepProps) {
  const [offer, setOffer] = useState<InsuranceOffer | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const parsedValues = lines.map((line) => ({
    categoryCode: line.categoryCode,
    declaredValueMinor: Math.round(
      Number.parseFloat((values[line.categoryCode] ?? "").replace(",", ".")) * 100,
    ),
  }));
  const valuesAreValid = parsedValues.every(
    (line) => Number.isFinite(line.declaredValueMinor) && line.declaredValueMinor > 0,
  );
  const requestKey = selected && valuesAreValid ? JSON.stringify(parsedValues) : "";
  const currentDeclaredValueMinor = valuesAreValid
    ? parsedValues.reduce((total, line) => total + line.declaredValueMinor, 0)
    : null;
  const currentOffer =
    offer?.declaredValueMinor === currentDeclaredValueMinor ? offer : null;
  const loading = loadingKey === requestKey && requestKey !== "";

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      setLoadingKey(requestKey);
      void estimateInsurance(JSON.parse(requestKey), currency)
        .then((nextOffer) => active && setOffer(nextOffer))
        .catch(() => active && setOffer(null))
        .finally(() => active && setLoadingKey(null));
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [currency, requestKey]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_62%)] p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Ce qui compte mérite d&apos;être protégé.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              En cas de perte ou de dommage constaté, les photos, la valeur déclarée et
              les vérifications du parcours constituent votre dossier.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Choice
          title="Continuer sans protection"
          detail="Vous gardez les preuves du parcours, sans couverture financière ajoutée."
          active={!selected}
          onClick={() => onSelectedChange(false)}
        />
        <Choice
          title="Simuler ma protection"
          detail="Valeur couverte en cas de perte ou de dommage, selon les justificatifs."
          active={selected}
          highlighted
          onClick={() => onSelectedChange(true)}
        />
      </div>

      {selected && (
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <p className="text-sm font-semibold">Valeur de chaque contenu</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Indiquez son prix réel aujourd&apos;hui, justificatif à l&apos;appui si un
              incident survient.
            </p>
          </div>
          {lines.map((line) => (
            <label key={line.categoryCode} className="block">
              <span className="mb-1.5 block text-xs font-medium">{line.label}</span>
              <span className="flex items-center rounded-xl border border-border bg-background px-3 focus-within:border-primary">
                <input
                  inputMode="decimal"
                  value={values[line.categoryCode] ?? ""}
                  onChange={(event) =>
                    onValuesChange({ ...values, [line.categoryCode]: event.target.value })
                  }
                  placeholder="150,00"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                  aria-label={`Valeur de ${line.label}`}
                />
                <span className="text-sm text-muted-foreground">€</span>
              </span>
            </label>
          ))}

          {(loading || currentOffer) && (
            <div className="rounded-xl bg-inverse-surface p-4 text-inverse-foreground">
              {loading && !currentOffer ? (
                <p className="text-sm text-inverse-muted-foreground">Calcul de la protection…</p>
              ) : currentOffer ? (
                <>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-primary">
                        Prime simulée
                      </p>
                      <p className="mt-1 text-sm text-inverse-muted-foreground">
                        Jusqu&apos;à {(currentOffer.coverageMinor / 100).toFixed(2)} € déclarés
                      </p>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums">
                      {(currentOffer.premiumMinor / 100).toFixed(2)} €
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {currentOffer.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-2 text-xs text-inverse-muted-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-white/10 pt-3 text-[0.7rem] leading-relaxed text-inverse-muted-foreground">
                    {currentOffer.disclaimer}
                  </p>
                </>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" aria-hidden />
        La prime finale est toujours recalculée par Zoumani avant le paiement.
      </div>
    </div>
  );
}

function Choice({
  title,
  detail,
  active,
  highlighted,
  onClick,
}: {
  title: string;
  detail: string;
  active: boolean;
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/35"
      }`}
    >
      {highlighted && (
        <Sparkles className="absolute right-3 top-3 size-4 text-primary" aria-hidden />
      )}
      <span className="block pr-6 text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
        {detail}
      </span>
    </button>
  );
}
