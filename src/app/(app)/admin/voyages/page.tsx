import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TripReviewQueue } from "@/features/admin/components/trip-review-queue";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

export const metadata: Metadata = {
  title: "Contrôle des voyages | Administration",
  robots: { index: false, follow: false },
};

export default async function AdminTripsPage() {
  const { status, body } = await callApi({ method: "GET", path: "/auth/me" });
  if (status === 401) redirect("/connexion?suite=%2Fadmin%2Fvoyages");

  const user = toAuthenticatedUser(body as RawCurrentUser);
  if (!user.permissions.some((permission) => permission.startsWith("trips:"))) {
    redirect("/compte");
  }

  return <TripReviewQueue />;
}
