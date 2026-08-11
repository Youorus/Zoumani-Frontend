import type { TripSearchFilters } from "../schemas/trip-search.schema";

export const tripSearchQueryKeys = {
  all: ["trip-search"] as const,
  results: (filters: TripSearchFilters) => [...tripSearchQueryKeys.all, "results", filters] as const,
};
