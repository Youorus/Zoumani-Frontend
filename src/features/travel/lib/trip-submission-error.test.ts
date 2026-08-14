import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/api-errors";

import { describeTripSubmissionError } from "./trip-submission-error";

describe("erreurs de création d'un voyage", () => {
  it("rend le champ backend compréhensible et indique le vol concerné", () => {
    const error = new ApiError({
      status: 422,
      code: "invalid_input",
      message: "La requête est invalide.",
      details: {
        fields: [
          {
            field: "segments.0.flight_number",
            reason: "Field required",
          },
        ],
      },
    });

    expect(describeTripSubmissionError(error, "trip")).toContain(
      "Numéro de vol du vol 1 : ce champ est obligatoire.",
    );
  });

  it("conserve le message métier quand aucun champ n'est en cause", () => {
    const error = new ApiError({
      status: 409,
      code: "rule_violation",
      message: "Ce voyage est déjà transmis.",
    });

    expect(describeTripSubmissionError(error, "submission")).toContain(
      "Ce voyage est déjà transmis.",
    );
  });
});
