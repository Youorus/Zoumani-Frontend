import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { setSessionCookies, type IssuedTokens } from "@/lib/auth/session.server";

/**
 * Connexion par e-mail et mot de passe.
 *
 * La réponse au navigateur ne contient **aucun jeton** : ils partent dans
 * des cookies `httpOnly` que le JavaScript de page ne peut pas lire. Le
 * client reçoit uniquement de quoi afficher l'interface.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/login", body });

  if (result.status !== 200) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const tokens = result.body as IssuedTokens & { permissions: string[] };
  await setSessionCookies(tokens);

  return NextResponse.json({ permissions: tokens.permissions });
}
