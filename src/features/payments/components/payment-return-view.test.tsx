import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PaymentState } from "../types/payment.types";
import { getPayment } from "../api/payment-client";
import { PaymentReturnView } from "./payment-return-view";

vi.mock("../api/payment-client", () => ({
  getPayment: vi.fn(),
}));

const pending: PaymentState = {
  paymentId: "payment-1",
  status: "pending",
  isPaid: false,
  amountMinor: 2_190,
  amountMajor: "21.90",
  currency: "EUR",
  paymentMethod: null,
};

describe("retour de paiement", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getPayment).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.sessionStorage.clear();
  });

  it("n'annonce le succès que lorsque le backend rend isPaid", async () => {
    vi.mocked(getPayment)
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce({ ...pending, status: "succeeded", isPaid: true });

    render(
      <PaymentReturnView
        paymentIdFromUrl="payment-1"
        shipmentIdFromUrl="shipment-1"
        fallbackAmountMajor="21.90"
        fallbackCurrency="EUR"
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(getPayment).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: /confirmons votre paiement/i })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_500);
    });

    expect(screen.getByRole("heading", { name: "C'est confirmé." })).toBeInTheDocument();
  });

  it("présente une confirmation différée plutôt qu'un échec après vingt secondes", async () => {
    vi.mocked(getPayment).mockResolvedValue(pending);

    render(
      <PaymentReturnView
        paymentIdFromUrl="payment-1"
        shipmentIdFromUrl="shipment-1"
        fallbackAmountMajor="21.90"
        fallbackCurrency="EUR"
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(21_000);
    });

    expect(
      screen.getByRole("heading", { name: /en cours de traitement/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/compte à rebours/i)).not.toBeInTheDocument();
  });
});
