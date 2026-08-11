"use client";

import { useQuery } from "@tanstack/react-query";

import { searchTrips } from "../api/search-trips";
import { tripSearchQueryKeys } from "../queries/trip-search-query-keys";
import type { TripSearchFilters } from "../schemas/trip-search.schema";

export function useTripSearch(filters: TripSearchFilters) {
  return useQuery({
    queryKey: tripSearchQueryKeys.results(filters),
    queryFn: ({ signal }) => searchTrips(filters, signal),
    staleTime: 60_000,
  });
}
