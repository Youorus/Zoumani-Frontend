"use client";

import { apiClient } from "@/lib/api/api-client";

import {
  toCheckoutQuote,
  toInsuranceOffer,
  type CheckoutQuote,
  type InsuranceOffer,
  type RawCheckoutQuote,
  type RawInsuranceOffer,
} from "../types/payment.types";

export interface DeclaredValueInput {
  categoryCode: string;
  declaredValueMinor: number;
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
