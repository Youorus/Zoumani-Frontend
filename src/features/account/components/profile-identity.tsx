"use client";

import type { ReactNode } from "react";

import { useAccountUser } from "./account-user-provider";

/** Informations du profil alimentées par l'unique compte chargé par le layout. */
export function ProfileIdentity() {
  const { user } = useAccountUser();

  return (
    <section className="rounded-2xl border border-border p-5">
      <h2 className="font-display text-lg text-foreground">Votre identité</h2>
      <dl className="mt-3 space-y-2.5 text-sm">
        <Row label="Nom">{user.fullName}</Row>
        {user.email && <Row label="E-mail">{user.email}</Row>}
        {user.phone && <Row label="Téléphone">{user.phone}</Row>}
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Votre identité légale a été vérifiée sur pièce. Pour la corriger,
        contactez-nous.
      </p>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
