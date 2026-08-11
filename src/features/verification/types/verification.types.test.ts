import { describe, expect, it } from "vitest";

import { stageOf, toVerification, type VerificationStatus } from "./verification.types";

/**
 * La traduction des neuf statuts du serveur en quatre situations.
 *
 * C'est le seul endroit où cette réduction a lieu. La faire dans chaque
 * composant garantirait qu'un jour l'un d'eux oublie `resubmitted` et
 * affiche « refusé » à quelqu'un dont le dossier est en cours d'examen —
 * ce qui l'enverrait tout recommencer sans raison.
 */
describe("les neuf statuts ramenés à quatre situations", () => {
  it("range tout ce qui attend une réponse dans « en cours »", () => {
    const attente: VerificationStatus[] = [
      "submitted",
      "under_review",
      "action_required",
      "resubmitted",
    ];

    for (const statut of attente) {
      expect(stageOf(statut)).toBe("en_cours");
    }
  });

  it("range le dossier périmé avec les refus, pas avec les absents", () => {
    // Un dossier périmé demande la même chose qu'un refus : reprendre le
    // formulaire. Le ranger avec « rien commencé » ferait croire qu'on
    // n'a jamais rien envoyé.
    expect(stageOf("expired")).toBe("refuse");
    expect(stageOf("rejected")).toBe("refuse");
  });

  it("distingue le brouillon d'un dossier transmis", () => {
    // Un brouillon n'a pas été transmis : la personne doit finir de le
    // remplir, pas attendre.
    expect(stageOf("draft")).toBe("absent");
    expect(stageOf("not_started")).toBe("absent");
  });

  it("reconnaît le dossier validé", () => {
    expect(stageOf("verified")).toBe("verifie");
  });

  it("couvre chaque statut, sans exception", () => {
    const tous: VerificationStatus[] = [
      "not_started",
      "draft",
      "submitted",
      "under_review",
      "action_required",
      "resubmitted",
      "verified",
      "rejected",
      "expired",
    ];

    for (const statut of tous) {
      expect(["absent", "en_cours", "verifie", "refuse"]).toContain(stageOf(statut));
    }
  });
});

describe("conversion du dossier", () => {
  const brut = {
    id: "abc",
    status: "rejected" as const,
    legal_first_name: "Awa",
    legal_last_name: null,
    date_of_birth: null,
    nationality: "CM",
    country_of_residence: null,
    residential_address: null,
    rejection_reason: "Document illisible.",
    submitted_at: "2026-08-11T10:00:00Z",
    verified_at: null,
    expires_at: null,
  };

  it("remplace les valeurs absentes par des chaînes vides", () => {
    // Ce sont des valeurs de formulaire : React refuse de passer d'un
    // champ non contrôlé à un champ contrôlé, et `null` déclencherait
    // exactement cette bascule au premier caractère saisi.
    const dossier = toVerification(brut);

    expect(dossier.legalLastName).toBe("");
    expect(dossier.residentialAddress).toBe("");
  });

  it("conserve le motif de refus tel quel", () => {
    // Le motif est rédigé pour être lu par la personne : le reformuler
    // ou le tronquer lui retirerait ce qui en fait une action.
    expect(toVerification(brut).rejectionReason).toBe("Document illisible.");
  });

  it("calcule la situation en même temps que la conversion", () => {
    expect(toVerification(brut).stage).toBe("refuse");
  });
});
