"use client";

import { AuthError } from "@/lib/auth/auth-client";

import type {
  ProofKind,
  ProofStatus,
  TripStatus,
} from "@/features/travel/types/trip.types";

const BASE = "/api/proxy/admin/trips";

export type TripVerificationMethod =
  | "booking_api"
  | "flight_api_and_document"
  | "e_ticket_document"
  | "boarding_pass"
  | "manual_review";

export interface AdminTripSegment {
  id: string;
  segment_order: number;
  airline_code: string;
  flight_number: string;
  flight_designator: string;
  origin_airport_code: string;
  destination_airport_code: string;
  departure_at: string;
  arrival_at: string;
  status: string;
}

export interface AdminTrip {
  id: string;
  traveler_user_id: string;
  status: TripStatus;
  origin_airport_code: string;
  destination_airport_code: string;
  departure_at: string;
  arrival_at: string;
  segments: AdminTripSegment[];
  verification_method: TripVerificationMethod | null;
  rejection_reason: string | null;
  correction_note: string | null;
  assigned_to: string | null;
  submitted_at: string | null;
  review_started_at: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface AdminTripProof {
  id: string;
  kind: ProofKind;
  status: ProofStatus;
  content_type: string;
  size_bytes: number;
  version: number;
  replaces_id: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { reason?: string } };
  } | null;
  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
    );
  }
  return payload;
}

export async function listAdminTrips(status: TripStatus): Promise<AdminTrip[]> {
  const query = new URLSearchParams({ status, limit: "50", direction: "asc" });
  const payload = (await unwrap(
    await fetch(`${BASE}?${query}`, { cache: "no-store" }),
  )) as { items: AdminTrip[] };
  return payload.items;
}

export async function getAdminTrip(id: string): Promise<{
  trip: AdminTrip;
  proofs: AdminTripProof[];
}> {
  const [trip, proofs] = await Promise.all([
    unwrap(await fetch(`${BASE}/${id}`, { cache: "no-store" })) as Promise<AdminTrip>,
    unwrap(await fetch(`${BASE}/${id}/proofs`, { cache: "no-store" })) as Promise<
      AdminTripProof[]
    >,
  ]);
  return { trip, proofs };
}

export async function takeTripForReview(id: string): Promise<void> {
  await unwrap(await fetch(`${BASE}/${id}/review`, { method: "POST" }));
}

export async function getTripProofUrl(tripId: string, proofId: string): Promise<string> {
  const payload = (await unwrap(
    await fetch(`${BASE}/${tripId}/proofs/${proofId}/download`, {
      cache: "no-store",
    }),
  )) as { url: string };
  return payload.url;
}

export async function acceptTripProof(tripId: string, proofId: string): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${tripId}/proofs/${proofId}/acceptance`, { method: "POST" }),
  );
}

export async function rejectTripProof(
  tripId: string,
  proofId: string,
  reason: string,
): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${tripId}/proofs/${proofId}/rejection`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

export async function verifyAdminTrip(
  id: string,
  method: TripVerificationMethod,
): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/verification`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method }),
    }),
  );
}

export async function rejectAdminTrip(id: string, reason: string): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/rejection`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

export async function requestTripCorrection(id: string, note: string): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/correction-request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    }),
  );
}
