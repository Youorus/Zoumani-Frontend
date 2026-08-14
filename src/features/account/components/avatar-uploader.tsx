"use client";

import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { AuthenticatedUser } from "@/lib/auth/auth.types";

import { UserAvatar } from "./user-avatar";
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  removeProfilePhoto,
  uploadProfilePhoto,
} from "../api/photo-client";

interface AvatarUploaderProps {
  user: AuthenticatedUser;
}

/**
 * La photo de profil, déposée depuis son espace.
 *
 * ═══ Pourquoi elle compte ici ═══
 *
 * Un expéditeur confie un colis à quelqu'un qu'il ne connaît pas, dont
 * il ne verra que le prénom et une initiale. Le visage est ce qui reste
 * pour décider. Ce n'est pas un ornement de profil : c'est la seule
 * chose humaine dans une carte de résultat.
 *
 * ═══ L'aperçu est immédiat ═══
 *
 * L'image choisie s'affiche avant même d'être envoyée, depuis le fichier
 * local. Attendre l'aller-retour pour voir ce qu'on vient de choisir
 * fait douter que le clic ait été pris en compte — et l'on reclique.
 *
 * ═══ Les refus sont dits avant l'envoi ═══
 *
 * Type et taille sont vérifiés ici **et** par l'API. Le contrôle local
 * ne protège rien — il évite simplement de téléverser cinq mégaoctets
 * pour s'entendre dire non.
 */
export function AvatarUploader({ user }: AvatarUploaderProps) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(user.profilePictureUrl);
  const [apercu, setApercu] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function choisir(file: File) {
    setFailure(null);

    if (
      !ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number])
    ) {
      setFailure("Choisissez une image JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setFailure("Cette image dépasse 5 Mo. Choisissez-en une plus légère.");
      return;
    }

    // L'aperçu part du fichier local : il apparaît instantanément, sans
    // attendre que le serveur ait répondu.
    const local = URL.createObjectURL(file);
    setApercu(local);
    setBusy(true);

    try {
      const compte = await uploadProfilePhoto(file);
      setPhotoUrl(compte.profilePictureUrl);
      setApercu(null);
      // Le layout relit `/auth/me` et transmet la même URL signée à
      // tous les avatars. Une seule invalidation remplace plusieurs
      // états locaux qui finiraient nécessairement par diverger.
      router.refresh();
    } catch (error) {
      setApercu(null);
      setFailure(error instanceof Error ? error.message : "L'envoi n'a pas abouti.");
    } finally {
      setBusy(false);
      URL.revokeObjectURL(local);
      if (input.current) {
        input.current.value = "";
      }
    }
  }

  async function retirer() {
    setBusy(true);
    setFailure(null);
    try {
      const compte = await removeProfilePhoto();
      setPhotoUrl(compte.profilePictureUrl);
      setApercu(null);
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Le retrait n'a pas abouti.");
    } finally {
      setBusy(false);
    }
  }

  const affichee = apercu ?? photoUrl;
  return (
    <section className="rounded-2xl border border-border p-5">
      <h2 className="font-display text-lg text-foreground">Votre photo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Les expéditeurs ne voient que votre prénom et l&apos;initiale de votre nom. Votre
        photo est ce qui les aide à vous faire confiance.
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            imageUrl={affichee}
            imageAlt={user.fullName}
            className="size-20"
            fallbackClassName="text-lg"
          />
          {busy && (
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center rounded-full bg-background/70 text-xs"
            >
              …
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="focus-ring inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            <Camera className="size-4" aria-hidden />
            {affichee ? "Changer" : "Ajouter une photo"}
          </button>

          {photoUrl && (
            <button
              type="button"
              onClick={retirer}
              disabled={busy}
              className="focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-error disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Retirer
            </button>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        className="sr-only"
        aria-label="Choisir une photo de profil"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void choisir(file);
          }
        }}
      />

      {failure && (
        <p className="mt-3 text-sm text-error" role="alert">
          {failure}
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        JPEG, PNG ou WebP, 5 Mo maximum.
      </p>
    </section>
  );
}
