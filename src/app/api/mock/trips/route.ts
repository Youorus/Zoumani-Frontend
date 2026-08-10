import { NextResponse } from "next/server";

import { tripDtosMock } from "@/features/trips/api/mock-trips";

export function GET() {
  return NextResponse.json(tripDtosMock);
}
