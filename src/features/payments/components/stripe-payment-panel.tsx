"use client";

import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import type { OpenPayment } from "../types/payment.types";
import { displayMajorAmount } from "../lib/payment-display";
import { rememberPendingPayment } from "../lib/pending-payment";

interface StripePaymentPanelProps {
  payment: OpenPayment;
  shipmentId: string;
  onBack: () => void;
}

export function StripePaymentPanel({
  payment,
  shipmentId,
  onBack,
}: StripePaymentPanelProps) {
  const [stripe] = useState(() => loadStripe(payment.publishableKey));
  const [options] = useState(() => ({
    clientSecret: payment.clientSecret,
    elementsOptions: {
      appearance: stripeAppearance(),
      loader: "always" as const,
    },
  }));

  return (
    <section
      aria-labelledby="stripe-payment-title"
      className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_70px_-48px_rgb(43_29_23_/_0.55)] sm:p-7"
    >
      <button
        type="button"
        onClick={onBack}
        className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full px-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Revoir le récapitulatif
      </button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Paiement sécurisé
          </p>
          <h2 id="stripe-payment-title" className="mt-2 text-2xl font-semibold">
            Choisissez votre moyen de paiement
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Stripe affiche uniquement les moyens disponibles pour votre appareil et votre
            situation. Zoumani ne reçoit jamais vos données bancaires.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:inline-flex">
          {displayMajorAmount(payment.amountMajor, payment.currency)}
        </span>
      </div>

      <div className="mt-6">
        <CheckoutElementsProvider stripe={stripe} options={options}>
          <PaymentForm payment={payment} shipmentId={shipmentId} />
        </CheckoutElementsProvider>
      </div>
    </section>
  );
}

function PaymentForm({
  payment,
  shipmentId,
}: {
  payment: OpenPayment;
  shipmentId: string;
}) {
  const checkoutState = useCheckout();
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerError =
    checkoutState.type === "error" ? checkoutState.error.message : null;
  const visibleError = error ?? providerError;

  useEffect(() => {
    if (visibleError) {
      errorRef.current?.focus();
    }
  }, [visibleError]);

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkoutState.type !== "success" || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    rememberPendingPayment({ paymentId: payment.paymentId, shipmentId });

    try {
      const result = await checkoutState.checkout.confirm();
      if (result.type === "error") {
        setError(result.error.message);
        setSubmitting(false);
        return;
      }

      const query = new URLSearchParams({
        payment_id: payment.paymentId,
        shipment_id: shipmentId,
      });
      router.push(`/paiement/retour?${query.toString()}` as Route);
    } catch {
      setError(
        "Le paiement n'a pas pu être confirmé. Vérifiez votre connexion puis réessayez.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void confirm(event)} aria-busy={submitting} noValidate>
      <div className="min-h-32 rounded-2xl border border-border bg-surface-elevated p-3.5 sm:p-4">
        <PaymentElement options={{ layout: { type: "accordion", radios: "always" } }} />
        {checkoutState.type === "loading" && (
          <div
            className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground"
            role="status"
          >
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            Préparation du formulaire sécurisé…
          </div>
        )}
      </div>

      {visibleError && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="focus-ring mt-4 rounded-xl border border-error/25 bg-error/8 px-4 py-3 text-sm leading-relaxed text-error"
        >
          {visibleError}
        </div>
      )}

      <button
        type="submit"
        disabled={checkoutState.type !== "success" || submitting}
        className="focus-ring mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-primary-foreground shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {submitting ? (
          <>
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            Confirmation sécurisée…
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" aria-hidden />
            Payer {displayMajorAmount(payment.amountMajor, payment.currency)}
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Le montant reste inchangé : il a été préparé et contrôlé par Zoumani.
      </p>
    </form>
  );
}

function stripeAppearance(): Appearance {
  const styles = window.getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  const dark = document.documentElement.dataset.colorScheme === "dark";

  return {
    theme: dark ? "night" : "stripe",
    variables: {
      colorPrimary: token("--primary"),
      colorBackground: token("--surface-elevated"),
      colorText: token("--foreground"),
      colorTextSecondary: token("--muted-foreground"),
      colorDanger: token("--error"),
      colorSuccess: token("--success"),
      fontFamily: token("--font-body"),
      borderRadius: token("--shape-radius-sm"),
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: `1px solid ${token("--border")}`,
        boxShadow: "none",
        padding: "13px 14px",
      },
      ".Input:focus": {
        borderColor: token("--primary"),
        boxShadow: `0 0 0 3px ${token("--muted")}`,
      },
      ".Label": {
        color: token("--foreground"),
        fontWeight: "600",
      },
      ".Tab": {
        border: `1px solid ${token("--border")}`,
        boxShadow: "none",
      },
      ".Tab--selected": {
        borderColor: token("--primary"),
        boxShadow: `0 0 0 1px ${token("--primary")}`,
      },
    },
  };
}
