import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutView } from "@/features/payments/components/checkout-view";
import type { RawCheckoutQuote } from "@/features/payments/types/payment.types";
import { toCheckoutQuote } from "@/features/payments/types/payment.types";
import type { RawCatalog } from "@/features/travel/types/travel.types";
import { toShipment, type RawShipment } from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = await params;
  const [quote, shipment, catalog] = await Promise.all([
    callApi({ method: "GET", path: `/payments/shipments/${shipmentId}/quote` }),
    callApi({ method: "GET", path: `/shipments/${shipmentId}` }),
    callApi({ method: "GET", path: "/parcel-categories" }),
  ]);

  if (quote.status === 404 || shipment.status === 404) {
    notFound();
  }
  if (quote.status !== 200 || shipment.status !== 200) {
    throw new Error(`Le récapitulatif de paiement n'a pas pu être chargé.`);
  }

  const labels = Object.fromEntries(
    ((catalog.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  return (
    <CheckoutView
      quote={toCheckoutQuote(quote.body as RawCheckoutQuote)}
      shipment={toShipment(shipment.body as RawShipment)}
      labels={labels}
    />
  );
}
