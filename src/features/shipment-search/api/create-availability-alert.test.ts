import { afterEach, describe, expect, it, vi } from "vitest";

import { createAvailabilityAlert } from "./create-availability-alert";

describe("createAvailabilityAlert", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("persiste le trajet et le consentement via le backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "alert-1", state: "active" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createAvailabilityAlert({
        email: "awa@example.com",
        phone: "+33612345678",
        consent: true,
        origin: "CDG",
        destination: "ABJ",
        categories: ["clothing"],
        language: "fr",
      }),
    ).resolves.toEqual({ id: "alert-1" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/availability-alerts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "awa@example.com",
          phone: "+33612345678",
          consent: true,
          origin_airport_code: "CDG",
          destination_airport_code: "ABJ",
          category_codes: ["clothing"],
          language: "fr",
        }),
      }),
    );
  });
});
