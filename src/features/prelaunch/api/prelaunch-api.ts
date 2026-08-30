import { env } from "@/lib/env/env";
import type { Attribution } from "@/lib/marketing/attribution";

/**
 * L'envoi d'une préinscription à l'API Zoumani.
 *
 * ═══ Il ne prétend jamais avoir enregistré ═══
 *
 * Sans `NEXT_PUBLIC_API_URL`, il refuse d'envoyer. Un tunnel qui affiche
 * « merci » sans rien transmettre produit des inscriptions perdues qu'on
 * croit acquises — et l'on ne s'en aperçoit qu'en cherchant la liste.
 *
 * ═══ Le seul appel réseau du site ═══
 *
 * La vitrine reste statique et muette. Si l'API tombe, la page s'affiche
 * entière et seul ce formulaire échoue, en le disant.
 */

export type Intention = "sender" | "traveler";
export type Timing = "asap" | "weeks" | "months" | "on_date";

/**
 * Une extrémité de corridor.
 *
 * Deux champs et non une chaîne : « Paris → Douala » écrit d'un bloc ne
 * se regroupe pas, et c'est ce regroupement qui dit où ouvrir en premier.
 */
export type Place = { city: string; countryCode?: string };

export type LeadDraft = {
  intention: Intention;
  firstName: string;
  origin: Place;
  destination: Place;
  email?: string;
  phone?: string;
  timing: Timing;
  travelOn?: string;
  parcelKind?: string;
  weightBracket?: string;
  consent: boolean;
};

export type RegisteredLead = {
  id: string;
  intention: Intention;
  firstName: string;
  originCity: string;
  destinationCity: string;
  /** Vrai quand cette personne s'était déjà inscrite de ce côté du
   *  marché : un double clic n'est pas une seconde inscription. */
  alreadyKnown: boolean;
};

export class PrelaunchUnavailable extends Error {
  constructor() {
    super("Les inscriptions ne sont pas encore ouvertes. Réessayez bientôt.");
    this.name = "PrelaunchUnavailable";
  }
}

/** Écarte les chaînes vides : le serveur refuse `""` là où il accepte l'absence. */
function trimmed(value: string | undefined): string | undefined {
  const clean = value?.trim();
  return clean ? clean : undefined;
}

export async function registerLead(
  draft: LeadDraft,
  attribution: Attribution,
): Promise<RegisteredLead> {
  const base = env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) throw new PrelaunchUnavailable();

  const response = await fetch(`${base}/prelaunch/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intention: draft.intention,
      first_name: draft.firstName.trim(),
      origin: { city: draft.origin.city.trim(), country_code: trimmed(draft.origin.countryCode) },
      destination: {
        city: draft.destination.city.trim(),
        country_code: trimmed(draft.destination.countryCode),
      },
      email: trimmed(draft.email)?.toLowerCase(),
      phone: trimmed(draft.phone),
      timing: draft.timing,
      travel_on: trimmed(draft.travelOn),
      parcel_kind: trimmed(draft.parcelKind),
      weight_bracket: trimmed(draft.weightBracket),
      consent: draft.consent,
      attribution,
    }),
  });

  if (!response.ok) {
    // Le serveur nomme la règle enfreinte — contact manquant, trajet
    // incomplet — et il le dit pour être lu.
    const detail = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      detail?.error?.message ?? "L’inscription n’a pas abouti. Réessayez dans un instant.",
    );
  }

  const body = (await response.json()) as {
    id: string;
    intention: Intention;
    first_name: string;
    origin_city: string;
    destination_city: string;
    already_known: boolean;
  };

  return {
    id: body.id,
    intention: body.intention,
    firstName: body.first_name,
    originCity: body.origin_city,
    destinationCity: body.destination_city,
    alreadyKnown: body.already_known,
  };
}
