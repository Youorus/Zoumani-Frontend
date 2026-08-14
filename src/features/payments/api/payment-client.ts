"use client";

import { apiClient } from "@/lib/api/api-client";

import {
  toCheckoutQuote,
  toInsuranceOffer,
  toOpenPayment,
  toPaymentState,
  toServiceFeeQuote,
  type CheckoutQuote,
  type InsuranceOffer,
  type OpenPayment,
  type PaymentState,
  type RawCheckoutQuote,
  type RawInsuranceOffer,
  type RawOpenPayment,
  type RawPaymentState,
  type RawServiceFeeQuote,
  type ServiceFeeQuote,
} from "../types/payment.types";

export interface DeclaredValueInput {
  categoryCode: string;
  declaredValueMinor: number;
}

export async function estimateServiceFee(
  travelerMinor: number,
  currency: string,
): Promise<ServiceFeeQuote> {
  const raw = await apiClient.post<RawServiceFeeQuote>("/payments/service-fee/quote", {
    body: {
      traveler_minor: travelerMinor,
      currency,
    },
  });
  return toServiceFeeQuote(raw);
}

export async function estimateInsurance(
  values: DeclaredValueInput[],
  currency: string,
): Promise<InsuranceOffer> {
  const raw = await apiClient.post<RawInsuranceOffer>("/payments/insurance/quote", {
    body: {
      currency,
      values: values.map((value) => ({
        category_code: value.categoryCode,
        declared_value_minor: value.declaredValueMinor,
      })),
    },
  });
  return toInsuranceOffer(raw);
}

export async function prepareCheckout(
  shipmentId: string,
  insuranceSelected: boolean,
): Promise<CheckoutQuote> {
  const raw = await apiClient.put<RawCheckoutQuote>(
    `/payments/shipments/${shipmentId}/quote`,
    { body: { insurance_selected: insuranceSelected } },
  );
  return toCheckoutQuote(raw);
}

export async function getCheckout(shipmentId: string): Promise<CheckoutQuote> {
  const raw = await apiClient.get<RawCheckoutQuote>(
    `/payments/shipments/${shipmentId}/quote`,
  );
  return toCheckoutQuote(raw);
}

/**
 * Ouvre la Checkout Session qui correspond au devis persistant.
 *
 * Aucun montant ne traverse cette requête : le serveur relit son propre
 * devis, ce qui empêche le navigateur de fixer le prix à payer.
 */
export async function openPayment(
  shipmentId: string,
  returnPath: string,
): Promise<OpenPayment> {
  const raw = await apiClient.post<RawOpenPayment>(
    `/payments/shipments/${shipmentId}/payment`,
    { body: { return_path: returnPath } },
  );
  return toOpenPayment(raw);
}

/** Lit la décision du serveur, elle-même alimentée par le webhook Stripe. */
export async function getPayment(
  paymentId: string,
  signal?: AbortSignal,
): Promise<PaymentState> {
  const raw = await apiClient.get<RawPaymentState>(
    `/payments/payments/${encodeURIComponent(paymentId)}`,
    { signal },
  );
  return toPaymentState(raw);
}
