"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "zoumani:pending-payment";

interface PendingPaymentReference {
  paymentId: string;
  shipmentId: string;
}

/** Seuls deux identifiants non sensibles survivent à une redirection Stripe. */
export function rememberPendingPayment(reference: PendingPaymentReference): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reference));
  } catch {
    // Le mode privé peut refuser le stockage : le retour par carte garde l'id dans l'URL.
  }
}

export function forgetPendingPayment(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Rien d'autre à nettoyer si le stockage est indisponible.
  }
}

const noSubscription = () => () => undefined;
const clientReady = () => true;
const serverNotReady = () => false;
const serverSnapshot = () => null;

function storageSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Lit le stockage après l'hydratation, sans provoquer de rendu en cascade. */
export function usePendingPaymentReference(): PendingPaymentReference | null {
  const snapshot = useSyncExternalStore(noSubscription, storageSnapshot, serverSnapshot);
  if (!snapshot) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "paymentId" in parsed &&
      "shipmentId" in parsed &&
      typeof parsed.paymentId === "string" &&
      typeof parsed.shipmentId === "string"
    ) {
      return { paymentId: parsed.paymentId, shipmentId: parsed.shipmentId };
    }
  } catch {
    return null;
  }
  return null;
}

export function useClientReady(): boolean {
  return useSyncExternalStore(noSubscription, clientReady, serverNotReady);
}
