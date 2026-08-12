import type { Metadata } from "next";
import Link from "next/link";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Mes trajets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proposez la place libre de vos bagages sur un vol que vous prenez déjà.
        </p>
      </header>

      <Link
        href="/trips/nouveau"
        className="inline-block rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground"
      >
        Proposer un voyage
      </Link>
    </div>
  );
}
