import { z } from "zod";

import { searchCities } from "../data/search-cities";

const cityValues = new Set(searchCities.map(({ value }) => value));

export const tripSearchFiltersSchema = z.object({
  from: z
    .string()
    .refine((value) => cityValues.has(value))
    .default("paris"),
  to: z
    .string()
    .refine((value) => cityValues.has(value))
    .default("abidjan"),
  weight: z.coerce.number().int().min(1).max(30).default(1),
  lang: z.enum(["fr", "en"]).default("fr"),
});

export type TripSearchFilters = z.infer<typeof tripSearchFiltersSchema>;

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseTripSearchParams(searchParams: RawSearchParams): TripSearchFilters {
  const parsed = tripSearchFiltersSchema.safeParse({
    from: firstValue(searchParams.from),
    to: firstValue(searchParams.to),
    weight: firstValue(searchParams.weight),
    lang: firstValue(searchParams.lang),
  });

  return parsed.success ? parsed.data : tripSearchFiltersSchema.parse({});
}
