"use client";

import { ArrowRight, MapPinned, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { ShipmentStatus, ShipmentSummary } from "../types/trip.types";

interface MyShipmentsViewProps {
  shipments: ShipmentSummary[];
  labels: Record<string, string>;
}

const ETATS: Record<ShipmentStatus, { label: string; className: string; copy: string }> =
  {
    draft: {
      label: "Brouillon",
      className: "bg-muted text-muted-foreground",
      copy: "Votre demande peut encore être ajustée.",
    },
    pending_payment: {
      label: "Prêt à payer",
      className: "bg-warning/15 text-warning",
      copy: "Le contenu est complet. Le paiement sécurisé sera la prochaine étape.",
    },
    confirmed: {
      label: "Confirmé",
      className: "bg-success/15 text-success",
      copy: "La place est réservée auprès du voyageur.",
    },
    cancelled: {
      label: "Annulé",
      className: "bg-muted text-muted-foreground",
      copy: "Cette demande a été refermée avant son départ.",
    },
  };

/** Le carnet des colis confiés à la communauté Zoumani. */
export function MyShipmentsView({ shipments, labels }: MyShipmentsViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="relative overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-8 text-inverse-foreground sm:px-9">
        <div className="pointer-events-none absolute -right-10 -top-20 size-64 rounded-full border-[3rem] border-primary/15" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Vos envois
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Chaque colis garde son histoire.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground">
              De vos mains à celles du voyageur, retrouvez les contenus déclarés, leur
              protection et la prochaine action utile.
            </p>
          </div>
          <Link
            href="/search"
            className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Trouver un voyageur <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      {shipments.length === 0 ? (
        <EmptyShipments />
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {shipments.map((shipment) => {
            const state = ETATS[shipment.status];
            return (
              <li key={shipment.id}>
                <Link
                  href={`/envois/${shipment.id}`}
                  className="group block h-full overflow-hidden rounded-[1.5rem] border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_60px_-42px_rgb(43_29_23_/_0.7)]"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-inverse-surface text-primary">
                        <PackageCheck className="size-5" aria-hidden />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">Envoi Zoumani</p>
                        <p className="font-mono text-sm font-semibold">
                          #{shipment.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${state.className}`}
                    >
                      {state.label}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-2xl font-semibold tabular-nums">
                          {shipment.totalMajor}{" "}
                          {shipment.currency === "EUR" ? "€" : shipment.currency}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          montant pour le voyageur, hors protection et service
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {shipment.weightKg} kg
                      </p>
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                      {shipment.lines.map((line) => (
                        <li
                          key={line.categoryCode}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-muted-foreground">
                            {labels[line.categoryCode] ?? line.categoryCode}
                          </span>
                          <span>
                            {line.perPiece
                              ? `${line.pieces} pièce(s)`
                              : `${line.quantityKg?.toFixed(1)} kg`}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-primary/5 px-3 py-2.5 text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        {shipment.handover === "carrier" ? (
                          <MapPinned className="size-4 text-primary" aria-hidden />
                        ) : (
                          <ShieldCheck className="size-4 text-primary" aria-hidden />
                        )}
                        {shipment.handover === "carrier"
                          ? "Dépôt en relais"
                          : "Remise en main propre"}
                      </span>
                      <ArrowRight
                        className="size-4 text-primary transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{state.copy}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyShipments() {
  return (
    <section className="mt-6 rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-inverse-surface text-primary">
        <PackageCheck className="size-7" aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-semibold">
        Votre premier colis attend son voyage
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Choisissez une destination, comparez les places disponibles puis confiez votre
        envoi à une personne dont l&apos;identité et le billet ont été contrôlés.
      </p>
    </section>
  );
}
