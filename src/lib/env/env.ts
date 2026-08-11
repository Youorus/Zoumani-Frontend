import { z } from "zod";

/**
 * Variables d'environnement, validées au démarrage.
 *
 * ═══ Public et serveur, séparés ═══
 *
 * `NEXT_PUBLIC_*` finit dans le bundle envoyé au navigateur : tout ce qui
 * s'y trouve est **public**, quoi qu'on en pense. L'URL de l'API, elle, n'a
 * plus à y figurer : depuis le BFF, le navigateur ne parle qu'à sa propre
 * origine. La retirer supprime aussi une occasion de mauvaise
 * configuration — un `NEXT_PUBLIC_API_URL` erroné cassait tout, en silence.
 *
 * Valider ici plutôt que de lire `process.env` au fil du code : une
 * variable manquante échoue au démarrage, avec son nom, plutôt qu'au
 * premier clic d'un utilisateur.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
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
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
});

if (!parsedPublicEnv.success) {
  const formattedErrors = parsedPublicEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid public environment variables: ${formattedErrors}`);
}

export const env = parsedPublicEnv.data;
