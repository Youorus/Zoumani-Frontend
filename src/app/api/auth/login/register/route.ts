import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";

/**
 * Étape 2 bis — crée le compte, une fois l'adresse prouvée.
 *
 * Aucun cookie n'est posé : le numéro n'est pas encore vérifié. La session
 * n'apparaît qu'à l'étape suivante, quand les deux barrières sont
 * franchies.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({
    method: "POST",
    path: "/auth/login/register",
    body,
  });
  return NextResponse.json(result.body, { status: result.status });
}
