import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { DeclareShipmentView } from "@/features/travel/components/declare-shipment-view";
import type { RawCatalog } from "@/features/travel/types/travel.types";
import {
  toCapacityFromMatch,
  toCapacityMatch,
  type RawCapacityMatch,
} from "@/features/travel/types/trip.types";
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

  // Le dossier d'identité accompagne l'offre : c'est de lui que vient la
  // position qui permet de proposer des points de dépôt proches. Les
  // trois appels partent ensemble — les enchaîner tripleraient l'attente.
  const [offre, catalogue, dossier] = await Promise.all([
    // `/offer` et non `/capacities/{id}` : la seconde n'ouvre l'offre
    // qu'à son voyageur, et un expéditeur y recevait un 404.
    callApi({ method: "GET", path: `/capacities/${capacityId}/offer` }),
    callApi({ method: "GET", path: "/parcel-categories" }),
    callApi({ method: "GET", path: "/identity-verifications/me" }),
  ]);

  if (offre.status === 404) {
    notFound();
  }
  if (offre.status !== 200) {
    throw new Error(
      `L'API a répondu ${offre.status} sur /capacities/${capacityId}/offer.`,
    );
  }

  const labels = Object.fromEntries(
    ((catalogue.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  // Une position absente n'est pas une erreur : le géocodage échoue
  // parfois sur ce corridor. Le choix logistique expliquera alors ce
  // qu'il manque au lieu d'inventer un point de dépôt.
  const verification =
    dossier.status === 200
      ? (dossier.body as {
          address_latitude: number | null;
          address_longitude: number | null;
          country_of_residence: string | null;
        })
      : null;
  const sender =
    verification?.address_latitude != null &&
    verification.address_longitude != null &&
    verification.country_of_residence
      ? {
          latitude: verification.address_latitude,
          longitude: verification.address_longitude,
          countryCode: verification.country_of_residence,
        }
      : null;

  const rawMatch = offre.body as RawCapacityMatch;
  const match = toCapacityMatch(rawMatch);

  return (
    <DeclareShipmentView
      capacity={toCapacityFromMatch(rawMatch)}
      match={match}
      labels={labels}
      sender={sender}
      distanceMeters={match.distanceMeters}
    />
  );
}
