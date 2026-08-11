import { SearchLoading } from "@/features/shipment-search/components/search-loading";
import { shipmentSearchContent } from "@/features/shipment-search/content/search-content";
import { VisitorFlowPage } from "@/features/visitor-flow/components/visitor-flow-page";

export default function LoadingSearchPage() {
  return (
    <VisitorFlowPage contextLabel={shipmentSearchContent.fr.contextLabel} language="fr">
      <SearchLoading language="fr" />
    </VisitorFlowPage>
  );
}
