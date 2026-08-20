import { MapPin, ArrowUpDown } from "lucide-react";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import type { HomeContent } from "../home-content";

/**
 * Le téléphone du hero, dessiné plutôt que photographié.
 *
 * ═══ Pourquoi pas une image ═══
 *
 * Une capture d'écran dans un cadre photoréaliste, c'est trois fichiers —
 * un par densité — à refaire à chaque retouche de l'application. Et elle
 * serait fausse dès le premier écran modifié, sans que rien ne le signale.
 *
 * Ici l'écran est du vrai texte : il se traduit avec le reste de la page,
 * reste net à toute densité, se lit par un lecteur d'écran, et pèse
 * quelques centaines d'octets.
 *
 * ═══ Ce que le cadre imite, et ce qu'il n'imite pas ═══
 *
 * Le châssis, l'encoche, la barre d'état. Pas les reflets ni l'ombre
 * portée d'une photographie de studio : un dégradé suffit à dire « c'est
 * un téléphone », et l'on ne cherche pas à faire croire à une photo.
 *
 * ═══ Il est décoratif ═══
 *
 * `aria-hidden` sur l'ensemble. Un lecteur d'écran qui annoncerait « De :
 * Paris, France » ferait croire à un formulaire à remplir, alors que c'est
 * une illustration. Ce que le hero a à dire est dans le titre et le
 * paragraphe, qui eux sont lus.
 */
export function PhoneMockup({ copy }: { copy: HomeContent["hero"]["phone"] }) {
  return (
    <div
      className="relative w-[clamp(14rem,20vw,17.5rem)] rounded-[2.6rem] bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] p-[0.55rem] shadow-[0_2.5rem_5rem_-1.5rem_rgba(43,29,23,0.45)]"
      aria-hidden="true"
    >
      <div className="relative overflow-hidden rounded-[2.15rem] bg-background">
        {/* L'encoche, et la barre d'état de part et d'autre. */}
        <div className="relative flex items-center justify-between px-5 pt-3 pb-1 text-[0.6rem] font-semibold text-foreground">
          <span>9:41</span>
          <span className="absolute top-2 left-1/2 h-5 w-[5.5rem] -translate-x-1/2 rounded-full bg-[#1c1c1e]" />
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-[1px] border border-current" />
          </span>
        </div>

        <div className="px-4 pt-3 pb-5">
          <div className="flex items-center justify-center gap-1.5">
            <SymboleZoumani largeur={30} />
            <span className="font-sans text-lg leading-none font-black tracking-[-0.02em] text-wordmark">
              Zoumani
            </span>
          </div>

          <p className="mt-3 text-center text-[0.95rem] leading-tight font-black text-foreground">
            {copy.titleBefore}
            <span className="text-primary">{copy.titleAccent}</span>
            {copy.titleAfter}
          </p>

          <div className="mt-3 rounded-lg bg-primary py-2 text-center text-[0.7rem] font-bold text-primary-foreground">
            {copy.searchTab}
          </div>

          <div className="mt-2 space-y-1.5">
            <Champ
              icone={<MapPin className="size-3" />}
              label={copy.fromLabel}
              valeur={copy.fromValue}
              inverser
            />
            <Champ
              icone={<MapPin className="size-3" />}
              label={copy.toLabel}
              valeur={copy.toValue}
              inverser
            />
            <Champ label={copy.dateLabel} valeur={copy.dateValue} />
          </div>

          <div className="mt-2 rounded-lg bg-accent py-2.5 text-center text-[0.72rem] font-bold text-accent-foreground">
            {copy.submit}
          </div>

          <p className="mt-4 text-center text-[0.62rem] font-bold text-foreground">
            {copy.stepsTitle}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {copy.steps.map((etape) => (
              <div key={etape.title} className="text-center">
                <div className="mx-auto grid size-7 place-items-center rounded-full border border-primary/25">
                  <SymboleZoumani largeur={14} />
                </div>
                <p className="mt-1 text-[0.52rem] leading-tight font-bold text-foreground">
                  {etape.title}
                </p>
                <p className="text-[0.48rem] leading-tight text-muted-foreground">
                  {etape.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Champ({
  icone,
  label,
  valeur,
  inverser = false,
}: {
  icone?: React.ReactNode;
  label: string;
  valeur: string;
  inverser?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icone}
        <span className="leading-tight">
          <span className="block text-[0.5rem]">{label}</span>
          <span className="block text-[0.65rem] font-semibold text-foreground">
            {valeur}
          </span>
        </span>
      </div>
      {inverser ? (
        <ArrowUpDown className="size-3 text-muted-foreground" />
      ) : null}
    </div>
  );
}
