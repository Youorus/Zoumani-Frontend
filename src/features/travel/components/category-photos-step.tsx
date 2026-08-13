"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Trash2, X } from "lucide-react";

import { compressImage } from "@/lib/images/compress";

/** Trois angles au minimum : une seule photo cadre ce qu'on veut montrer. */
export const MIN_PHOTOS = 3;
/** Au-delà, on ne regarde plus, et l'envoi devient long. */
export const MAX_PHOTOS = 12;

export interface CategoryPhotos {
  files: File[];
  note: string;
}

interface CategoryPhotosStepProps {
  categoryLabel: string;
  /** Rang de cette catégorie, pour situer l'effort restant. */
  index: number;
  total: number;
  value: CategoryPhotos;
  onChange: (value: CategoryPhotos) => void;
}

/**
 * Les photos d'**une** catégorie, sur son propre écran.
 *
 * ═══ Un écran par catégorie ═══
 *
 * Tout demander d'un coup produisait une page où l'on ne savait plus
 * quelle photo documentait quoi. Séparés, chaque écran pose une question
 * simple — « montrez-moi vos vêtements » — et l'on sait toujours ce
 * qu'on photographie.
 *
 * ═══ Trois angles, pas trois clics ═══
 *
 * L'écran demande explicitement des angles différents, et le dit dans
 * les intitulés des emplacements vides. Trois photos du même côté ne
 * prouvent rien de plus qu'une seule ; c'est le volume, l'état et le
 * conditionnement qu'on veut voir.
 *
 * ═══ Les images sont réduites avant l'envoi ═══
 *
 * Une photo de téléphone pèse plusieurs mégaoctets. Douze d'entre elles
 * sur une connexion mobile prendraient plusieurs minutes — et le coût
 * est dans le téléversement, pas dans le stockage.
 */
export function CategoryPhotosStep({
  categoryLabel,
  index,
  total,
  value,
  onChange,
}: CategoryPhotosStepProps) {
  const [agrandie, setAgrandie] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Dérivés des fichiers, jamais stockés : les mettre dans un état
  // obligerait à les recalculer depuis un effet, ce qui ajoute un rendu
  // pour une valeur déjà connue.
  const apercus = useMemo(
    () => value.files.map((file) => URL.createObjectURL(file)),
    [value.files],
  );

  // Libérés quand ils changent : sans révocation, chaque photo choisie
  // fuit en mémoire jusqu'au rechargement de la page.
  useEffect(
    () => () => {
      for (const url of apercus) {
        URL.revokeObjectURL(url);
      }
    },
    [apercus],
  );

  async function ajouter(files: FileList) {
    setBusy(true);
    try {
      const place = MAX_PHOTOS - value.files.length;
      const retenus = [...files].slice(0, place);
      const reduits = await Promise.all(
        retenus.map(async (file) => (await compressImage(file)).file),
      );
      onChange({ ...value, files: [...value.files, ...reduits] });
    } finally {
      setBusy(false);
      if (input.current) {
        input.current.value = "";
      }
    }
  }

  function retirer(rang: number) {
    onChange({ ...value, files: value.files.filter((_, i) => i !== rang) });
  }

  const manquantes = Math.max(0, MIN_PHOTOS - value.files.length);
  const emplacements = ["De face", "De côté", "Ouvert ou déballé"];

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Contenu {index + 1} sur {total}
        </p>
        <h2 className="mt-0.5 font-display text-xl text-foreground">{categoryLabel}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {manquantes > 0
            ? `Encore ${manquantes} photo${manquantes > 1 ? "s" : ""} — prenez des angles différents.`
            : `${value.files.length} photo${value.files.length > 1 ? "s" : ""}. Vous pouvez en ajouter jusqu'à ${MAX_PHOTOS}.`}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {apercus.map((url, rang) => (
          <figure key={url} className="group relative aspect-square">
            <button
              type="button"
              onClick={() => setAgrandie(rang)}
              className="size-full overflow-hidden rounded-xl border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${categoryLabel}, photo ${rang + 1}`}
                className="size-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => retirer(rang)}
              aria-label={`Retirer la photo ${rang + 1}`}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-error"
            >
              <Trash2 className="size-3.5" />
            </button>
            {rang === 0 && (
              <figcaption className="absolute bottom-1.5 left-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[0.65rem] font-medium">
                Principale
              </figcaption>
            )}
          </figure>
        ))}

        {/* Les emplacements vides nomment l'angle attendu : « De côté »
            obtient une autre photo, quand un cadre vide obtient la même
            prise trois fois. */}
        {value.files.length < MAX_PHOTOS &&
          emplacements.slice(value.files.length, MIN_PHOTOS).map((libelle) => (
            <button
              key={libelle}
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <Camera className="size-5" aria-hidden />
              <span className="px-1 text-center text-xs">{libelle}</span>
            </button>
          ))}

        {value.files.length >= MIN_PHOTOS && value.files.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Camera className="size-5" aria-hidden />
            <span className="text-xs">Ajouter</span>
          </button>
        )}
      </div>

      {busy && <p className="text-xs text-muted-foreground">Préparation des images…</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        aria-label={`Photos de ${categoryLabel}`}
        onChange={(event) => {
          if (event.target.files?.length) {
            void ajouter(event.target.files);
          }
        }}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor={`note-${index}`}>
          Précisions{" "}
          <span className="font-normal text-muted-foreground">(facultatif)</span>
        </label>
        <textarea
          id={`note-${index}`}
          rows={2}
          maxLength={300}
          value={value.note}
          placeholder="Marque, taille, fragilité — ce que la photo ne montre pas."
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
        />
      </div>

      {agrandie !== null && apercus[agrandie] && (
        <Visualiseur
          url={apercus[agrandie]}
          legende={`${categoryLabel} — photo ${agrandie + 1} sur ${apercus.length}`}
          onClose={() => setAgrandie(null)}
          onPrev={agrandie > 0 ? () => setAgrandie(agrandie - 1) : undefined}
          onNext={
            agrandie < apercus.length - 1 ? () => setAgrandie(agrandie + 1) : undefined
          }
        />
      )}
    </div>
  );
}

/**
 * L'agrandissement d'une photo.
 *
 * Une vignette de cent pixels ne permet pas de vérifier qu'une photo est
 * nette ou qu'elle montre le bon objet. Sans agrandissement, on envoie
 * sans savoir ce qu'on envoie.
 */
function Visualiseur({
  url,
  legende,
  onClose,
  onPrev,
  onNext,
}: {
  url: string;
  legende: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    function auClavier(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev?.();
      if (event.key === "ArrowRight") onNext?.();
    }
    window.addEventListener("keydown", auClavier);
    return () => window.removeEventListener("keydown", auClavier);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={legende}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-3">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Photo précédente"
            className="shrink-0 rounded-full bg-white/10 px-3 py-6 text-white"
          >
            ‹
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={legende}
          className="max-h-full min-w-0 rounded-lg object-contain"
        />
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Photo suivante"
            className="shrink-0 rounded-full bg-white/10 px-3 py-6 text-white"
          >
            ›
          </button>
        )}
      </div>

      <p className="pt-3 text-center text-sm text-white/80">{legende}</p>
    </div>
  );
}
