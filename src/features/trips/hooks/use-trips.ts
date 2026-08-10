"use client";

import { useQuery } from "@tanstack/react-query";

import { getTrips } from "../api/get-trips";
import { tripQueryKeys } from "../queries/trip-query-keys";

export function useTrips() {
  return useQuery({
    queryKey: tripQueryKeys.lists(),
    queryFn: getTrips,
  });
}
