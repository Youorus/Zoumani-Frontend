import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";

/**
 * Étape 1 — envoie un code à l'adresse e-mail.
 *
 * Retransmis tel quel : l'API répond **identiquement** que l'adresse
 * corresponde à un compte ou non. Le BFF n'a rien à interpréter, et
 * surtout rien à révéler que l'API a choisi de taire.
 *
 * Aucun cookie n'est posé ici : le parcours n'a encore rien prouvé.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/login/start", body });
  return NextResponse.json(result.body, { status: result.status });
}
