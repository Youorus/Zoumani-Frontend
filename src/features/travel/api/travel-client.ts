"use client";

import { AuthError } from "@/lib/auth/auth-client";

import {
  toCapacity,
  toCatalog,
  toFlightLookup,
  toOffer,
  type Airline,
  type Airport,
  type Capacity,
  type CategoryOffer,
  type Catalog,
  type FlightLookup,
  type RawAirport,
  type RawCapacity,
  type RawCatalog,
  type RawCategoryOffer,
  type RawFlightLookup,
} from "../types/travel.types";
import {
  toProof,
  toShipment,
  toRewards,
  toTrip,
  type Proof,
  type ProofKind,
  type RawPage,
  type HandoverMethod,
  type RawProof,
  type RawShipment,
  type ShipmentSummary,
  type RawRewards,
  type RawTrip,
  type Rewards,
  type Trip,
} from "../types/trip.types";

/**
 * Les appels du parcours de voyage, depuis le navigateur.
 *
 * Tous passent par `/api/proxy/…`, donc par le relais de même origine
 * qui ajoute le jeton côté serveur. Ce code ne voit jamais la session :
 * une faille XSS ne permettrait pas de la voler.
 */

const PROXY = "/api/proxy";

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { reason?: string; field?: string } };
  } | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
      payload?.error?.details?.field,
    );
  }
  return payload;
}

/**
 * Suggère des aéroports pour une frappe.
 *
 * Le classement vient du serveur : code exact d'abord, puis la ville,
 * puis le nom du terrain. Le refaire ici produirait un second ordre,
 * qui divergerait du premier au premier ajustement.
 *
 * Sous deux caractères, on n'appelle même pas : le serveur rendrait une
 * liste vide, autant s'épargner l'aller-retour.
 */
export async function searchAirports(
  query: string,
  signal?: AbortSignal,
): Promise<Airport[]> {
  if (query.trim().length < 2) {
    return [];
  }
  const response = await fetch(`${PROXY}/airports?q=${encodeURIComponent(query)}`, {
    signal,
  });
  return (await unwrap(response)) as RawAirport[] as Airport[];
}

/**
 * Suggère des compagnies pour une frappe.
 *
 * Cherche par **nom** autant que par code : presque personne ne connaît
 * « AF » de tête, mais tout le monde sait dire « Air France ».
 */
export async function searchAirlines(
  query: string,
  signal?: AbortSignal,
): Promise<Airline[]> {
  if (query.trim().length < 2) {
    return [];
  }
  const response = await fetch(
    `${PROXY}/airports/airlines?q=${encodeURIComponent(query)}`,
    {
      signal,
    },
  );
  return (await unwrap(response)) as Airline[];
}

/**
 * Demande à la source si le vol existe, et rend son horaire.
 *
 * **`unavailable` n'est pas un refus.** L'appelant doit le présenter
 * comme « nous n'avons pas pu vérifier », sinon un voyageur honnête
 * croit son vol inexistant un jour de panne.
 */
export async function lookupFlight(input: {
  airlineCode: string;
  flightNumber: string;
  departureDate: string;
  origin: string;
  destination: string;
}): Promise<FlightLookup> {
  const params = new URLSearchParams({
    airline_code: input.airlineCode,
    flight_number: input.flightNumber,
    departure_date: input.departureDate,
    origin: input.origin,
    destination: input.destination,
  });
  const response = await fetch(`${PROXY}/flights/lookup?${params}`, {
    cache: "no-store",
  });
  return toFlightLookup((await unwrap(response)) as RawFlightLookup);
}

/** Les catégories transportables et ce qui ne voyage jamais. */
export async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch(`${PROXY}/parcel-categories`);
  return toCatalog((await unwrap(response)) as RawCatalog);
}

/**
 * Les tarifs pratiqués la fois précédente.
 *
 * Rend un tableau vide au premier voyage. Ce n'est pas une erreur :
 * c'est un début, et l'interface ne doit rien signaler.
 */
export async function fetchLastPrices(): Promise<CategoryOffer[]> {
  const response = await fetch(`${PROXY}/capacities/last-prices`, { cache: "no-store" });
  const payload = (await unwrap(response)) as { offers: RawCategoryOffer[] };
  return payload.offers.map(toOffer);
}

export interface CapacityDraft {
  totalWeightKg: number;
  currency: string;
  offers: { categoryCode: string; priceMinor: number }[];
  notes?: string | null;
}

/** Crée l'offre de capacité d'un voyage vérifié. */
export async function offerCapacity(
  tripId: string,
  draft: CapacityDraft,
): Promise<Capacity> {
  const response = await fetch(`${PROXY}/trips/${tripId}/capacity`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      total_weight_kg: draft.totalWeightKg,
      currency: draft.currency,
      offers: draft.offers.map((offer) => ({
        category_code: offer.categoryCode,
        price_minor: offer.priceMinor,
      })),
      notes: draft.notes ?? null,
    }),
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/** Met l'offre sur le marché. */
export async function publishCapacity(capacityId: string): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}/publish`, {
    method: "POST",
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/** Retire l'offre. Les réservations confirmées survivent. */
export async function withdrawCapacity(capacityId: string): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}/withdraw`, {
    method: "POST",
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

export interface SegmentDraft {
  segmentOrder: number;
  airlineCode: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureAt: string;
  arrivalAt: string;
}

/** Déclare un voyage : un itinéraire, un ou plusieurs vols. */
export async function declareTrip(segments: SegmentDraft[]): Promise<{ id: string }> {
  const response = await fetch(`${PROXY}/trips`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      segments: segments.map((segment) => ({
        segment_order: segment.segmentOrder,
        airline_code: segment.airlineCode,
        flight_number: segment.flightNumber,
        origin_airport_code: segment.originAirportCode,
        destination_airport_code: segment.destinationAirportCode,
        departure_at: segment.departureAt,
        arrival_at: segment.arrivalAt,
      })),
    }),
  });
  return (await unwrap(response)) as { id: string };
}

export interface Attestation {
  version: string;
  text: string;
}

/**
 * Le texte d'engagement en vigueur, et sa version.
 *
 * Demandé au serveur plutôt que recopié ici : deux copies divergeraient,
 * et l'on ne saurait plus laquelle a été acceptée le jour d'un litige.
 */
export async function fetchAttestation(): Promise<Attestation> {
  const response = await fetch(`${PROXY}/trips/attestation`);
  return (await unwrap(response)) as Attestation;
}

/**
 * Transmet le voyage à la vérification, avec l'engagement du voyageur.
 *
 * La version est celle **affichée** à la personne : c'est ce qui permet
 * d'établir plus tard ce qu'elle a accepté. La renvoyer en dur ici
 * casserait la preuve au premier changement de texte.
 */
export async function submitTrip(
  tripId: string,
  attestationVersion: string,
): Promise<void> {
  const response = await fetch(`${PROXY}/trips/${tripId}/submission`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accepted: true, version: attestationVersion }),
  });
  await unwrap(response);
}

// ─── Gestion des voyages ───────────────────────────────────────────────

/** Les voyages du voyageur connecté, du départ le plus proche au plus lointain. */
export async function listMyTrips(): Promise<Trip[]> {
  const response = await fetch(`${PROXY}/trips`, { cache: "no-store" });
  const page = (await unwrap(response)) as RawPage<RawTrip>;
  return page.items.map(toTrip);
}

/** Un voyage et son itinéraire complet. */
export async function getTrip(tripId: string): Promise<Trip> {
  const response = await fetch(`${PROXY}/trips/${tripId}`, { cache: "no-store" });
  return toTrip((await unwrap(response)) as RawTrip);
}

/**
 * L'offre portée par un voyage, ou `null`.
 *
 * L'API répond 404 quand aucune n'existe. On le traduit en `null` :
 * ne pas avoir encore publié d'offre n'est pas une erreur.
 */
export async function getTripCapacity(tripId: string): Promise<Capacity | null> {
  const response = await fetch(`${PROXY}/trips/${tripId}/capacity`, {
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/**
 * Supprime un brouillon.
 *
 * Réservé aux voyages que rien n'engage. Dès qu'un dossier est transmis,
 * c'est l'annulation qui s'applique — elle laisse une trace, quand une
 * suppression n'en laisse aucune.
 */
export async function deleteTrip(tripId: string): Promise<void> {
  const response = await fetch(`${PROXY}/trips/${tripId}`, { method: "DELETE" });
  if (response.status === 204) {
    return;
  }
  await unwrap(response);
}

/** Annule un voyage transmis ou vérifié. */
export async function cancelTrip(tripId: string): Promise<void> {
  const response = await fetch(`${PROXY}/trips/${tripId}/cancellation`, {
    method: "POST",
  });
  await unwrap(response);
}

/** L'état du programme de fidélité du voyageur connecté. */
export async function fetchRewards(): Promise<Rewards> {
  const response = await fetch(`${PROXY}/rewards/me`, { cache: "no-store" });
  return toRewards((await unwrap(response)) as RawRewards);
}

/**
 * Remplace l'itinéraire d'un voyage.
 *
 * **Un remplacement, pas une retouche.** Corriger une escale change les
 * rangs, les correspondances et les bornes du voyage, qui ne se valident
 * que comme un tout — c'est le contrat de l'API, et l'écran d'édition
 * suit la même logique : il renvoie l'itinéraire entier.
 */
export async function updateItinerary(
  tripId: string,
  segments: SegmentDraft[],
): Promise<Trip> {
  const response = await fetch(`${PROXY}/trips/${tripId}/itinerary`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      segments: segments.map((segment) => ({
        segment_order: segment.segmentOrder,
        airline_code: segment.airlineCode,
        flight_number: segment.flightNumber,
        origin_airport_code: segment.originAirportCode,
        destination_airport_code: segment.destinationAirportCode,
        departure_at: segment.departureAt,
        arrival_at: segment.arrivalAt,
      })),
    }),
  });
  return toTrip((await unwrap(response)) as RawTrip);
}

/**
 * Un aéroport par son code, pour pré-remplir un formulaire.
 *
 * L'API de recherche répond sur un code exact — c'est son premier
 * critère de classement — ce qui évite une seconde route pour une seule
 * lecture.
 */
export async function findAirportByCode(code: string): Promise<Airport | null> {
  const trouves = await searchAirports(code);
  return trouves.find((airport) => airport.iata === code.toUpperCase()) ?? null;
}

/** Les preuves déposées sur un voyage. */
export async function listProofs(tripId: string): Promise<Proof[]> {
  const response = await fetch(`${PROXY}/trips/${tripId}/proofs`, {
    cache: "no-store",
  });
  const page = (await unwrap(response)) as RawPage<RawProof>;
  return page.items.map(toProof);
}

/**
 * Dépose une preuve de billet.
 *
 * Le fichier traverse l'API plutôt qu'une URL présignée : le document
 * doit être confronté à la politique du bucket **et** rattaché au voyage
 * dans la même opération. Un envoi direct laisserait, en cas d'abandon,
 * des billets orphelins dans le stockage.
 */
export async function uploadProof(
  tripId: string,
  kind: ProofKind,
  file: File,
): Promise<void> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);

  const response = await fetch(`${PROXY}/trips/${tripId}/proofs`, {
    method: "POST",
    body: form,
  });
  await unwrap(response);
}

/**
 * Remplace les tarifs et le poids d'une offre.
 *
 * Comme l'itinéraire, c'est un **remplacement** : la grille tarifaire se
 * valide comme un tout, et un état intermédiaire à deux prix
 * contradictoires n'a aucune raison d'exister.
 */
export async function updateCapacity(
  capacityId: string,
  draft: CapacityDraft,
): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      total_weight_kg: draft.totalWeightKg,
      currency: draft.currency,
      offers: draft.offers.map((offer) => ({
        category_code: offer.categoryCode,
        price_minor: offer.priceMinor,
      })),
      notes: draft.notes ?? null,
    }),
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

// ─── Les expéditions ───────────────────────────────────────────────────

export interface DeclaredLineInput {
  categoryCode: string;
  quantityKg?: number;
  pieces?: number;
  photoKey?: string | null;
  declaredValueMinor?: number | null;
}

/** L'offre visée, telle que l'expéditeur la voit avant de déclarer. */
export async function getCapacity(capacityId: string): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}`, {
    cache: "no-store",
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/** Crée la demande d'expédition sur une offre. */
export async function declareShipment(
  capacityId: string,
  lines: DeclaredLineInput[],
  handover: HandoverMethod = "in_person",
): Promise<ShipmentSummary> {
  const response = await fetch(`${PROXY}/shipments?capacity_id=${capacityId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lines: lines.map(toRawLine), handover }),
  });
  return toShipment((await unwrap(response)) as RawShipment);
}

/**
 * Dépose la photo d'un contenu et rend sa **clé**.
 *
 * La clé, jamais l'URL : une URL signée expire, et une URL publique
 * encoderait le fournisseur de stockage (AGENTS.md §6.12).
 */
export async function uploadParcelPhoto(shipmentId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${PROXY}/shipments/${shipmentId}/photos`, {
    method: "POST",
    body: form,
  });
  const payload = (await unwrap(response)) as { photo_key: string };
  return payload.photo_key;
}

/** Remplace le contenu déclaré. */
export async function updateShipment(
  shipmentId: string,
  lines: DeclaredLineInput[],
  handover: HandoverMethod = "in_person",
): Promise<ShipmentSummary> {
  const response = await fetch(`${PROXY}/shipments/${shipmentId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ lines: lines.map(toRawLine), handover }),
  });
  return toShipment((await unwrap(response)) as RawShipment);
}

/** Transmet la demande, en attente de paiement. */
export async function submitShipment(shipmentId: string): Promise<ShipmentSummary> {
  const response = await fetch(`${PROXY}/shipments/${shipmentId}/submission`, {
    method: "POST",
  });
  return toShipment((await unwrap(response)) as RawShipment);
}

/** Les expéditions de l'expéditeur connecté. */
export async function listMyShipments(): Promise<ShipmentSummary[]> {
  const response = await fetch(`${PROXY}/shipments`, { cache: "no-store" });
  return ((await unwrap(response)) as RawShipment[]).map(toShipment);
}

function toRawLine(line: DeclaredLineInput) {
  return {
    category_code: line.categoryCode,
    quantity_kg: line.quantityKg ?? null,
    pieces: line.pieces ?? null,
    photo_key: line.photoKey ?? null,
    declared_value_minor: line.declaredValueMinor ?? null,
  };
}
