import { NextResponse } from "next/server";

import { callPublicApi } from "@/lib/api/upstream.server";
import { setSessionCookies, type IssuedTokens } from "@/lib/auth/session.server";

/** Connexion par code reçu au téléphone. Même sortie que `/login`. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as unknown;
  const result = await callPublicApi({ method: "POST", path: "/auth/code/verify", body });

  if (result.status !== 200) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const tokens = result.body as IssuedTokens & { permissions: string[] };
  await setSessionCookies(tokens);

  return NextResponse.json({ permissions: tokens.permissions });
}
