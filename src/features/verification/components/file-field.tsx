"use client";

import { Check, Upload } from "lucide-react";
import { useId, useState } from "react";

/**
 * Le choix d'un fichier, rendu utilisable.
 *
 * ═══ Pourquoi ne pas se contenter d'un `<input type="file">` ═══
 *
 * Le champ natif affiche « Aucun fichier sélectionné » dans la langue du
 * navigateur, pas dans celle du site, et son bouton n'est pas stylable.
 * Sur un téléphone, il est aussi minuscule. On le garde — c'est lui qui
 * fait le travail et qui porte l'accessibilité — mais on le rend
 * invisible et on habille son étiquette : cliquer sur l'étiquette d'un
 * champ de fichier ouvre le sélecteur, sans une ligne de JavaScript.
 *
 * ═══ Ce que voit quelqu'un qui a choisi un fichier ═══
 *
 * Son nom, et une coche. Sans retour visible, on reclique, on choisit
 * deux fois, on doute d'avoir réussi — et sur un formulaire où l'on est
 * déjà mal à l'aise, ce doute suffit à faire abandonner.
 */
export function FileField({
  label,
  hint,
  chooseLabel,
  accept = "image/*,application/pdf",
  required,
  onChange,
}: {
  label: string;
  hint?: string;
  chooseLabel: string;
  accept?: string;
  required?: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();
  const [name, setName] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {hint ? <span className="mb-2 block text-xs opacity-70">{hint}</span> : null}

      <label
        htmlFor={inputId}
        className="focus-within:ring-primary/30 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 transition-colors hover:bg-muted focus-within:ring-2"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {name ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{name ?? chooseLabel}</span>
        <input
          id={inputId}
          type="file"
          accept={accept}
          required={required}
          // `sr-only` et non `display:none` : un champ masqué par
          // `display` sort de l'ordre de tabulation, et le formulaire
          // devient impossible à remplir au clavier.
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setName(file?.name ?? null);
            onChange(file);
          }}
        />
      </label>
    </div>
  );
}
