import type { Metadata } from "next";

import { AvatarUploader } from "@/features/account/components/avatar-uploader";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const me = await callApi({ method: "GET", path: "/auth/me" });

  if (me.status !== 200) {
    throw new Error(`L'API a répondu ${me.status} sur /auth/me.`);
  }

  const user = toAuthenticatedUser(me.body as RawCurrentUser);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce que les autres voient de vous, et ce qui vous identifie chez nous.
        </p>
      </header>

      <AvatarUploader user={user} />

      <section className="rounded-2xl border border-border p-5">
        <h2 className="font-display text-lg text-foreground">Votre identité</h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <Ligne libelle="Nom">
            {user.firstName} {user.lastName}
          </Ligne>
          {user.email && <Ligne libelle="E-mail">{user.email}</Ligne>}
          {user.phone && <Ligne libelle="Téléphone">{user.phone}</Ligne>}
        </dl>
        {/* L'identité légale se corrige par la vérification, pas ici :
            elle a été confrontée à une pièce, et la laisser modifier
            librement viderait cette vérification de son sens. */}
        <p className="mt-3 text-xs text-muted-foreground">
          Votre identité légale a été vérifiée sur pièce. Pour la corriger,
          contactez-nous.
        </p>
      </section>
    </div>
  );
}

function Ligne({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{libelle}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
