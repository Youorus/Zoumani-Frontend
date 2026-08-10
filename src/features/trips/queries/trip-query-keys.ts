export const tripQueryKeys = {
  all: ["trips"] as const,
  lists: () => [...tripQueryKeys.all, "list"] as const,
  list: (filters?: { transportMode?: string }) =>
    [...tripQueryKeys.lists(), filters ?? {}] as const,
  details: () => [...tripQueryKeys.all, "detail"] as const,
  detail: (tripId: string) => [...tripQueryKeys.details(), tripId] as const,
};
