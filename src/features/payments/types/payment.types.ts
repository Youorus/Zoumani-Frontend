export interface InsuranceOffer {
  providerCode: string;
  providerName: string;
  isSimulation: boolean;
  declaredValueMinor: number;
  premiumMinor: number;
  coverageMinor: number;
  deductibleMinor: number;
  rateBasisPoints: number;
  benefits: string[];
  disclaimer: string;
}

export interface RawInsuranceOffer {
  provider_code: string;
  provider_name: string;
  is_simulation: boolean;
  declared_value_minor: number;
  premium_minor: number;
  coverage_minor: number;
  deductible_minor: number;
  rate_basis_points: number;
  benefits: string[];
  disclaimer: string;
}

export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export interface CheckoutQuote {
  id: string;
  shipmentId: string;
  status: "prepared";
  currency: string;
  travelerMinor: number;
  shippingMinor: number;
  serviceFeeMinor: number;
  insurance: InsuranceOffer | null;
  totalMinor: number;
  totalMajor: string;
  availableMethods: PaymentMethod[];
  canPay: boolean;
}

export interface RawCheckoutQuote {
  id: string;
  shipment_id: string;
  status: "prepared";
  currency: string;
  traveler_minor: number;
  shipping_minor: number;
  service_fee_minor: number;
  insurance: RawInsuranceOffer | null;
  total_minor: number;
  total_major: string;
  available_methods: PaymentMethod[];
  can_pay: boolean;
}

export function toInsuranceOffer(raw: RawInsuranceOffer): InsuranceOffer {
  return {
    providerCode: raw.provider_code,
    providerName: raw.provider_name,
    isSimulation: raw.is_simulation,
    declaredValueMinor: raw.declared_value_minor,
    premiumMinor: raw.premium_minor,
    coverageMinor: raw.coverage_minor,
    deductibleMinor: raw.deductible_minor,
    rateBasisPoints: raw.rate_basis_points,
    benefits: raw.benefits,
    disclaimer: raw.disclaimer,
  };
}

export function toCheckoutQuote(raw: RawCheckoutQuote): CheckoutQuote {
  return {
    id: raw.id,
    shipmentId: raw.shipment_id,
    status: raw.status,
    currency: raw.currency,
    travelerMinor: raw.traveler_minor,
    shippingMinor: raw.shipping_minor,
    serviceFeeMinor: raw.service_fee_minor,
    insurance: raw.insurance ? toInsuranceOffer(raw.insurance) : null,
    totalMinor: raw.total_minor,
    totalMajor: raw.total_major,
    availableMethods: raw.available_methods,
    canPay: raw.can_pay,
  };
}
