import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getQueryClient } from "@/lib/query/query-client";

import { getTrips } from "@/features/trips/api/get-trips";
import { TripsListView } from "@/features/trips/components/trips-list-view";
import { tripQueryKeys } from "@/features/trips/queries/trip-query-keys";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: tripQueryKeys.lists(),
    queryFn: getTrips,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container className="space-y-8">
        <PageHeader
          eyebrow="Feature Reference"
          title="Trips"
          description="Feature pilote branchee sur l’API client, TanStack Query, les composants metier et les etats de chargement uniformes."
        />
        <TripsListView />
      </Container>
    </HydrationBoundary>
  );
}
