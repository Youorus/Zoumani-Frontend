import { describe, expect, it } from "vitest";

import {
  stageOf,
  toRequests,
  toVerification,
  type VerificationStatus,
} from "./verification.types";

/**
 * La traduction des neuf statuts du serveur en quatre situations.
 *
 * C'est le seul endroit où cette réduction a lieu. La faire dans chaque
 * composant garantirait qu'un jour l'un d'eux oublie `resubmitted` et
 * affiche « refusé » à quelqu'un dont le dossier est en cours d'examen —
 * ce qui l'enverrait tout recommencer sans raison.
 */
describe("les neuf statuts ramenés à cinq situations", () => {
  it("range dans « en cours » ce sur quoi la personne n'a pas la main", () => {
    const attente: VerificationStatus[] = ["submitted", "under_review", "resubmitted"];

    for (const statut of attente) {
      expect(stageOf(statut)).toBe("en_cours");
    }
  });

  it("ne confond jamais « on vous attend » avec « vous attendez »", () => {
    /*
     * Le test le plus important de ce fichier.
     *
     * `action_required` est le seul statut où la balle est dans le camp
     * de la personne. Le ranger avec l'attente laisse un dossier bloqué
     * **des deux côtés** : elle patiente, l'opérateur patiente, et rien
     * n'avance jusqu'à ce que l'un des deux écrive au support. Beaucoup
     * abandonnent avant.
     */
    expect(stageOf("action_required")).toBe("a_corriger");
    expect(stageOf("action_required")).not.toBe("en_cours");
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
      expect(["absent", "en_cours", "a_corriger", "verifie", "refuse"]).toContain(
        stageOf(statut),
      );
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

describe("les demandes de correction", () => {
  const demande = {
    id: "req-1",
    kind: "replace_document" as const,
    status: "pending",
    message: "Le passeport est illisible dans le coin supérieur droit.",
    document_id: "doc-1",
    user_response: null,
    created_at: "2026-08-11T10:00:00Z",
    responded_at: null,
  };

  it("conserve le message de l'opérateur mot pour mot", () => {
    // Il a été écrit pour cette personne, à propos de ce document. Le
    // résumer en « un document est invalide » reviendrait à ne rien dire.
    expect(toRequests([demande])[0].message).toBe(
      "Le passeport est illisible dans le coin supérieur droit.",
    );
  });

  it("distingue une demande traitée d'une demande en attente", () => {
    const traitee = { ...demande, responded_at: "2026-08-11T11:00:00Z" };

    expect(toRequests([demande])[0].answered).toBe(false);
    expect(toRequests([traitee])[0].answered).toBe(true);
  });

  it("retient la pièce visée, quand la demande en vise une", () => {
    // Sans elle, on déposerait une pièce de plus au lieu de remplacer
    // celle qui pose problème — et le dossier repartirait avec les deux.
    expect(toRequests([demande])[0].documentId).toBe("doc-1");
  });
});
