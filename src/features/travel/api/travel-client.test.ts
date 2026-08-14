import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchHandoverOptions,
  findAirportByCode,
  searchAirports,
  updateShipment,
} from "./travel-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

const shipmentResponse = {
  id: "shipment-1",
  capacity_id: "capacity-1",
  status: "draft",
  handover: "carrier",
  service_point_code: "RELAY-1",
  carrier_code: "colissimo",
  currency: "EUR",
  lines: [],
  total_minor: 0,
  total_major: "0.00",
  weight_kg: 0,
  is_editable: true,
};

describe("contrat d'une expédition", () => {
  it("conserve le mode de remise choisi pendant la mise à jour", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(shipmentResponse), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await updateShipment("shipment-1", [], "carrier", {
      pointCode: "RELAY-1",
      carrierCode: "colissimo",
    });

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(options.body as string)).toEqual({
      lines: [],
      handover: "carrier",
      service_point_code: "RELAY-1",
      carrier_code: "colissimo",
    });
  });

  it("demande au serveur le forfait de retrait quand le voyageur l'accepte", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          advice: "either",
          distance_meters: 12_000,
          quotes: [],
          points_outcome: "none_nearby",
          service_points: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchHandoverOptions({
      latitude: 48.85,
      longitude: 2.35,
      countryCode: "FR",
      weightGrams: 2_000,
      withPickup: true,
    });

    expect(fetchMock.mock.calls[0][0]).toContain("with_pickup=true");
  });
});

describe("référentiel d'aéroports", () => {
  it("n'interroge pas le backend avant deux caractères", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchAirports("D")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("résout un code IATA depuis le backend sans base locale", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            iata: "DLA",
            icao: "FKKD",
            name: "Douala International Airport",
            city: "Douala",
            country: "CM",
            latitude: 4.006,
            longitude: 9.719,
            label: "Douala (DLA)",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(findAirportByCode("dla")).resolves.toMatchObject({
      iata: "DLA",
      city: "Douala",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/airports?q=dla",
      expect.objectContaining({ signal: undefined }),
    );
  });
});
