import type { Metadata } from "next";

import { MyShipmentsView } from "@/features/travel/components/my-shipments-view";
import type { RawCatalog } from "@/features/travel/types/travel.types";
import { toShipment, type RawShipment } from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const [envois, catalogue] = await Promise.all([
    callApi({ method: "GET", path: "/shipments" }),
    callApi({ method: "GET", path: "/parcel-categories" }),
  ]);

  if (envois.status !== 200) {
    throw new Error(`L'API a répondu ${envois.status} sur /shipments.`);
  }

  const labels = Object.fromEntries(
    ((catalogue.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  return (
    <MyShipmentsView
      shipments={(envois.body as RawShipment[]).map(toShipment)}
      labels={labels}
    />
  );
}
