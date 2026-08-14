"use client";

import {
  Check,
  CircleX,
  Clock3,
  Hourglass,
  LoaderCircle,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/api-errors";

import { getPayment } from "../api/payment-client";
import { displayMajorAmount } from "../lib/payment-display";
import {
  forgetPendingPayment,
  useClientReady,
  usePendingPaymentReference,
} from "../lib/pending-payment";
import type { PaymentState } from "../types/payment.types";

const POLL_INTERVAL_MS = 1_500;
const PATIENCE_MS = 20_000;

type ReturnPhase =
  | "locating"
  | "checking"
  | "paid"
  | "failed"
  | "expired"
  | "refunded"
  | "delayed"
  | "missing";

interface PaymentReturnViewProps {
  paymentIdFromUrl: string | null;
  shipmentIdFromUrl: string | null;
  fallbackAmountMajor: string | null;
  fallbackCurrency: string | null;
}

export function PaymentReturnView({
  paymentIdFromUrl,
  shipmentIdFromUrl,
  fallbackAmountMajor,
  fallbackCurrency,
}: PaymentReturnViewProps) {
  const pending = usePendingPaymentReference();
  const clientReady = useClientReady();
  const paymentId = paymentIdFromUrl ?? pending?.paymentId ?? null;
  const shipmentId = shipmentIdFromUrl ?? pending?.shipmentId ?? null;
  const [settledPhase, setSettledPhase] = useState<ReturnPhase | null>(null);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const phase: ReturnPhase =
    settledPhase ?? (paymentId ? "checking" : clientReady ? "missing" : "locating");

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const deadline = setTimeout(() => {
      if (!cancelled) {
        cancelled = true;
        controller.abort();
        setSettledPhase("delayed");
      }
    }, PATIENCE_MS);

    async function poll() {
      if (cancelled) {
        return;
      }
      try {
        const current = await getPayment(paymentId as string, controller.signal);
        if (cancelled) {
          return;
        }
        setPayment(current);

        if (current.isPaid) {
          clearTimeout(deadline);
          forgetPendingPayment();
          setSettledPhase("paid");
          return;
        }
        if (current.status === "failed" || current.status === "expired") {
          clearTimeout(deadline);
          forgetPendingPayment();
          setSettledPhase(current.status);
          return;
        }
        if (current.status === "refunded") {
          clearTimeout(deadline);
          forgetPendingPayment();
          setSettledPhase("refunded");
          return;
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          clearTimeout(deadline);
          forgetPendingPayment();
          setSettledPhase("missing");
          return;
        }
      }

      timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
    }

    void poll();
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) {
        clearTimeout(timer);
      }
      clearTimeout(deadline);
    };
  }, [paymentId]);

  const amountMajor = payment?.amountMajor ?? fallbackAmountMajor;
  const currency = payment?.currency ?? fallbackCurrency;
  const retryHref = shipmentId
    ? (`/envois/${shipmentId}/paiement` as Route)
    : ("/compte/envois" as Route);

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <section
        aria-live="polite"
        aria-busy={phase === "checking" || phase === "locating"}
        className="relative w-full overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_35px_90px_-55px_rgb(43_29_23_/_0.65)]"
      >
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="relative flex min-h-60 items-center justify-center overflow-hidden bg-inverse-surface p-8 text-inverse-foreground lg:min-h-[30rem]">
            <span className="absolute -left-20 -top-20 size-64 rounded-full border-[2.5rem] border-primary/15" />
            <span className="absolute -bottom-24 -right-20 size-72 rounded-full border-[3rem] border-secondary/12" />
            <StatusIllustration phase={phase} />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Paiement Zoumani
            </p>
            <StatusCopy phase={phase} />

            {amountMajor && currency && (
              <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ReceiptText className="size-4 text-primary" aria-hidden />
                  Montant de l&apos;envoi
                </span>
                <strong className="text-lg tabular-nums">
                  {displayMajorAmount(amountMajor, currency)}
                </strong>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {phase === "paid" || phase === "delayed" || phase === "refunded" ? (
                <Link
                  href="/compte/envois"
                  className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
                >
                  Voir mes envois
                </Link>
              ) : phase === "failed" || phase === "expired" ? (
                <Link
                  href={retryHref}
                  className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
                >
                  Réessayer le paiement
                </Link>
              ) : phase === "missing" ? (
                <Link
                  href="/compte/envois"
                  className="focus-ring inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground"
                >
                  Retrouver mon envoi
                </Link>
              ) : null}
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden />
              Seule la confirmation sécurisée reçue par Zoumani valide votre paiement.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusIllustration({ phase }: { phase: ReturnPhase }) {
  const waiting = phase === "locating" || phase === "checking";
  const Icon =
    phase === "paid"
      ? Check
      : phase === "failed"
        ? CircleX
        : phase === "expired"
          ? Hourglass
          : phase === "refunded"
            ? RotateCcw
            : phase === "delayed"
              ? Clock3
              : waiting
                ? LoaderCircle
                : ReceiptText;

  return (
    <div className="relative grid size-40 place-items-center" aria-hidden>
      {waiting && (
        <>
          <span className="absolute inset-0 animate-spin rounded-full border border-dashed border-primary/70 motion-reduce:animate-none" />
          <span className="absolute inset-5 animate-[spin_3s_linear_infinite_reverse] rounded-full border border-dashed border-secondary/50 motion-reduce:animate-none" />
        </>
      )}
      <span
        className={`grid size-20 place-items-center rounded-[1.7rem] ${
          phase === "paid"
            ? "bg-success text-white"
            : phase === "failed" || phase === "expired"
              ? "bg-error text-white"
              : "bg-primary text-primary-foreground"
        }`}
      >
        <Icon
          className={`size-9 ${waiting ? "animate-spin motion-reduce:animate-none" : ""}`}
        />
      </span>
    </div>
  );
}

function StatusCopy({ phase }: { phase: ReturnPhase }) {
  const copy: Record<ReturnPhase, { title: string; body: string }> = {
    locating: {
      title: "Nous retrouvons votre paiement…",
      body: "Gardez cette page ouverte un instant. Aucune action n'est nécessaire.",
    },
    checking: {
      title: "Nous confirmons votre paiement…",
      body: "Votre banque a rendu la main. Zoumani attend maintenant la confirmation sécurisée de Stripe.",
    },
    paid: {
      title: "C'est confirmé.",
      body: "Votre paiement est bien arrivé. Votre envoi peut poursuivre son parcours en toute sérénité.",
    },
    failed: {
      title: "Le paiement n'a pas abouti.",
      body: "Aucun montant n'a été validé. Vous pouvez vérifier votre moyen de paiement et réessayer.",
    },
    expired: {
      title: "La tentative a expiré.",
      body: "Aucun montant n'a été validé. Relancez simplement le paiement depuis votre envoi.",
    },
    refunded: {
      title: "Ce paiement a été remboursé.",
      body: "Le montant a été retourné par le circuit bancaire. Vous pouvez suivre votre envoi depuis votre espace.",
    },
    delayed: {
      title: "Votre paiement est en cours de traitement.",
      body: "Certaines banques prennent un peu plus de temps. Nous vous confirmerons la suite par e-mail, sans nouvelle action de votre part.",
    },
    missing: {
      title: "Impossible de retrouver cette tentative.",
      body: "Retrouvez votre envoi dans votre espace pour consulter son état ou reprendre le paiement en toute sécurité.",
    },
  };

  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {copy[phase].title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {copy[phase].body}
      </p>
    </>
  );
}
