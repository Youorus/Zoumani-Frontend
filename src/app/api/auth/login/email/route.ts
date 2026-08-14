import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { absorbSession } from "@/lib/auth/session.server";

/**
 * Étape 2 — valide le code reçu par e-mail.
 *
 * Elle **clôt le parcours** tant que la preuve du téléphone est levée côté
 * API : la réponse porte alors une session, qui devient ici deux cookies
 * `httpOnly`. Elle ne franchit jamais la frontière du serveur.
 *
 * Le jour du rétablissement, l'API cessera d'envoyer cette session et cette
 * route redeviendra un simple relais — sans qu'une ligne change ici.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/login/email", body });
  return NextResponse.json(await absorbSession(result.body), { status: result.status });
}
