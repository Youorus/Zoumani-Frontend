"use client";

import { AlertCircle, BadgeCheck, Clock, ShieldAlert } from "lucide-react";

import { useAccountCopy } from "@/features/account/components/account-copy-provider";
import { cn } from "@/lib/utils/cn";

import type { VerificationStage } from "../types/verification.types";

/**
 * La pastille posée sur l'avatar.
 *
 * ═══ Pourquoi elle n'apparaît que lorsqu'elle dit quelque chose ═══
 *
 * Rien du tout tant qu'aucun dossier n'existe. Un point d'interrogation
 * permanent sur son propre visage est désagréable, et surtout il ne
 * demande rien de précis : l'appel à l'action, lui, est dans l'espace,
 * en toutes lettres, avec un bouton.
 *
 * ═══ Trois signaux, pas seulement trois couleurs ═══
 *
 * La forme change avec l'état — coche, horloge, bouclier barré — parce
 * qu'un vert et un rouge se ressemblent pour huit pour cent des hommes.
 * Et le libellé accessible dit l'état en toutes lettres : sur un lecteur
 * d'écran, une pastille muette n'existe pas.
 */
export function VerificationBadge({
  stage,
  className,
}: {
  stage: VerificationStage;
  className?: string;
}) {
  const copy = useAccountCopy().verification;

  if (stage === "absent") {
    return null;
  }

  const { Icon, tone, label } =
    stage === "verifie"
      ? {
          Icon: BadgeCheck,
          tone: "bg-success text-white",
          label: copy.badgeVerified,
        }
      : stage === "refuse"
        ? {
            Icon: ShieldAlert,
            tone: "bg-error text-white",
            label: copy.badgeRejected,
          }
        : stage === "a_corriger"
          ? // Un point d'exclamation et non une horloge : attendre et
            // devoir agir ne se ressemblent pas, et c'est exactement la
            // confusion qui bloque un dossier des semaines.
            {
              Icon: AlertCircle,
              tone: "bg-warning text-white",
              label: copy.badgeToFix,
            }
          : { Icon: Clock, tone: "bg-warning text-white", label: copy.pending };

  return (
    <span
      // `ring` de la couleur du fond : la pastille chevauche l'avatar, et
      // sans cette découpe elle se confond avec la photo qu'elle borde.
      className={cn(
        "grid size-4.5 place-items-center rounded-full ring-2 ring-background",
        tone,
        className,
      )}
      role="img"
      aria-label={label}
      title={label}
    >
      <Icon className="size-3" aria-hidden="true" strokeWidth={3} />
    </span>
  );
}
