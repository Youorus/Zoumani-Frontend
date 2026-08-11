import { z } from "zod";

/**
 * Validations du parcours.
 *
 * Elles doublent celles du serveur — c'est assumé, et c'est même leur
 * seule raison d'être : éviter un aller-retour réseau pour une adresse
 * manifestement incomplète. **Le serveur reste l'autorité** ; ces règles
 * ne font que rendre le formulaire agréable.
 *
 * Elles ne recopient donc que ce qui est stable : une longueur, un format
 * évident. Reproduire ici une règle métier — quelles versions de CGU sont
 * en vigueur, quels pays sont acceptés — garantirait la divergence.
 */

/** Longueur d'un code à usage unique, imposée par le backend. */
export const CODE_LENGTH = 6;

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Indiquez votre adresse e-mail.")
    .email("Cette adresse ne semble pas valide."),
});

export const codeSchema = z.object({
  code: z
    .string()
    .length(CODE_LENGTH, `Le code comporte ${CODE_LENGTH} chiffres.`)
    .regex(/^\d+$/, "Le code ne contient que des chiffres."),
});

export const registrationSchema = z.object({
  firstName: z.string().min(1, "Indiquez votre prénom.").max(100),
  lastName: z.string().min(1, "Indiquez votre nom.").max(100),
  phoneCountryCode: z.string().length(2, "Choisissez un pays."),
  phoneNationalNumber: z
    .string()
    .min(4, "Ce numéro semble trop court.")
    .max(20)
    .regex(/^[\d\s]+$/, "Le numéro ne contient que des chiffres."),
  acceptsTerms: z.literal(true, {
    message: "Vous devez accepter les conditions d'utilisation.",
  }),
  acceptsPrivacyPolicy: z.literal(true, {
    message: "Vous devez accepter la politique de confidentialité.",
  }),
});

export type EmailInput = z.infer<typeof emailSchema>;
export type CodeInput = z.infer<typeof codeSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
