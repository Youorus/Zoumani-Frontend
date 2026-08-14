import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShipmentDetailView } from "@/features/travel/components/shipment-detail-view";
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
  const [shipment, catalog] = await Promise.all([
    callApi({ method: "GET", path: `/shipments/${shipmentId}` }),
    callApi({ method: "GET", path: "/parcel-categories" }),
  ]);

  if (shipment.status === 404) {
    notFound();
  }
  if (shipment.status !== 200) {
    throw new Error(`L'API a répondu ${shipment.status} sur /shipments/${shipmentId}.`);
  }

  const labels = Object.fromEntries(
    ((catalog.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  return (
    <ShipmentDetailView
      shipment={toShipment(shipment.body as RawShipment)}
      labels={labels}
    />
  );
}
