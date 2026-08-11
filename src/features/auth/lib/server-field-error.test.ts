import { describe, expect, it } from "vitest";

import { AuthError } from "@/lib/auth/auth-client";

import { registrationFieldError } from "./server-field-error";

function refus(message: string, reason: string, field?: string) {
  return new AuthError(message, reason, 409, field);
}

describe("refus du serveur porté au bon champ", () => {
  it("désigne le numéro quand il est déjà pris", () => {
    // Le cas réel : un compte existe déjà avec ce téléphone. Affiché en
    // bandeau tout en haut, ce message oblige à relire le formulaire pour
    // deviner de quel champ il parle.
    const erreur = registrationFieldError(
      refus(
        "Un compte utilise déjà ce numéro de téléphone.",
        "user_phone_already_exists",
        "phone_number",
      ),
    );

    expect(erreur).toEqual({
      field: "phoneNationalNumber",
      message: "Un compte utilise déjà ce numéro de téléphone.",
    });
  });

  it("désigne le pays quand le numéro appartient à un autre", () => {
    // Ici c'est bien le drapeau qu'il faut changer, pas le numéro.
    const erreur = registrationFieldError(
      refus(
        "Ce numéro n'appartient pas au pays sélectionné.",
        "user_phone_country_mismatch",
        "phone_country_code",
      ),
    );

    expect(erreur?.field).toBe("phoneCountryCode");
  });

  it("traduit chaque champ de l'API vers son nom dans le formulaire", () => {
    const attendus: Array<[string, string]> = [
      ["first_name", "firstName"],
      ["last_name", "lastName"],
      ["phone_national_number", "phoneNationalNumber"],
      ["accepts_terms", "acceptsTerms"],
      ["accepts_privacy_policy", "acceptsPrivacyPolicy"],
    ];

    for (const [cote_api, cote_formulaire] of attendus) {
      expect(registrationFieldError(refus("peu importe", "x", cote_api))?.field).toBe(
        cote_formulaire,
      );
    }
  });

  it("laisse au bandeau ce qui ne se corrige dans aucun champ", () => {
    // Un parcours périmé ne se répare pas en modifiant une saisie : le
    // message doit rester en haut, où il porte sur l'écran entier.
    expect(
      registrationFieldError(
        refus("Ce parcours a expiré.", "auth_login_challenge_expired"),
      ),
    ).toBeNull();
  });

  it("laisse au bandeau un champ que ce formulaire ne contient pas", () => {
    // L'adresse vient du parcours, prouvée, et n'est pas saisie ici :
    // poser l'erreur sur un champ absent la ferait disparaître.
    expect(registrationFieldError(refus("Adresse déjà prise.", "x", "email"))).toBeNull();
  });

  it("ne rend rien quand il n'y a pas d'erreur", () => {
    expect(registrationFieldError(null)).toBeNull();
  });
});
