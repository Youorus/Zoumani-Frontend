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

export interface ServiceFeeQuote {
  travelerMinor: number;
  serviceFeeMinor: number;
  currency: string;
}

export interface RawServiceFeeQuote {
  traveler_minor: number;
  service_fee_minor: number;
  currency: string;
}

export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "expired" | "refunded";

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

export interface OpenPayment {
  paymentId: string;
  status: "pending";
  amountMinor: number;
  amountMajor: string;
  currency: string;
  clientSecret: string;
  publishableKey: string;
}

export interface RawOpenPayment {
  payment_id: string;
  status: "pending";
  amount_minor: number;
  amount_major: string;
  currency: string;
  client_secret: string;
  publishable_key: string;
}

export interface PaymentState {
  paymentId: string;
  /** L'expédition réglée — pour conduire au suivi une fois confirmé. */
  shipmentId: string;
  status: PaymentStatus;
  isPaid: boolean;
  amountMinor: number;
  amountMajor: string;
  currency: string;
  paymentMethod: string | null;
}

export interface RawPaymentState {
  payment_id: string;
  shipment_id: string;
  status: PaymentStatus;
  is_paid: boolean;
  amount_minor: number;
  amount_major: string;
  currency: string;
  payment_method: string | null;
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

export function toServiceFeeQuote(raw: RawServiceFeeQuote): ServiceFeeQuote {
  return {
    travelerMinor: raw.traveler_minor,
    serviceFeeMinor: raw.service_fee_minor,
    currency: raw.currency,
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

export function toOpenPayment(raw: RawOpenPayment): OpenPayment {
  return {
    paymentId: raw.payment_id,
    status: raw.status,
    amountMinor: raw.amount_minor,
    amountMajor: raw.amount_major,
    currency: raw.currency,
    clientSecret: raw.client_secret,
    publishableKey: raw.publishable_key,
  };
}

export function toPaymentState(raw: RawPaymentState): PaymentState {
  return {
    paymentId: raw.payment_id,
    shipmentId: raw.shipment_id,
    status: raw.status,
    isPaid: raw.is_paid,
    amountMinor: raw.amount_minor,
    amountMajor: raw.amount_major,
    currency: raw.currency,
    paymentMethod: raw.payment_method,
  };
}
