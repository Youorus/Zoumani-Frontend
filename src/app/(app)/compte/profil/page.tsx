import type { Metadata } from "next";

import { AvatarUploader } from "@/features/account/components/avatar-uploader";
import { ProfileIdentity } from "@/features/account/components/profile-identity";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce que les autres voient de vous, et ce qui vous identifie chez nous.
        </p>
      </header>

      <AvatarUploader />
      <ProfileIdentity />
    </div>
  );
}
