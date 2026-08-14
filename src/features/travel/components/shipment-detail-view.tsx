"use client";

import { ArrowLeft, MapPinned, PackageCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cancelShipment } from "../api/travel-client";
import type { ShipmentSummary } from "../types/trip.types";

interface ShipmentDetailViewProps {
  shipment: ShipmentSummary;
  labels: Record<string, string>;
}

export function ShipmentDetailView({ shipment, labels }: ShipmentDetailViewProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const canCancel = shipment.status === "draft" || shipment.status === "pending_payment";

  async function cancel() {
    setBusy(true);
    setFailure(null);
    try {
      await cancelShipment(shipment.id);
      router.push("/compte/envois");
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "L'annulation n'a pas abouti.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/compte/envois" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Mes envois
      </Link>

      <header className="relative mt-4 overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-8 text-inverse-foreground sm:px-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Envoi Zoumani</p>
        <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold">#{shipment.id.slice(0, 8).toUpperCase()}</h1>
            <p className="mt-2 text-sm text-inverse-muted-foreground">
              {shipment.status === "pending_payment"
                ? "Votre demande est complète et attend son paiement sécurisé."
                : shipment.status === "confirmed"
                  ? "Votre place est confirmée auprès du voyageur."
                  : shipment.status === "cancelled"
                    ? "Cette demande a été annulée."
                    : "Ce brouillon reste sous votre contrôle."}
            </p>
          </div>
          <p className="text-3xl font-semibold tabular-nums">
            {shipment.totalMajor} {shipment.currency === "EUR" ? "€" : shipment.currency}
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-[1.5rem] border border-border bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><PackageCheck className="size-5" aria-hidden /></span>
            <div><p className="font-semibold">Contenu déclaré</p><p className="text-xs text-muted-foreground">{shipment.weightKg} kg connus au total</p></div>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {shipment.lines.map((line) => (
              <li key={line.categoryCode} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{labels[line.categoryCode] ?? line.categoryCode}</p>
                  <p className="text-xs text-muted-foreground">{line.hasPhoto ? "Photos de contrôle ajoutées" : "Photos encore attendues"}</p>
                </div>
                <div className="text-right"><p>{line.perPiece ? `${line.pieces} pièce(s)` : `${line.quantityKg?.toFixed(1)} kg`}</p><p className="text-xs text-muted-foreground">{(line.totalMinor / 100).toFixed(2)} €</p></div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[1.5rem] border border-border bg-surface p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              {shipment.handover === "carrier" ? <MapPinned className="size-5" aria-hidden /> : <ShieldCheck className="size-5" aria-hidden />}
            </span>
            <h2 className="mt-4 font-semibold">{shipment.handover === "carrier" ? "Dépôt en point relais" : "Remise en main propre"}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {shipment.handover === "carrier"
                ? `Relais ${shipment.servicePointCode ?? "à confirmer"} · ${shipment.carrierCode ?? "réseau partenaire"}`
                : "Vous conviendrez d'un lieu de remise avec le voyageur après confirmation."}
            </p>
          </section>

          {shipment.status === "pending_payment" && (
            <section className="rounded-[1.5rem] border border-primary/25 bg-primary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Prochaine étape</p>
              <h2 className="mt-2 font-semibold">Paiement sécurisé</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Le module de paiement n&apos;est pas encore activé. Votre demande reste enregistrée sans débit.</p>
            </section>
          )}
        </aside>
      </div>

      {canCancel && (
        <section className="mt-5 rounded-[1.5rem] border border-border bg-surface p-5">
          {confirming ? (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">La demande sera refermée. Aucun paiement n&apos;ayant été confirmé, rien ne sera débité.</p>
              <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => void cancel()} className="rounded-full bg-error px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Annulation…" : "Confirmer"}</button><button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-border px-4 py-2 text-sm">Conserver</button></div>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-muted-foreground hover:text-error">Annuler cette demande</button>
          )}
          {failure && <p className="mt-3 text-sm text-error" role="alert">{failure}</p>}
        </section>
      )}
    </div>
  );
}
