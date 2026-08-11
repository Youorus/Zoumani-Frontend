import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";

/**
 * Étape 2 — valide le code reçu par e-mail, ce qui déclenche le SMS.
 *
 * Toujours aucun cookie : une seule barrière est franchie, et une session
 * ouverte à mi-parcours viderait la seconde étape de son sens.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/login/email", body });
  return NextResponse.json(result.body, { status: result.status });
}
