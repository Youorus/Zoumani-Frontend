import { validationFieldsOf } from "@/lib/api/api-errors";

export type TripSubmissionPhase = "trip" | "proof" | "capacity" | "submission";

const PHASE_LABELS: Record<TripSubmissionPhase, string> = {
  trip: "L'itinéraire n'a pas pu être enregistré.",
  proof: "Le justificatif n'a pas pu être enregistré.",
  capacity: "La place et les tarifs n'ont pas pu être enregistrés.",
  submission: "Le voyage n'a pas pu être envoyé à la vérification.",
};

const FIELD_LABELS: Record<string, string> = {
  airline_code: "Compagnie aérienne",
  flight_number: "Numéro de vol",
  origin_airport_code: "Aéroport de départ",
  destination_airport_code: "Aéroport d'arrivée",
  departure_at: "Heure de départ",
  arrival_at: "Heure d'arrivée",
  total_weight_kg: "Poids disponible",
  category_code: "Catégorie",
  price_minor: "Tarif",
  kind: "Type de justificatif",
  file: "Justificatif",
  version: "Version de l'engagement",
};

/** Rend les détails techniques du backend immédiatement corrigeables. */
export function describeTripSubmissionError(
  error: unknown,
  phase: TripSubmissionPhase,
): string {
  const fields = validationFieldsOf(error);
  if (fields.length === 0) {
    const message = error instanceof Error ? error.message : "Réessayez dans un instant.";
    return `${PHASE_LABELS[phase]} ${message}`;
  }

  const details = fields.map(({ field, reason }) => {
    const segment = field.split(".").at(-1) ?? field;
    const segmentIndex = field.match(/segments\.(\d+)/)?.[1];
    const offerIndex = field.match(/offers\.(\d+)/)?.[1];
    const base = FIELD_LABELS[segment] ?? "Information transmise";
    const suffix = segmentIndex
      ? ` du vol ${Number(segmentIndex) + 1}`
      : offerIndex
        ? ` de la catégorie ${Number(offerIndex) + 1}`
        : "";
    return `${base}${suffix} : ${translateReason(reason)}`;
  });

  return [PHASE_LABELS[phase], ...details].join("\n");
}

function translateReason(reason: string): string {
  if (/field required/i.test(reason)) {
    return "ce champ est obligatoire.";
  }
  if (/extra inputs are not permitted/i.test(reason)) {
    return "cette version de l'API ne reconnaît pas encore cette information.";
  }
  if (/valid number|valid integer/i.test(reason)) {
    return "indiquez un nombre valide.";
  }
  if (/at least/i.test(reason)) {
    return "la valeur indiquée est trop courte ou trop petite.";
  }
  return reason;
}
