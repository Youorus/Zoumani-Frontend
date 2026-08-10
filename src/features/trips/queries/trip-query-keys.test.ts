import { describe, expect, it } from "vitest";

import { tripQueryKeys } from "./trip-query-keys";

describe("tripQueryKeys", () => {
  it("creates stable keys for list and detail queries", () => {
    expect(tripQueryKeys.lists()).toEqual(["trips", "list"]);
    expect(tripQueryKeys.detail("trip-1")).toEqual(["trips", "detail", "trip-1"]);
  });
});
