import { z } from "zod";

export const createAccountSchema = z.object({
  role: z.enum(["sender", "traveler"]),
  firstName: z.string().trim().min(2, "Indiquez au moins 2 caractères."),
  lastName: z.string().trim().min(2, "Indiquez au moins 2 caractères."),
  email: z.string().trim().email("Saisissez une adresse email valide."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s().-]{7,20}$/, "Saisissez un numéro de téléphone valide."),
  password: z
    .string()
    .min(8, "Utilisez au moins 8 caractères.")
    .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
    .regex(/[0-9]/, "Ajoutez au moins un chiffre."),
  terms: z.boolean().refine(Boolean, "Vous devez accepter les conditions pour continuer."),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
