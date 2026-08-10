import { NextResponse } from "next/server";

/**
 * Sonde de disponibilite utilisee par le HEALTHCHECK Docker et par Dokploy.
 * Doit rester dynamique pour refleter l'etat reel du serveur a chaque appel.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok", uptime: process.uptime() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
