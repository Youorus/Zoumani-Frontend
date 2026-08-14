"use client";

import { FileCheck2, Upload } from "lucide-react";
import { useId, useRef } from "react";

import type { ProofKind } from "../types/trip.types";

export const PROOF_KINDS: Record<ProofKind, { label: string; help: string }> = {
  boarding_pass: {
    label: "Carte d'embarquement",
    help: "La preuve la plus forte : elle confirme que vous êtes bien enregistré sur ce vol.",
  },
  e_ticket: {
    label: "Billet électronique",
    help: "Le billet nominatif émis par la compagnie aérienne ou votre agence.",
  },
  booking_confirmation: {
    label: "Confirmation de réservation",
    help: "Acceptée avant l'émission du billet, avec un contrôle manuel plus approfondi.",
  },
};

interface ProofPickerProps {
  kind: ProofKind;
  file: File | null;
  onKindChange: (kind: ProofKind) => void;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * Sélectionne un justificatif de voyage sans le téléverser.
 *
 * Le même composant sert à la création et au remplacement depuis la
 * fiche du voyage. Le moment de l'envoi reste la responsabilité du
 * parcours parent : choisir un fichier ne doit jamais créer de document
 * orphelin si la personne revient en arrière.
 */
export function ProofPicker({
  kind,
  file,
  onKindChange,
  onFileChange,
  disabled = false,
}: ProofPickerProps) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <fieldset disabled={disabled}>
        <legend className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Nature du justificatif
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(Object.keys(PROOF_KINDS) as ProofKind[]).map((value) => {
            const selected = value === kind;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => onKindChange(value)}
                className={`focus-ring rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <span className="block font-semibold">{PROOF_KINDS[value].label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {PROOF_KINDS[kind].help}
      </p>

      <input
        ref={input}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={disabled}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="sr-only"
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <FileCheck2 className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{file.name}</span>
            <span className="block text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
          </span>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={disabled}
            className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-primary"
          >
            Remplacer
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="focus-within:ring-primary/30 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/45 bg-primary/5 px-5 py-4 text-center transition-colors hover:bg-primary/10 focus-within:ring-2"
        >
          <Upload className="size-6 text-primary" aria-hidden />
          <span className="mt-2 text-sm font-bold">Ajouter mon justificatif</span>
          <span className="mt-1 text-xs text-muted-foreground">
            Photo nette ou PDF, toutes les informations doivent rester lisibles
          </span>
        </label>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_000_000) {
    return `${Math.max(1, Math.round(bytes / 1_000))} Ko`;
  }
  return `${(bytes / 1_000_000).toFixed(1)} Mo`;
}
