"use client";

import { CreditCard, MessageCircle, Package, Plane, UserRound } from "lucide-react";
import Link from "next/link";

import { useAccountCopy } from "@/features/account/components/account-copy-provider";

/**
 * Une section de l'espace qui n'existe pas encore.
 *
 * ═══ Pourquoi une page plutôt qu'une entrée grisée ═══
 *
 * Un menu dont la moitié des lignes ne réagissent pas donne l'impression
 * d'un site cassé — on reclique, on doute de son geste. Une page qui dit
 * franchement « pas encore » et propose où aller respecte davantage :
 * l'entrée fonctionne, et la réponse est honnête.
 *
 * Elle disparaîtra section par section, à mesure que les circuits
 * arrivent. C'est un échafaudage, et il est écrit pour être démonté.
 */
/**
 * Le symbole de chaque section, choisi **ici**.
 *
 * Il ne peut pas venir de la page : celle-ci est rendue sur le serveur,
 * et un composant React n'est pas sérialisable. Le lui passer produit
 * « Functions cannot be passed directly to Client Components » — une
 * erreur qui n'apparaît qu'à la compilation d'une page pré-rendue, donc
 * jamais pendant qu'on développe.
 */
const ICONS = {
  shipments: Package,
  trips: Plane,
  messages: MessageCircle,
  profile: UserRound,
  payments: CreditCard,
} as const;

export function ComingSoon({
  section,
}: {
  /** Quelle entrée du menu cette page prolonge. */
  section: keyof typeof ICONS;
}) {
  const Icon = ICONS[section];
  const copy = useAccountCopy();

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <div className="panel-surface flex flex-col items-start gap-5 p-8">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl text-foreground">{copy.menu[section]}</h1>
          <p className="mt-2 max-w-xl leading-6 text-muted-foreground">
            {copy.soon.description}
          </p>
        </div>
        <Link
          href="/compte"
          className="focus-ring inline-flex items-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          {copy.soon.cta}
        </Link>
      </div>
    </div>
  );
}
