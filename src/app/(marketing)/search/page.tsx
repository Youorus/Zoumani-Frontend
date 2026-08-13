import type { Metadata } from "next";

import { SearchResultsView } from "@/features/travel/components/search-results-view";
import type { RawCatalog } from "@/features/travel/types/travel.types";
import {
  toCapacityMatch,
  type RawCapacityMatch,
} from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  title: "Trouver un voyageur",
  description: "Les voyageurs qui desservent votre trajet, et ce qu'ils acceptent.",
};

/*
 * Jamais figée : les résultats dépendent des offres publiées à
 * l'instant, et la distance de qui regarde.
 */
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const origin = typeof params.origin === "string" ? params.origin : "";
  const destination = typeof params.destination === "string" ? params.destination : "";
  const categories =
    typeof params.categories === "string"
      ? [params.categories]
      : (params.categories ?? []);

  // Sans trajet, rien à chercher : on rend l'écran vide avec sa barre
  // plutôt qu'une erreur — l'utilisateur arrive parfois par un lien
  // tronqué ou un favori.
  if (!origin || !destination) {
    return (
      <SearchResultsView
        matches={[]}
        criteria={{ origin, destination, categories }}
        labels={{}}
      />
    );
  }

  const requete = new URLSearchParams({ origin, destination });
  for (const code of categories) {
    requete.append("categories", code);
  }

  // Le catalogue accompagne la recherche : les résultats portent des
  // codes de catégorie, et les traduire côté client supposerait un
  // second aller-retour avant le premier affichage.
  const [resultats, catalogue] = await Promise.all([
    callApi({ method: "GET", path: `/capacities/search?${requete.toString()}` }),
    callApi({ method: "GET", path: "/parcel-categories" }),
  ]);

  const labels = Object.fromEntries(
    ((catalogue.body as RawCatalog | undefined)?.categories ?? []).map((category) => [
      category.code,
      category.label,
    ]),
  );

  return (
    <SearchResultsView
      matches={
        resultats.status === 200
          ? (resultats.body as RawCapacityMatch[]).map(toCapacityMatch)
          : []
      }
      criteria={{ origin, destination, categories }}
      labels={labels}
    />
  );
}
