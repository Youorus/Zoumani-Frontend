import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DeclareShipmentView } from "@/features/travel/components/declare-shipment-view";
import {
  toCapacity,
  type RawCapacity,
  type RawCatalog,
} from "@/features/travel/types/travel.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const capacityId = typeof params.capacity === "string" ? params.capacity : "";

  // Sans offre visée, il n'y a rien à déclarer : on renvoie chercher
  // plutôt que d'afficher un formulaire vide.
  if (!capacityId) {
    redirect("/compte");
  }

  const [offre, catalogue] = await Promise.all([
    callApi({ method: "GET", path: `/capacities/${capacityId}` }),
    callApi({ method: "GET", path: "/parcel-categories" }),
  ]);

  if (offre.status === 404) {
    notFound();
  }
  if (offre.status !== 200) {
    throw new Error(`L'API a répondu ${offre.status} sur /capacities/${capacityId}.`);
  }

  const labels = Object.fromEntries(
    ((catalogue.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  return (
    <DeclareShipmentView
      capacity={toCapacity(offre.body as RawCapacity)}
      labels={labels}
    />
  );
}
