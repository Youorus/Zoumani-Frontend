"use client";

import { useMutation } from "@tanstack/react-query";

import { createAvailabilityAlert } from "../api/create-availability-alert";

export function useAvailabilityAlert() {
  return useMutation({ mutationFn: createAvailabilityAlert });
}
