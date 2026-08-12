"use client";

import { useEffect, useId, useState } from "react";

import { fetchAttestation, type Attestation } from "../api/travel-client";

interface AttestationFieldProps {
  accepted: boolean;
  onChange: (accepted: boolean, version: string) => void;
}

/**
 * La case d'engagement, et le texte qu'elle engage.
 *
 * ═══ Le texte vient du serveur ═══
 *
 * Il n'est pas écrit ici. Deux copies — une en base, une dans le code du
 * client — divergeraient au premier ajustement, et l'on ne saurait plus
 * laquelle la personne a réellement lue. C'est précisément ce que la
 * trace doit pouvoir établir.
 *
 * ═══ Le texte est affiché en entier ═══
 *
 * Pas replié derrière un lien, pas résumé. Un engagement qu'il faut
 * déplier pour lire est un engagement qu'on n'a pas lu — et l'opposer à
 * quelqu'un devient discutable.
 *
 * ═══ Jamais pré-cochée ═══
 *
 * Une case cochée d'avance est une signature obtenue sans information.
 */
export function AttestationField({ accepted, onChange }: AttestationFieldProps) {
  const [attestation, setAttestation] = useState<Attestation | null>(null);
  const checkboxId = useId();

  useEffect(() => {
    let vivant = true;
    void fetchAttestation()
      .then((valeur) => {
        if (vivant) {
          setAttestation(valeur);
        }
      })
      .catch(() => {
        // Sans texte, on n'affiche pas de case : faire cocher un
        // engagement qu'on n'a pas su afficher ne vaudrait rien.
      });
    return () => {
      vivant = false;
    };
  }, []);

  if (!attestation) {
    return (
      <p className="text-sm text-muted-foreground">Chargement de l&apos;engagement…</p>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm leading-relaxed text-muted-foreground">{attestation.text}</p>
      <label className="mt-3 flex cursor-pointer items-start gap-3" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.target.checked, attestation.version)}
          className="mt-0.5 size-4"
        />
        <span className="text-sm font-medium">
          Je certifie l&apos;exactitude de ces informations et j&apos;accepte les
          conditions ci-dessus.
        </span>
      </label>
    </div>
  );
}
