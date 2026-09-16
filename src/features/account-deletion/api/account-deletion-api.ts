import { env } from "@/lib/env/env";

/**
 * Les deux appels de la suppression de compte — les seuls, avec la
 * préinscription, que le site fasse au réseau (voir AGENTS.md §5).
 *
 * Le contrat est celui du backend, `identity/api/deletion_routers.py` :
 * la première route répond identiquement pour toute adresse, la seconde
 * rend `erased` ou `blocked`.
 */

export type DeletionRequested = {
  requestId: string;
  sentTo: string;
  expiresIn: number;
};

export type DeletionOutcome = {
  requestId: string;
  status: "erased" | "blocked";
  blockingReasons: string[];
};

export class DeletionUnavailable extends Error {
  constructor() {
    super("La demande ne peut pas être envoyée pour le moment. Réessayez plus tard.");
    this.name = "DeletionUnavailable";
  }
}

/** Erreur rendue par l'API, avec le code stable du backend. */
export class DeletionApiError extends Error {
  constructor(
    message: string,
    readonly code: string | undefined,
    readonly httpStatus: number,
  ) {
    super(message);
    this.name = "DeletionApiError";
  }
}

const MESSAGES_PAR_STATUT: Readonly<Record<number, string>> = {
  401: "Ce code n’est pas valable, ou il a expiré. Recommencez la demande.",
  409: "Trop de tentatives depuis cet appareil. Patientez quelques minutes avant de réessayer.",
};

function base(): string {
  const url = env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!url) throw new DeletionUnavailable();
  return url;
}

async function lireErreur(response: Response): Promise<never> {
  const detail = (await response.json().catch(() => null)) as {
    error?: { message?: string; code?: string };
  } | null;
  throw new DeletionApiError(
    MESSAGES_PAR_STATUT[response.status] ??
      detail?.error?.message ??
      "La demande n’a pas abouti. Réessayez dans un instant.",
    detail?.error?.code,
    response.status,
  );
}

export async function requestDeletion(email: string): Promise<DeletionRequested> {
  const response = await fetch(`${base()}/account-deletion/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), confirm: true }),
  });
  if (!response.ok) await lireErreur(response);
  const body = (await response.json()) as {
    request_id: string;
    sent_to: string;
    expires_in: number;
  };
  return { requestId: body.request_id, sentTo: body.sent_to, expiresIn: body.expires_in };
}

export async function confirmDeletion(
  requestId: string,
  code: string,
): Promise<DeletionOutcome> {
  const response = await fetch(
    `${base()}/account-deletion/requests/${encodeURIComponent(requestId)}/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    },
  );
  if (!response.ok) await lireErreur(response);
  const body = (await response.json()) as {
    request_id: string;
    status: "erased" | "blocked";
    blocking_reasons: string[];
  };
  return {
    requestId: body.request_id,
    status: body.status,
    blockingReasons: body.blocking_reasons,
  };
}
