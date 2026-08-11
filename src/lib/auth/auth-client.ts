import type { AuthenticatedUser, LoginMethods } from "./auth.types";

/**
 * Appels d'authentification, depuis le navigateur.
 *
 * Tous visent des routes de **même origine** — jamais l'API directement.
 * Le jeton est ajouté côté serveur, à partir d'un cookie que ce code ne
 * peut pas lire. C'est ce qui rend une faille XSS incapable de voler la
 * session.
 */

async function post(path: string, body?: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    // Indispensable : sans cela, le navigateur n'envoie pas les cookies et
    // le serveur ne verrait jamais la session.
    credentials: "same-origin",
  });
}

/** Erreur normalisée, telle que le BFF la retransmet. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly reason: string | undefined,
    readonly status: number,
    /**
     * Champ mis en cause par l'API, dans **sa** convention de nommage —
     * `phone_number`, `phone_country_code`. Renseigné pour tout ce qui se
     * corrige dans le formulaire ; absent pour ce qui n'a pas de champ,
     * comme un parcours périmé.
     */
    readonly field?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string; details?: { reason?: string; field?: string } } }
    | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
      payload?.error?.details?.field,
    );
  }
  return payload;
}

/** Ouvre une session par e-mail et mot de passe. */
export async function loginWithPassword(email: string, password: string): Promise<void> {
  await unwrap(await post("/api/auth/login", { email, password }));
}

/** Où en est le parcours de connexion en deux étapes. */
export interface LoginStep {
  challengeId: string;
  step: "email_pending" | "registration_pending" | "phone_pending";
  /** Destination masquée du code envoyé — `a•••@example.com`, `…3456`. */
  sentTo: string | null;
  expiresIn: number;
  /** Champs à recueillir quand `step` vaut `registration_pending`. */
  requiredFields: string[];
}

interface RawLoginStep {
  challenge_id: string;
  step: LoginStep["step"];
  sent_to: string | null;
  expires_in: number;
  required_fields?: string[];
}

function toStep(raw: RawLoginStep): LoginStep {
  return {
    challengeId: raw.challenge_id,
    step: raw.step,
    sentTo: raw.sent_to,
    expiresIn: raw.expires_in,
    requiredFields: raw.required_fields ?? [],
  };
}

/**
 * Étape 1 — demande un code par e-mail.
 *
 * Réussit **toujours**, même pour une adresse inconnue : l'API refuse de
 * dire qui est inscrit, et l'interface ne doit pas contredire ce choix en
 * affichant « compte introuvable ».
 */
export async function startLogin(email: string): Promise<LoginStep> {
  const payload = (await unwrap(
    await post("/api/auth/login/start", { email }),
  )) as RawLoginStep;
  return toStep(payload);
}

/** Étape 2 — valide le code de l'e-mail ; l'API envoie alors le SMS. */
export async function submitEmailCode(
  challengeId: string,
  code: string,
): Promise<LoginStep> {
  const payload = (await unwrap(
    await post("/api/auth/login/email", { challenge_id: challengeId, code }),
  )) as RawLoginStep;
  return toStep(payload);
}

/** Étape 3 — valide le code du SMS. La session est ouverte au retour. */
export async function submitPhoneCode(
  challengeId: string,
  code: string,
): Promise<void> {
  await unwrap(await post("/api/auth/login/phone", { challenge_id: challengeId, code }));
}

/**
 * Crée le compte, une fois l'adresse prouvée.
 *
 * L'adresse **n'est pas** transmise : elle vient du parcours côté serveur,
 * où elle a été prouvée. La renvoyer permettrait d'en substituer une autre
 * et de créer un compte sur une boîte qu'on ne contrôle pas.
 *
 * Aucun mot de passe non plus : ce parcours n'en demande jamais.
 */
export async function completeRegistration(
  challengeId: string,
  input: {
    firstName: string;
    lastName: string;
    phoneCountryCode: string;
    phoneNationalNumber: string;
    acceptsTerms: boolean;
    acceptsPrivacyPolicy: boolean;
  },
): Promise<LoginStep> {
  const payload = (await unwrap(
    await post("/api/auth/login/register", {
      challenge_id: challengeId,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_country_code: input.phoneCountryCode,
      // Les espaces de saisie sont retirés ici : le serveur les refuse, et
      // les laisser transformerait une frappe naturelle en erreur.
      phone_national_number: input.phoneNationalNumber.replace(/\s/g, ""),
      terms_version: CONSENT_VERSIONS.terms,
      privacy_policy_version: CONSENT_VERSIONS.privacyPolicy,
      // Ce que la personne a réellement coché, jamais `true` en dur. Le
      // formulaire refuse déjà de partir sans les deux accords — mais un
      // consentement consigné doit être celui qui a été donné, pas celui
      // qu'on suppose. Une constante ici survivrait à un assouplissement
      // de la validation, et le registre mentirait.
      accepts_terms: input.acceptsTerms,
      accepts_privacy_policy: input.acceptsPrivacyPolicy,
    }),
  )) as RawLoginStep;
  return toStep(payload);
}

/**
 * Versions des textes légaux affichées à l'inscription.
 *
 * Consignées ici parce que c'est **cette** version que la personne a lue.
 * Le serveur enregistre ce que le client déclare avoir montré : lui
 * laisser choisir reviendrait à consigner un consentement à un texte que
 * personne n'a vu.
 */
export const CONSENT_VERSIONS = {
  terms: "1.0",
  privacyPolicy: "1.0",
} as const;

/** Demande un code pour prouver son adresse ou son numéro. */
export async function requestContactVerification(
  channel: "email" | "phone",
): Promise<{ sentTo: string; expiresIn: number }> {
  const payload = (await unwrap(
    await post(`/api/proxy/auth/contact/${channel}/request`),
  )) as { sent_to: string; expires_in: number };
  return { sentTo: payload.sent_to, expiresIn: payload.expires_in };
}

/** Confirme son adresse ou son numéro avec le code reçu. */
export async function confirmContactVerification(
  channel: "email" | "phone",
  code: string,
): Promise<void> {
  await unwrap(await post(`/api/proxy/auth/contact/${channel}/confirm`, { code }));
}

/** Ferme la session. */
export async function logout(): Promise<void> {
  await post("/api/auth/logout");
}

/**
 * Restaure la session, si elle existe.
 *
 * C'est l'appel de la « reconnexion automatique » : le serveur lit le
 * cookie, rafraîchit au besoin, et rend la personne. Un `null` signifie
 * simplement « personne n'est connecté » — pas une erreur.
 */
export async function restoreSession(): Promise<AuthenticatedUser | null> {
  const response = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  const payload = (await response.json()) as { user: AuthenticatedUser | null };
  return payload.user;
}

/** Quels parcours de connexion proposer. */
export async function loadLoginMethods(): Promise<LoginMethods> {
  const response = await fetch("/api/proxy/auth/methods", { cache: "no-store" });
  if (!response.ok) {
    // Par défaut, on ne propose que le mot de passe : afficher un parcours
    // indisponible ferait attendre un code qui n'arrivera jamais.
    return { password: true, oneTimeCode: false };
  }
  const payload = (await response.json()) as {
    password: boolean;
    one_time_code: boolean;
  };
  return { password: payload.password, oneTimeCode: payload.one_time_code };
}
