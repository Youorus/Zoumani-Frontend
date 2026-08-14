import { afterEach, describe, expect, it, vi } from "vitest";

import { getPayment, openPayment } from "./payment-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("client de paiement", () => {
  it("ouvre une session sans jamais transmettre de montant", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          payment_id: "payment-1",
          status: "pending",
          amount_minor: 2_190,
          amount_major: "21.90",
          currency: "EUR",
          client_secret: "cs_test_secret",
          publishable_key: "pk_test_public",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openPayment("shipment-1", "/paiement/retour?shipment_id=shipment-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/payments/shipments/shipment-1/payment",
      expect.objectContaining({ method: "POST" }),
    );
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      return_path: "/paiement/retour?shipment_id=shipment-1",
    });
  });

  it("lit l'état confirmé par le backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          payment_id: "payment-1",
          status: "succeeded",
          is_paid: true,
          amount_minor: 2_190,
          amount_major: "21.90",
          currency: "EUR",
          payment_method: "card",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPayment("payment-1")).resolves.toMatchObject({
      paymentId: "payment-1",
      isPaid: true,
      amountMajor: "21.90",
    });
  });
});
