import { NextResponse } from "next/server";

import { tripDtosMock } from "@/features/trips/api/mock-trips";

export function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> },
) {
  return params.then(({ tripId }) => {
    const trip = tripDtosMock.find((candidate) => candidate.id === tripId);

    if (!trip) {
      return NextResponse.json(
        {
          code: "TRIP_NOT_FOUND",
          message: "Trip not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(trip);
  });
}
