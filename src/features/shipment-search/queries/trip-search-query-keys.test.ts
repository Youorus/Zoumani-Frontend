import { describe, expect, it } from "vitest";

import { tripSearchQueryKeys } from "./trip-search-query-keys";

describe("tripSearchQueryKeys", () => {
  it("keeps every route search isolated in the cache", () => {
    const filters = { from: "paris", to: "abidjan", weight: 1, lang: "fr" } as const;
    expect(tripSearchQueryKeys.results(filters)).toEqual([
      "trip-search",
      "results",
      filters,
    ]);
  });
});
