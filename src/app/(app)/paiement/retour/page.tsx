import type { Metadata } from "next";

import { PaymentReturnView } from "@/features/payments/components/payment-return-view";
import {
  toCheckoutQuote,
  type RawCheckoutQuote,
} from "@/features/payments/types/payment.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    payment_id?: string | string[];
    shipment_id?: string | string[];
  }>;
}) {
  const query = await searchParams;
  const paymentId = first(query.payment_id);
  const shipmentId = first(query.shipment_id);
  let fallbackAmountMajor: string | null = null;
  let fallbackCurrency: string | null = null;

  if (shipmentId) {
    const quote = await callApi({
      method: "GET",
      path: `/payments/shipments/${encodeURIComponent(shipmentId)}/quote`,
    });
    if (quote.status === 200) {
      const mapped = toCheckoutQuote(quote.body as RawCheckoutQuote);
      fallbackAmountMajor = mapped.totalMajor;
      fallbackCurrency = mapped.currency;
    }
  }

  return (
    <PaymentReturnView
      paymentIdFromUrl={paymentId}
      shipmentIdFromUrl={shipmentId}
      fallbackAmountMajor={fallbackAmountMajor}
      fallbackCurrency={fallbackCurrency}
    />
  );
}

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}
