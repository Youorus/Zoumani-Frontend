import type { Metadata } from "next";

import { SearchResultsView } from "@/features/shipment-search/components/search-results-view";
import { shipmentSearchContent } from "@/features/shipment-search/content/search-content";
import { parseTripSearchParams } from "@/features/shipment-search/schemas/trip-search.schema";
import { VisitorFlowPage } from "@/features/visitor-flow/components/visitor-flow-page";

export const metadata: Metadata = {
  title: "Voyageurs disponibles",
  description: "Trouvez un voyageur de confiance pour acheminer votre colis avec Zoumani.",
  robots: { index: false, follow: false },
};

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseTripSearchParams(await searchParams);
  const language = filters.lang;

  return (
    <VisitorFlowPage
      contextLabel={shipmentSearchContent[language].contextLabel}
      language={language}
    >
      <SearchResultsView filters={filters} language={language} />
    </VisitorFlowPage>
  );
}
