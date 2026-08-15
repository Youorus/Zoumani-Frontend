"use client";

import { apiClient } from "@/lib/api/api-client";

import { toJourney, type Journey, type RawJourney } from "../types/tracking.types";

/** Les colis que je suis, aux deux bouts — expédiés et transportés. */
export async function listJourneys(): Promise<Journey[]> {
  const raw = await apiClient.get<RawJourney[]>("/journeys");
  return raw.map(toJourney);
}

/** Le suivi d'un colis. Accessible à l'expéditeur **et** au voyageur. */
export async function readJourney(journeyId: string): Promise<Journey> {
  return toJourney(await apiClient.get<RawJourney>(`/journeys/${journeyId}`));
}

/**
 * L'adresse de téléchargement de l'étiquette.
 *
 * Une route **de notre origine**, jamais celle du transporteur : la sienne
 * expire et serait partageable par quiconque la reçoit. Celle-ci vérifie
 * la session à chaque appel.
 */
export function labelUrl(shipmentId: string): string {
  return `/api/envois/${shipmentId}/etiquette`;
}

/** Ce qu'une annulation a réellement produit. */
export interface Cancellation {
  journeyId: string;
  refundedMinor: number;
  refundedMajor: string;
}

/**
 * Annule un envoi payé et déclenche le remboursement.
 *
 * Le montant rendu vient du serveur, jamais d'un calcul d'ici : deux
 * additions dans deux langages finissent par diverger d'un centime, et
 * c'est celle du serveur qui est virée.
 */
export async function cancelJourney(journeyId: string): Promise<Cancellation> {
  const raw = await apiClient.post<{
    journey_id: string;
    refunded_minor: number;
    refunded_major: string;
  }>(`/journeys/${journeyId}/cancellation`, {});
  return {
    journeyId: raw.journey_id,
    refundedMinor: raw.refunded_minor,
    refundedMajor: raw.refunded_major,
  };
}
