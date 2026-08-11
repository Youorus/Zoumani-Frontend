import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";

/**
 * Demande d'un code de connexion par téléphone.
 *
 * Retransmis tel quel : l'API répond **toujours** favorablement, que le
 * numéro corresponde à un compte ou non. Le BFF n'a rien à interpréter, et
 * surtout rien à révéler que l'API a choisi de taire.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/code", body });
  return NextResponse.json(result.body, { status: result.status });
}
