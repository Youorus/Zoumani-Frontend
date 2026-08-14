import { describe, expect, it } from "vitest";

import { toOpenPayment, toPaymentState } from "./payment.types";

describe("contrat d'encaissement", () => {
  it("conserve le secret et la clé rendus par le serveur sans les inventer", () => {
    expect(
      toOpenPayment({
        payment_id: "payment-1",
        status: "pending",
        amount_minor: 2_190,
        amount_major: "21.90",
        currency: "EUR",
        client_secret: "cs_test_secret",
        publishable_key: "pk_test_public",
      }),
    ).toEqual({
      paymentId: "payment-1",
      status: "pending",
      amountMinor: 2_190,
      amountMajor: "21.90",
      currency: "EUR",
      clientSecret: "cs_test_secret",
      publishableKey: "pk_test_public",
    });
  });

  it("expose isPaid comme décision explicite du backend", () => {
    expect(
      toPaymentState({
        payment_id: "payment-1",
        status: "refunded",
        is_paid: false,
        amount_minor: 2_190,
        amount_major: "21.90",
        currency: "EUR",
        payment_method: "card",
      }),
    ).toMatchObject({ status: "refunded", isPaid: false });
  });
});
