import Image from "next/image";

/**
 * Les deux badges de magasin et le QR code.
 *
 * ═══ Pourquoi les badges sont dessinés ici ═══
 *
 * Apple et Google fournissent des images officielles, soumises à leurs
 * règles de marque — proportions, marges, couleurs, mentions légales. Les
 * embarquer demande de les télécharger depuis leurs kits et d'accepter
 * leurs conditions. Ce sont des fichiers à poser, pas du code à écrire :
 * le jour où l'application est publiée, on remplace ces deux blocs par les
 * images officielles, ce qui est aussi le moment où l'on a le droit de
 * s'en servir.
 *
 * En attendant, la forme y est — c'est ce que la maquette demande — et
 * seule la pastille « Bientôt » dit la vérité.
 *
 * ═══ Pourquoi ils ne sont pas cliquables sans adresse ═══
 *
 * Un badge qui mène à une fiche inexistante coûte plus cher que pas de
 * badge : le visiteur en conclut que le service n'existe pas, et il a
 * raison. Tant que `NEXT_PUBLIC_APP_STORE_URL` et son équivalent Play sont
 * vides, ce sont des `<div>`, pas des liens.
 */

const APP_STORE = process.env.NEXT_PUBLIC_APP_STORE_URL;
const PLAY_STORE = process.env.NEXT_PUBLIC_PLAY_STORE_URL;

function Pomme() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-7 shrink-0"
      aria-hidden
    >
      <path d="M17.05 12.94c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.15-3 .9-3.78.9-.78 0-1.98-.88-3.25-.86-1.67.02-3.21.97-4.07 2.46-1.73 3-.44 7.45 1.25 9.89.82 1.19 1.81 2.53 3.11 2.48 1.25-.05 1.72-.81 3.23-.81 1.51 0 1.93.81 3.25.78 1.34-.02 2.19-1.21 3.01-2.41.95-1.38 1.34-2.72 1.36-2.79-.03-.01-2.61-1-2.63-3.96ZM14.6 5.6c.69-.83 1.15-2 1.02-3.15-.99.04-2.19.66-2.9 1.49-.64.73-1.19 1.9-1.04 3.02 1.1.09 2.23-.56 2.92-1.36Z" />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden>
      <path
        d="M3.6 2.3a1 1 0 0 0-.5.87v17.66a1 1 0 0 0 .5.87l9.36-9.7L3.6 2.3Z"
        fill="#34a853"
      />
      <path
        d="M17.9 9.02 14.4 7 12.96 12l1.44 5 3.5-2.02c1.2-.7 1.2-2.26 0-2.96Z"
        fill="#fbbc04"
      />
      <path
        d="m3.6 2.3 9.36 9.7L14.4 7 5.02 1.6a1.2 1.2 0 0 0-1.42.7Z"
        fill="#ea4335"
      />
      <path
        d="m3.6 21.7 9.36-9.7 1.44 5-9.38 5.4a1.2 1.2 0 0 1-1.42-.7Z"
        fill="#4285f4"
      />
    </svg>
  );
}

function Badge({
  href,
  icone,
  ligneHaute,
  ligneBasse,
  soon,
}: {
  href?: string;
  icone: React.ReactNode;
  ligneHaute: string;
  ligneBasse: string;
  soon: string;
}) {
  const contenu = (
    <>
      {icone}
      <span className="text-left leading-tight">
        <span className="block text-[0.62rem] tracking-wide">{ligneHaute}</span>
        <span className="block text-[1.05rem] font-bold">{ligneBasse}</span>
      </span>
      {href ? null : (
        <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.6rem] font-bold tracking-wide uppercase">
          {soon}
        </span>
      )}
    </>
  );

  const classe =
    "inline-flex items-center gap-2.5 rounded-xl bg-foreground px-4 py-2.5 text-inverse-foreground";

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`focus-ring ${classe}`}
    >
      {contenu}
    </a>
  ) : (
    <div className={classe} aria-disabled="true">
      {contenu}
    </div>
  );
}

export function StoreBadges({
  qrLabel,
  soon,
}: {
  qrLabel: string;
  soon: string;
}) {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-5">
      <div className="flex flex-wrap gap-3">
        <Badge
          href={APP_STORE}
          icone={<Pomme />}
          ligneHaute="Télécharger dans"
          ligneBasse="l'App Store"
          soon={soon}
        />
        <Badge
          href={PLAY_STORE}
          icone={<Play />}
          ligneHaute="DISPONIBLE SUR"
          ligneBasse="Google Play"
          soon={soon}
        />
      </div>

      {/* Le QR code n'a de sens que sur un écran qu'on peut photographier
          depuis un autre appareil : caché sur mobile, où l'on est déjà sur
          le téléphone qu'il faudrait scanner. */}
      <div className="hidden items-center gap-4 sm:flex">
        <span className="h-14 w-px bg-border" aria-hidden />
        <div className="rounded-xl bg-surface p-2.5 shadow-soft">
          <Image
            src="/images/qr-zoumani.svg"
            alt="Code QR vers zoumani.fr"
            width={80}
            height={80}
            className="size-20"
          />
        </div>
        <p className="max-w-[8rem] text-sm leading-snug text-muted-foreground italic">
          {qrLabel}
        </p>
      </div>
    </div>
  );
}
