"use client";

import { useQuery } from "@tanstack/react-query";

import { getTripDetail } from "../api/get-trip-detail";
import { tripQueryKeys } from "../queries/trip-query-keys";

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: tripQueryKeys.detail(tripId),
    queryFn: () => getTripDetail(tripId),
    enabled: Boolean(tripId),
  });
}
