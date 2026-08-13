"use client";

import Link from "next/link";

import type { ShipmentStatus, ShipmentSummary } from "../types/trip.types";

interface MyShipmentsViewProps {
  shipments: ShipmentSummary[];
  labels: Record<string, string>;
}

const ETATS: Record<ShipmentStatus, { libelle: string; classe: string }> = {
  draft: { libelle: "Brouillon", classe: "bg-muted text-muted-foreground" },
  pending_payment: {
    libelle: "À payer",
    classe: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  confirmed: { libelle: "Confirmé", classe: "bg-emerald-500/15 text-emerald-700" },
  cancelled: { libelle: "Annulé", classe: "bg-muted text-muted-foreground" },
};

/**
 * Les envois d'un expéditeur.
 *
 * Le montant affiché est celui qui revient au voyageur. La mention « hors
 * frais » l'accompagne partout : une facture finale plus élevée que ce
 * qu'on a lu partout ailleurs se ressent comme un piège, même quand elle
 * est justifiée.
 */
export function MyShipmentsView({ shipments, labels }: MyShipmentsViewProps) {
  if (shipments.length === 0) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-6 text-center">
        <h1 className="text-xl font-semibold">Aucun envoi pour l&apos;instant</h1>
        <p className="text-sm text-muted-foreground">
          Cherchez un voyageur qui part vers votre destination : vous choisissez ce que
          vous envoyez, il vous dit son prix.
        </p>
        <Link
          href="/compte"
          className="inline-block rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground"
        >
          Trouver un voyageur
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Mes envois</h1>

      <ul className="space-y-3">
        {shipments.map((shipment) => {
          const etat = ETATS[shipment.status];
          return (
            <li key={shipment.id} className="rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium tabular-nums">
                    {shipment.totalMajor} {shipment.currency === "EUR" ? "€" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    montant pour le voyageur, hors frais
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${etat.classe}`}
                >
                  {etat.libelle}
                </span>
              </div>

              <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                {shipment.lines.map((line) => (
                  <li key={line.categoryCode} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {labels[line.categoryCode] ?? line.categoryCode}
                    </span>
                    <span className="shrink-0">
                      {line.perPiece
                        ? `${line.pieces} pièce(s)`
                        : `${line.quantityKg?.toFixed(1)} kg`}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
