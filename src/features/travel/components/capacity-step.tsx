"use client";

import { useEffect, useState } from "react";

import { fetchCatalog, fetchLastPrices } from "../api/travel-client";
import { AttestationField } from "./attestation-field";
import {
  fromMinorUnits,
  toMinorUnits,
  type Catalog,
  type ParcelCategory,
} from "../types/travel.types";

export interface CapacitySelection {
  /** Version du texte d'engagement affiché au voyageur. */
  attestationVersion: string;
  totalWeightKg: number;
  currency: string;
  offers: { categoryCode: string; priceMinor: number }[];
  notes: string | null;
}

interface CapacityStepProps {
  onSubmit: (selection: CapacitySelection) => void;
  isSubmitting?: boolean;
}

const DEVISE = "EUR";

/**
 * Le choix des catégories et de leur tarif.
 *
 * ═══ La mémoire des prix ═══
 *
 * Au montage, on demande les tarifs pratiqués la fois précédente et l'on
 * pré-remplit les champs. **Pré-remplir, pas décider** : rien n'est
 * envoyé tant que le voyageur n'a pas validé, et chaque prix se change
 * en une frappe. Un premier voyage rend une liste vide — ce n'est pas une
 * erreur, et rien n'est signalé.
 *
 * ═══ Le consentement n'est jamais pré-coché ═══
 *
 * Les catégories qui engagent — médicaments, électronique — arrivent
 * décochées et affichent leurs conditions. Une case cochée d'avance est
 * une signature obtenue sans information : sans valeur pour le voyageur,
 * et sans valeur devant un juge.
 */
export function CapacityStep({ onSubmit, isSubmitting = false }: CapacityStepProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [remembered, setRemembered] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attestation, setAttestation] = useState<{ accepted: boolean; version: string }>({
    accepted: false,
    version: "",
  });

  useEffect(() => {
    let vivant = true;

    void Promise.all([fetchCatalog(), fetchLastPrices().catch(() => [])]).then(
      ([catalogue, derniers]) => {
        if (!vivant) {
          return;
        }
        setCatalog(catalogue);

        // On ne reporte que les catégories encore au catalogue : une
        // catégorie retirée depuis le dernier voyage ne doit pas
        // réapparaître par la porte de la mémoire.
        const connues = new Set(catalogue.categories.map((c) => c.code));
        const reportes: Record<string, string> = {};
        for (const offre of derniers) {
          if (connues.has(offre.categoryCode)) {
            reportes[offre.categoryCode] = fromMinorUnits(offre.priceMinor);
          }
        }
        setSelected(reportes);
        setRemembered(Object.keys(reportes));
      },
    );

    return () => {
      vivant = false;
    };
  }, []);

  function toggle(category: ParcelCategory) {
    setSelected((courant) => {
      const suivant = { ...courant };
      if (category.code in suivant) {
        delete suivant[category.code];
      } else {
        suivant[category.code] = "";
      }
      return suivant;
    });
  }

  function valider() {
    const trouves: Record<string, string> = {};
    const poids = Number.parseFloat(weight.replace(",", "."));

    if (!Number.isFinite(poids) || poids <= 0 || poids > 64) {
      trouves.weight = "Indiquez un poids entre 0,5 et 64 kg.";
    }
    const codes = Object.keys(selected);
    if (codes.length === 0) {
      trouves.categories = "Choisissez au moins une catégorie.";
    }

    if (!attestation.accepted || !attestation.version) {
      trouves.attestation = "Confirmez votre engagement pour continuer.";
    }

    const offers: { categoryCode: string; priceMinor: number }[] = [];
    for (const code of codes) {
      const minor = toMinorUnits(selected[code] ?? "");
      if (minor === null || minor < 1) {
        trouves[code] = "Indiquez un tarif.";
      } else {
        offers.push({ categoryCode: code, priceMinor: minor });
      }
    }

    setErrors(trouves);
    if (Object.keys(trouves).length > 0) {
      return;
    }
    onSubmit({
      totalWeightKg: poids,
      currency: DEVISE,
      offers,
      notes: notes.trim() || null,
      attestationVersion: attestation.version,
    });
  }

  if (!catalog) {
    return <p className="text-sm text-muted-foreground">Chargement du catalogue…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="weight">
          Poids disponible dans vos bagages (kg)
        </label>
        <input
          id="weight"
          inputMode="decimal"
          value={weight}
          placeholder="23"
          onChange={(event) => setWeight(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
        />
        {errors.weight && (
          <p className="mt-1 text-sm text-destructive">{errors.weight}</p>
        )}
      </div>

      {remembered.length > 0 && (
        <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          Vos tarifs du voyage précédent ont été repris. Modifiez-les librement.
        </p>
      )}

      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-medium">
          Ce que vous acceptez de transporter
        </legend>
        {errors.categories && (
          <p className="text-sm text-destructive">{errors.categories}</p>
        )}

        {catalog.categories.map((category) => {
          const choisie = category.code in selected;
          return (
            <div
              key={category.code}
              className="rounded-lg border border-border p-3 transition-colors"
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={choisie}
                  onChange={() => toggle(category)}
                  className="mt-1 size-4"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{category.label}</span>
                  {category.restrictions.length > 0 && (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {category.restrictions.map(libelleRestriction).join(" · ")}
                    </span>
                  )}
                  {category.requiresTravelerConsent && (
                    <span className="mt-1 block text-xs font-medium text-amber-600 dark:text-amber-400">
                      Cette catégorie vous engage : lisez les conditions avant
                      d&apos;accepter.
                    </span>
                  )}
                </span>
              </label>

              {choisie && (
                <div className="mt-3 flex items-center gap-2 pl-7">
                  <input
                    inputMode="decimal"
                    value={selected[category.code] ?? ""}
                    placeholder="8,50"
                    onChange={(event) =>
                      setSelected((courant) => ({
                        ...courant,
                        [category.code]: event.target.value,
                      }))
                    }
                    className="w-28 rounded-lg border border-border bg-background px-3 py-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    € {category.unit === "piece" ? "par pièce" : "par kilo"}
                  </span>
                </div>
              )}
              {errors[category.code] && (
                <p className="mt-1 pl-7 text-sm text-destructive">
                  {errors[category.code]}
                </p>
              )}
            </div>
          );
        })}
      </fieldset>

      <details className="rounded-lg border border-border p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Ce qui ne voyage jamais
        </summary>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {catalog.prohibited.map((interdit) => (
            <li key={interdit}>· {interdit}</li>
          ))}
        </ul>
      </details>

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">
          Précisions (facultatif)
        </label>
        <textarea
          id="notes"
          value={notes}
          rows={3}
          maxLength={500}
          placeholder="Point de remise, horaires…"
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
        />
      </div>

      <AttestationField
        accepted={attestation.accepted}
        onChange={(accepted, version) => setAttestation({ accepted, version })}
      />
      {errors.attestation && (
        <p className="text-sm text-destructive">{errors.attestation}</p>
      )}

      <button
        type="button"
        onClick={valider}
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
      >
        {isSubmitting ? "Enregistrement…" : "Enregistrer mon offre"}
      </button>
    </div>
  );
}

/** Traduit un code de restriction. Le serveur rend le code, pas la phrase. */
function libelleRestriction(code: string): string {
  const libelles: Record<string, string> = {
    value_declaration: "valeur à déclarer",
    sealed_packaging: "emballage scellé",
    prescription: "ordonnance exigée",
    open_inspection: "colis ouvert à l'inspection",
    cabin_only: "cabine uniquement",
  };
  return libelles[code] ?? code;
}
