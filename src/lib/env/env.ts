import { z } from "zod";

/**
 * Variables d'environnement, validées au démarrage.
 *
 * ═══ Public et serveur, séparés ═══
 *
 * `NEXT_PUBLIC_*` finit dans le bundle envoyé au navigateur : tout ce qui
 * s'y trouve est **public**, quoi qu'on en pense.
 *
 * ═══ Le retour d'une URL d'API, et ce qu'il coûte ═══
 *
 * Elle avait été retirée avec l'espace connecté : la vitrine ne parlait
 * plus à personne, donc survivait à toute panne du serveur. La
 * préinscription la ramène — il faut bien enregistrer quelque part qui
 * attend le service.
 *
 * Ce qu'on préserve : **seul le tunnel** appelle. La vitrine reste
 * statique et muette ; si l'API tombe, la page s'affiche entière et seul
 * le formulaire échoue, en le disant.
 *
 * Elle est facultative. Absente, le tunnel refuse d'envoyer plutôt que
 * de faire croire à un enregistrement — une inscription perdue qu'on
 * croit acquise coûte plus cher qu'une inscription refusée.
 *
 * Valider ici plutôt que de lire `process.env` au fil du code : une
 * variable manquante échoue au démarrage, avec son nom, plutôt qu'au
 * premier clic d'un utilisateur.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/)
      .optional(),
  ),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsedPublicEnv.success) {
  const formattedErrors = parsedPublicEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid public environment variables: ${formattedErrors}`);
}

export const env = parsedPublicEnv.data;
