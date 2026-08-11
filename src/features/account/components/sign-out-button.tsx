"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth/use-auth";

import styles from "./account-overview.module.css";

/**
 * Terminer la session, ici et maintenant.
 *
 * ═══ Ce que « se déconnecter » signifie vraiment ═══
 *
 * La session dure trois mois glissants et ne se referme d'elle-même que
 * passé ce délai. Ce bouton est donc le **seul** moyen d'y mettre fin — et
 * la première chose que cherche quelqu'un sur un poste partagé.
 *
 * Le jeton de rafraîchissement est révoqué côté API, pas seulement
 * oublié : un cookie effacé sans révocation laisserait une session
 * parfaitement valide chez qui aurait copié le jeton.
 *
 * ═══ Pourquoi `router.refresh()` ═══
 *
 * Les pages rendues côté serveur — celle-ci comprise — sont mises en
 * cache par le routeur. Sans invalidation, un retour arrière réafficherait
 * l'espace avec le nom de la personne qui vient de partir, alors même
 * qu'aucune session n'existe plus.
 */
export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={styles.signOut}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await signOut();
          router.replace("/");
          router.refresh();
        } finally {
          // Rétabli même en cas d'échec : un bouton qui reste grisé
          // laisserait croire que la déconnexion est en cours alors
          // qu'elle a échoué.
          setBusy(false);
        }
      }}
    >
      {busy ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut size={16} aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
