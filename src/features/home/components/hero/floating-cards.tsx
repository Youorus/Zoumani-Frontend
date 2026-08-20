import { Briefcase, Package, Plane, MapPin } from "lucide-react";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import type { HomeContent } from "../home-content";

/**
 * Les deux cartes qui montrent les deux côtés de la place de marché.
 *
 * ═══ Ce qu'elles disent en un coup d'œil ═══
 *
 * En haut quelqu'un qui voyage et gagne de l'argent, en bas quelqu'un qui
 * expédie. Entre les deux, le symbole de la marque — c'est lui qui les
 * relie, et le trait pointillé le dit littéralement.
 *
 * C'est la version illustrée du slogan : « Envoyez vos colis. Rentabilisez
 * vos voyages. » Deux phrases, deux personnes, une rencontre.
 *
 * ═══ Pourquoi Alex n'a pas de photo ═══
 *
 * La maquette montre un portrait. Une photographie de banque d'images sur
 * un profil inventé, c'est un faux témoignage : le visiteur croit voir un
 * utilisateur réel. Un avatar dessiné dit la même chose — « voici un
 * voyageur » — sans faire passer une personne pour ce qu'elle n'est pas.
 *
 * Le jour où de vrais profils sont mis en avant, avec accord, on remplace
 * l'avatar par leur photo.
 *
 * ═══ Décoratives ═══
 *
 * `aria-hidden` : ce sont deux exemples fictifs. Les annoncer ferait
 * entendre « Alex, voyageur, plus 45 euros » à quelqu'un qui cherche à
 * comprendre le service, sans qu'aucun de ces mots ne soit une
 * information.
 */
export function FloatingCards({
  traveler,
  sender,
}: {
  traveler: HomeContent["hero"]["traveler"];
  sender: HomeContent["hero"]["sender"];
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 hidden lg:block"
      aria-hidden="true"
    >
      {/*
        Le trait qui relie les deux cartes en passant par le symbole.

        ═══ Pourquoi le repère est en pourcentages ═══

        Un `viewBox` en pixels suppose de connaître la taille réelle de la
        boîte. Elle dépend ici de la colonne de grille, donc de la largeur
        de la fenêtre — et au premier rendu le tracé passait derrière le
        téléphone, décalé d'une centaine de pixels.

        Avec un repère de 0 à 100 et `preserveAspectRatio="none"`, chaque
        coordonnée est une fraction de la boîte : 40 en x, c'est le bord
        droit des cartes quelle que soit la largeur. Les courbes se
        déforment un peu — elles sont assez douces pour que cela ne se
        voie pas — et `vectorEffect` garde l'épaisseur du trait constante
        malgré l'étirement.
      */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Du bord droit de la carte du voyageur au flanc haut du symbole. */}
        <path
          d="M40 19 C 46 22, 43 36, 42.5 43.5"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.85"
        />
        {/* Du flanc bas du symbole au bord droit de la carte de l'expéditrice. */}
        <path
          d="M42.5 56.5 C 43 64, 46 78, 40 79"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.85"
        />
      </svg>

      {/* Le symbole au point de rencontre, exactement au centre du tracé. */}
      <div className="absolute top-1/2 left-[48%] grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-surface shadow-[0_0.75rem_2rem_-0.5rem_rgba(43,29,23,0.28)] ring-1 ring-primary/15">
        <SymboleZoumani largeur={38} />
      </div>

      <Carte className="top-[6%] left-0 w-[16.5rem]">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <Plane className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-bold text-foreground">
              {traveler.name}, {traveler.role}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              {traveler.route}
            </p>
            <p className="mt-1.5 text-lg font-black text-primary">
              {traveler.amount}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Briefcase className="size-3.5" />
              {traveler.space}
            </p>
          </div>
        </div>
      </Carte>

      <Carte className="bottom-[8%] left-0 w-[16.5rem]">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
            <Package className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.95rem] font-bold text-foreground">
              {sender.name}, {sender.role}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {sender.parcel}
            </p>
            <p className="mt-1.5 text-lg font-black text-accent">
              {sender.weight}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {sender.city}
            </p>
          </div>
        </div>
      </Carte>
    </div>
  );
}

function Carte({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute rounded-2xl bg-surface p-4 shadow-[0_1.25rem_3rem_-1rem_rgba(43,29,23,0.22)] ${className}`}
    >
      {children}
    </div>
  );
}
