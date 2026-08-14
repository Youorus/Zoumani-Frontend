import type { AvailabilityAlertInput } from "../schemas/availability-alert.schema";

export interface AvailabilityAlertPayload extends AvailabilityAlertInput {
  origin: string;
  destination: string;
  categories: string[];
  language: "fr" | "en";
}

export async function createAvailabilityAlert(payload: AvailabilityAlertPayload) {
  const response = await fetch("/api/proxy/availability-alerts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      phone: payload.phone,
      consent: payload.consent,
      origin_airport_code: payload.origin,
      destination_airport_code: payload.destination,
      category_codes: payload.categories,
      language: payload.language,
    }),
  });
  const body = (await response.json().catch(() => null)) as {
    id?: string;
    error?: { message?: string };
  } | null;
  if (!response.ok || !body?.id) {
    throw new Error(body?.error?.message ?? "L’alerte n’a pas pu être créée.");
  }
  return { id: body.id };
}
