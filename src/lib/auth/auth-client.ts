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
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string; details?: { reason?: string } } }
    | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
    );
  }
  return payload;
}

/** Ouvre une session par e-mail et mot de passe. */
export async function loginWithPassword(email: string, password: string): Promise<void> {
  await unwrap(await post("/api/auth/login", { email, password }));
}

/** Demande un code de connexion par téléphone. */
export async function requestLoginCode(
  countryCode: string,
  nationalNumber: string,
): Promise<void> {
  await unwrap(
    await post("/api/auth/code", {
      country_code: countryCode,
      national_number: nationalNumber,
    }),
  );
}

/** Ouvre une session avec un code reçu par téléphone. */
export async function loginWithCode(
  countryCode: string,
  nationalNumber: string,
  code: string,
): Promise<void> {
  await unwrap(
    await post("/api/auth/code/verify", {
      country_code: countryCode,
      national_number: nationalNumber,
      code,
    }),
  );
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
