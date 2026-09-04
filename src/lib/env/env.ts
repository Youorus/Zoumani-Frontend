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
  /**
   * Identifiant du conteneur Google Tag Manager — `GTM-XXXXXXX`.
   *
   * Facultatif. Absent, aucun script tiers n'est chargé et le site reste
   * ce qu'il était : muet. Les événements continuent d'être produits, ils
   * ne partent simplement nulle part.
   */
  NEXT_PUBLIC_GTM_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^GTM-[A-Z0-9]{4,10}$/, "Identifiant GTM attendu, de la forme GTM-XXXXXXX")
      .optional(),
  ),
  /**
   * Identifiant de mesure GA4 — `G-XXXXXXXXXX`.
   *
   * ═══ Il ne sert que si GTM est absent ═══
   *
   * Charger GA4 par cette balise **et** par une balise dans le conteneur
   * GTM compterait chaque visite deux fois, sans qu'aucun des deux
   * chemins ne soit en faute. Comme rien ici ne peut savoir ce que
   * contient le conteneur, la règle est tranchée en amont :
   * `NEXT_PUBLIC_GTM_ID` l'emporte, et cette balise ne se charge pas
   * quand il est posé. Un seul chemin, choisi par la configuration.
   */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^G-[A-Z0-9]{6,12}$/, "Identifiant GA4 attendu, de la forme G-XXXXXXXXXX")
      .optional(),
  ),
  /**
   * Identifiant de projet Microsoft Clarity.
   *
   * Dix caractères alphanumériques minuscules. Clarity enregistre les
   * sessions : il est soumis au consentement de mesure au même titre que
   * GA4, et ne se charge qu'après accord.
   */
  NEXT_PUBLIC_CLARITY_PROJECT_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^[a-z0-9]{6,15}$/, "Identifiant Clarity attendu, alphanumérique minuscule")
      .optional(),
  ),
  /**
   * Identifiant du pixel Meta — quinze ou seize chiffres.
   *
   * ═══ Il est soumis au consentement publicitaire, pas à celui de la
   * mesure ═══
   *
   * Meta n'implémente pas le Consent Mode de Google : chargé, il mesure.
   * Le composant qui le pose attend donc l'accord sur la catégorie
   * `marketing`, exactement comme Clarity attend celui sur `analytics`.
   *
   * Absent, aucun script Meta n'est demandé et le domaine
   * `connect.facebook.net` n'est jamais contacté.
   *
   * Figé au build (voir Dockerfile) : le changer demande de reconstruire
   * l'image.
   */
  NEXT_PUBLIC_META_PIXEL_ID: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^\d{15,16}$/, "Identifiant de pixel Meta attendu, 15 ou 16 chiffres")
      .optional(),
  ),
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
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
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
