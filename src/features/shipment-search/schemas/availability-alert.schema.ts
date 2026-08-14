import { z } from "zod";

export const availabilityAlertSchema = z.object({
  email: z.string().trim().email("Saisissez une adresse email valide."),
  phone: z
    .string()
    .trim()
    .regex(
      /^\+[1-9][0-9\s().-]{7,20}$/,
      "Utilisez le format international, par exemple +33 6 12 34 56 78.",
    ),
  consent: z
    .boolean()
    .refine(Boolean, "Votre accord est nécessaire pour créer l’alerte."),
});

export type AvailabilityAlertInput = z.infer<typeof availabilityAlertSchema>;
