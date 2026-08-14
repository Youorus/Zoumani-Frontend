"use client";

import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

import { TripSummaryBanner } from "@/features/travel/components/trip-summary-banner";
import type {
  CapacityMatch,
  ShipmentSummary,
} from "@/features/travel/types/trip.types";
import { ApiError } from "@/lib/api/api-errors";

import { openPayment } from "../api/payment-client";
import { displayMajorAmount } from "../lib/payment-display";
import type { CheckoutQuote, OpenPayment } from "../types/payment.types";
import { StripePaymentPanel } from "./stripe-payment-panel";

interface CheckoutViewProps {
  quote: CheckoutQuote;
  shipment: ShipmentSummary;
  match: CapacityMatch | null;
  labels: Record<string, string>;
}

interface StartFailure {
  message: string;
  backToShipment: boolean;
}

export function CheckoutView({
  quote,
  shipment,
  match,
  labels,
}: CheckoutViewProps) {
  const errorRef = useRef<HTMLDivElement>(null);
  const [opening, setOpening] = useState(false);
  const [payment, setPayment] = useState<OpenPayment | null>(null);
  const [failure, setFailure] = useState<StartFailure | null>(null);
  const activeTotal = payment?.amountMajor ?? quote.totalMajor;
  const activeCurrency = payment?.currency ?? quote.currency;

  useEffect(() => {
    if (failure) {
      errorRef.current?.focus();
    }
  }, [failure]);

  async function beginPayment() {
    if (!quote.canPay || opening) {
      return;
    }
    setOpening(true);
    setFailure(null);

    try {
      const returnPath = `/paiement/retour?shipment_id=${encodeURIComponent(shipment.id)}`;
      setPayment(await openPayment(shipment.id, returnPath));
    } catch (error) {
      setFailure(startFailureOf(error));
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -right-24 top-16 size-80 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-7 text-inverse-foreground sm:px-9 sm:py-9">
        <div className="absolute -right-12 -top-24 size-72 rounded-full border-[3rem] border-primary/15" />
        <div className="relative flex max-w-3xl items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <LockKeyhole className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Dernière vérification
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tout est clair avant de régler.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-inverse-muted-foreground">
              Vérifiez le voyage, le contenu et chaque coût. Le règlement est ensuite
              traité par Stripe, sans que vos données bancaires transitent par Zoumani.
            </p>
          </div>
        </div>
      </header>

      <div className="relative mt-5 grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <main className="space-y-5">
          {match && <TripSummaryBanner match={match} />}

          {payment ? (
            <StripePaymentPanel
              payment={payment}
              shipmentId={shipment.id}
              onBack={() => setPayment(null)}
            />
          ) : (
            <section className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_70px_-48px_rgb(43_29_23_/_0.55)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Prêt à payer
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Un dernier regard, puis Stripe prend le relais.
                  </h2>
                </div>
                <span className="hidden rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success sm:inline-flex">
                  Paiement sécurisé
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-primary/18 bg-primary/6 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <LockKeyhole className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold">Les bons moyens, au bon moment</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Carte et portefeuilles compatibles apparaîtront automatiquement
                      selon votre appareil. Vous n&apos;avez rien à configurer ici.
                    </p>
                  </div>
                </div>
              </div>

              {failure && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="focus-ring mt-4 rounded-xl border border-error/25 bg-error/8 px-4 py-3 text-sm leading-relaxed text-error"
                >
                  <p>{failure.message}</p>
                  {failure.backToShipment && (
                    <Link
                      href={`/envois/${shipment.id}` as Route}
                      className="mt-2 inline-flex font-bold underline underline-offset-4"
                    >
                      Revenir à l&apos;étape précédente
                    </Link>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => void beginPayment()}
                disabled={!quote.canPay || opening}
                aria-busy={opening}
                className="focus-ring mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-primary-foreground shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {opening ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                    Ouverture sécurisée…
                  </>
                ) : quote.canPay ? (
                  <>
                    Payer {displayMajorAmount(quote.totalMajor, quote.currency)}
                    <ArrowRight className="size-4" aria-hidden />
                  </>
                ) : (
                  "Paiement temporairement indisponible"
                )}
              </button>
              {!quote.canPay && (
                <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                  Le paiement n&apos;est pas encore ouvert pour cet envoi. Aucun montant
                  ne peut être débité.
                </p>
              )}
            </section>
          )}

          <section className="grid gap-3 sm:grid-cols-3">
            <TrustFact icon={PackageCheck} text="Contenu documenté et vérifiable" />
            <TrustFact icon={ShieldCheck} text="Voyageur et billet contrôlés" />
            <TrustFact icon={Sparkles} text="Montant fixé par le serveur" />
          </section>
        </main>

        <aside className="rounded-[1.75rem] border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Votre envoi
          </p>
          <h2 className="mt-2 text-xl font-semibold">Récapitulatif</h2>

          <ul className="mt-5 space-y-3 border-b border-border pb-5">
            {shipment.lines.map((line) => (
              <li key={line.categoryCode} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">
                    {labels[line.categoryCode] ?? line.categoryCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.perPiece ? `${line.pieces} pièce(s)` : `${line.quantityKg} kg`}
                  </p>
                </div>
                <span className="tabular-nums">
                  {money(line.totalMinor, quote.currency)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 text-sm">
            <PriceRow
              label="Rémunération du voyageur"
              value={quote.travelerMinor}
              currency={quote.currency}
            />
            <PriceRow
              label={
                shipment.handover === "carrier"
                  ? `Livraison ${shipment.shippingLabel ?? "partenaire"}`
                  : "Remise en main propre"
              }
              value={quote.shippingMinor}
              currency={quote.currency}
              freeLabel={shipment.handover === "in_person" ? "Gratuite" : undefined}
            />
            <PriceRow
              label="Frais de service Zoumani"
              value={quote.serviceFeeMinor}
              currency={quote.currency}
            />
            <p className="-mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
              Paiement sécurisé, vérifications du parcours et assistance Zoumani.
            </p>
            {quote.insurance && (
              <PriceRow
                label="Protection du colis"
                value={quote.insurance.premiumMinor}
                currency={quote.currency}
              />
            )}
            <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
              <dt>
                <span className="block font-semibold">Total à payer</span>
                <span className="text-xs text-muted-foreground">
                  Montant contrôlé par Zoumani
                </span>
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {displayMajorAmount(activeTotal, activeCurrency)}
              </dd>
            </div>
          </dl>

          {quote.insurance && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                Valeur couverte : {money(quote.insurance.coverageMinor, quote.currency)}
              </p>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">
                {quote.insurance.disclaimer}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function startFailureOf(error: unknown): StartFailure {
  const reason = paymentReasonOf(error);
  if (reason === "checkout_not_found") {
    return {
      message: "Le récapitulatif n'est plus disponible. Reprenez l'étape précédente pour le préparer à nouveau.",
      backToShipment: true,
    };
  }
  if (reason === "payment_provider_unavailable") {
    return {
      message: "Le service de paiement ne répond pas pour le moment. Réessayez dans un instant : rien n'a été débité.",
      backToShipment: false,
    };
  }
  if (reason === "payment_amount_mismatch") {
    console.error("Payment amount mismatch while opening checkout");
  }
  return {
    message: "Le paiement ne peut pas être ouvert pour le moment. Réessayez dans un instant.",
    backToShipment: false,
  };
}

function paymentReasonOf(error: unknown): string | null {
  if (!(error instanceof ApiError) || typeof error.details !== "object" || !error.details) {
    return null;
  }
  if (!("reason" in error.details) || typeof error.details.reason !== "string") {
    return null;
  }
  return error.details.reason;
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(
    value / 100,
  );
}

function PriceRow({
  label,
  value,
  currency,
  freeLabel,
}: {
  label: string;
  value: number;
  currency: string;
  freeLabel?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{freeLabel ?? money(value, currency)}</dd>
    </div>
  );
}

function TrustFact({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface p-3.5 text-xs font-medium">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      {text}
    </div>
  );
}
