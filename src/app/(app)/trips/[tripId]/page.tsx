import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getQueryClient } from "@/lib/query/query-client";

import { getTripDetail } from "@/features/trips/api/get-trip-detail";
import { TripDetailView } from "@/features/trips/components/trip-detail-view";
import { tripQueryKeys } from "@/features/trips/queries/trip-query-keys";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: tripQueryKeys.detail(tripId),
    queryFn: () => getTripDetail(tripId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container className="space-y-8">
        <PageHeader
          eyebrow="Trip Detail"
          title="Detail d’un voyage"
          description="Exemple complet de detail hydrate, mis a jour ensuite via hook client et evenement realtime."
        />
        <TripDetailView tripId={tripId} />
      </Container>
    </HydrationBoundary>
  );
}
