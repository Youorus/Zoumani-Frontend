"use client";

import {
  Check,
  CreditCard,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import type { ShipmentSummary } from "@/features/travel/types/trip.types";

import type { CheckoutQuote, PaymentMethod } from "../types/payment.types";

interface CheckoutViewProps {
  quote: CheckoutQuote;
  shipment: ShipmentSummary;
  labels: Record<string, string>;
}

const paymentMethods: {
  code: PaymentMethod;
  title: string;
  detail: string;
  icon: typeof CreditCard;
}[] = [
  {
    code: "card",
    title: "Carte bancaire",
    detail: "Visa, Mastercard et cartes compatibles 3D Secure",
    icon: CreditCard,
  },
  {
    code: "apple_pay",
    title: "Apple Pay",
    detail: "Validation rapide depuis un appareil compatible",
    icon: Smartphone,
  },
  {
    code: "google_pay",
    title: "Google Pay",
    detail: "Paiement depuis votre portefeuille Google",
    icon: Smartphone,
  },
];

export function CheckoutView({ quote, shipment, labels }: CheckoutViewProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");

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
              Le paiement sera demain sécurisé par Zoumani, puis libéré selon les
              étapes confirmées du parcours. Pour l&apos;instant, aucun débit n&apos;est
              effectué.
            </p>
          </div>
        </div>
      </header>

      <div className="relative mt-5 grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <main className="space-y-5">
          <section className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_70px_-48px_rgb(43_29_23_/_0.55)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  Moyen de paiement
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Comment souhaitez-vous régler ?</h2>
              </div>
              <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
                Préparé pour Stripe
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              {paymentMethods
                .filter((item) => quote.availableMethods.includes(item.code))
                .map((item) => {
                  const Icon = item.icon;
                  const active = method === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setMethod(item.code)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                      <span
                        className={`grid size-5 place-items-center rounded-full border ${
                          active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        }`}
                      >
                        {active && <Check className="size-3" aria-hidden />}
                      </span>
                    </button>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={!quote.canPay}
              className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-55"
            >
              {quote.canPay
                ? `Payer ${quote.totalMajor} €`
                : "Paiement bientôt disponible — aucun débit"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <LockKeyhole className="size-3.5" aria-hidden />
              Les données de carte seront traitées par Stripe, jamais stockées par Zoumani.
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <TrustFact icon={PackageCheck} text="Contenu documenté sous trois angles" />
            <TrustFact icon={ShieldCheck} text="Voyageur et billet vérifiés" />
            <TrustFact icon={Sparkles} text="Montants recalculés côté serveur" />
          </section>
        </main>

        <aside className="rounded-[1.75rem] border border-border bg-surface p-5 lg:sticky lg:top-24 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Votre envoi
          </p>
          <h2 className="mt-2 text-xl font-semibold">Récapitulatif</h2>

          <ul className="mt-5 space-y-3 border-b border-border pb-5">
            {shipment.lines.map((line) => (
              <li key={line.categoryCode} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{labels[line.categoryCode] ?? line.categoryCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.perPiece ? `${line.pieces} pièce(s)` : `${line.quantityKg} kg`}
                  </p>
                </div>
                <span className="tabular-nums">{money(line.totalMinor, quote.currency)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 text-sm">
            <PriceRow label="Rémunération du voyageur" value={quote.travelerMinor} currency={quote.currency} />
            <PriceRow
              label={shipment.handover === "carrier" ? `Livraison ${shipment.shippingLabel ?? "partenaire"}` : "Remise en main propre"}
              value={quote.shippingMinor}
              currency={quote.currency}
              freeLabel={shipment.handover === "in_person" ? "Gratuite" : undefined}
            />
            <PriceRow
              label="Frais de service"
              value={quote.serviceFeeMinor}
              currency={quote.currency}
              freeLabel={quote.serviceFeeMinor === 0 ? "Offerts" : undefined}
            />
            {quote.insurance && (
              <PriceRow
                label="Protection du colis"
                value={quote.insurance.premiumMinor}
                currency={quote.currency}
              />
            )}
            <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
              <dt>
                <span className="block font-semibold">Total</span>
                <span className="text-xs text-muted-foreground">Montant préparé par Zoumani</span>
              </dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {money(quote.totalMinor, quote.currency)}
              </dd>
            </div>
          </dl>

          {quote.insurance && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-primary" aria-hidden />
                Valeur simulée : {money(quote.insurance.coverageMinor, quote.currency)}
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

function money(value: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(value / 100);
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
