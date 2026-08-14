import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { absorbSession } from "@/lib/auth/session.server";

/**
 * Étape 2 bis — crée le compte, une fois l'adresse prouvée.
 *
 * Comme l'étape de l'e-mail, elle clôt le parcours tant que la preuve du
 * téléphone est levée : les jetons deviennent des cookies et ne sont pas
 * rendus au navigateur.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({
    method: "POST",
    path: "/auth/login/register",
    body,
  });
  return NextResponse.json(await absorbSession(result.body), { status: result.status });
}
