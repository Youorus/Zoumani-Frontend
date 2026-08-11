"use client";

import { AlertCircle, BadgeCheck, ChevronRight, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { useAccountCopy } from "@/features/account/components/account-copy-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import type { VerificationStage } from "../types/verification.types";

/**
 * L'état de la vérification, dans le menu du compte.
 *
 * ═══ Pourquoi c'est un lien, même quand tout va bien ═══
 *
 * Un état affiché sans issue laisse démuni : « refusée » sans chemin de
 * retour est une impasse, et « en cours » sans détail donne envie
 * d'écrire au support. Chaque état mène quelque part — le formulaire à
 * reprendre, ou le récapitulatif de ce qui a été envoyé.
 *
 * ═══ Pourquoi l'état vérifié reste visible ═══
 *
 * On pourrait le masquer une fois acquis. Ce serait une erreur : c'est
 * précisément ce que la personne vient revérifier avant de publier un
 * trajet ou de confier un colis de valeur. Le faire disparaître obligerait
 * à chercher.
 */
export function VerificationMenuEntry({ stage }: { stage: VerificationStage }) {
  const copy = useAccountCopy().verification;

  const { Icon, tone, label } =
    stage === "verifie"
      ? { Icon: BadgeCheck, tone: "text-success", label: copy.verified }
      : stage === "refuse"
        ? { Icon: ShieldAlert, tone: "text-error", label: copy.rejected }
        : stage === "a_corriger"
          ? { Icon: AlertCircle, tone: "text-warning", label: copy.toFix }
          : stage === "en_cours"
            ? { Icon: Clock, tone: "text-warning", label: copy.pending }
            : {
                Icon: ShieldAlert,
                tone: "text-muted-foreground",
                label: copy.absent,
              };

  return (
    <DropdownMenuItem asChild>
      <Link href="/compte/identite" className="flex items-center gap-3">
        <Icon className={`size-4 ${tone}`} aria-hidden="true" />
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </Link>
    </DropdownMenuItem>
  );
}
