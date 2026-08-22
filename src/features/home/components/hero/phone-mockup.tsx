import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { cn } from "@/lib/utils/cn";
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
 * reste net à toute densité et pèse quelques centaines d'octets.
 *
 * ═══ Pas de barre d'état, pas d'encoche ═══
 *
 * Le « 9:41 · batterie · wifi » dessiné à la main était un faux. Il vieillit
 * mal, il ne correspond à aucun appareil réel, et il occupe la place d'une
 * ligne de contenu. Le châssis suffit à dire « c'est un téléphone ».
 *
 * ═══ Il est décoratif ═══
 *
 * `aria-hidden` sur l'ensemble. Un lecteur d'écran qui annoncerait
 * « Départ : Paris, France » ferait croire à un formulaire à remplir, alors
 * que c'est une illustration. Ce que le hero a à dire est dans le titre et
 * le paragraphe, qui eux sont lus.
 */
export function PhoneMockup({ copy }: { copy: HomeContent["hero"]["phone"] }) {
  return (
    <div
      aria-hidden="true"
      className="w-[16.75rem] rounded-[2.5rem] bg-foreground p-[0.5625rem] shadow-[0_3rem_6rem_-2.5rem_rgba(43,29,23,0.55)] lg:w-[19.75rem] lg:rounded-[2.875rem] lg:p-[0.6875rem]"
    >
      <div className="overflow-hidden rounded-[2rem] bg-surface px-[0.9375rem] py-[1.125rem] lg:rounded-[2.25rem] lg:px-[1.125rem] lg:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 lg:gap-[0.4375rem]">
            <SymboleZoumani largeur={26} />
            <span className="font-sans text-[0.9375rem] leading-none font-black tracking-[-0.02em] text-wordmark lg:text-[1.0625rem]">
              Zoumani
            </span>
          </div>
          <span className="size-[1.625rem] rounded-full bg-secondary/28 lg:size-[1.875rem]" />
        </div>

        <div className="mt-[0.9375rem] flex gap-1 rounded-full bg-foreground/6 p-1 lg:mt-[1.125rem]">
          <span className="flex-1 rounded-full bg-surface-elevated py-2 text-center text-xs font-bold shadow-[0_0.375rem_1rem_-0.625rem_rgba(43,29,23,0.4)] lg:py-[0.5625rem] lg:text-[0.8125rem]">
            {copy.senderTab}
          </span>
          <span className="flex-1 rounded-full py-2 text-center text-xs font-semibold text-muted-foreground lg:py-[0.5625rem] lg:text-[0.8125rem]">
            {copy.travelerTab}
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-surface-elevated lg:mt-3.5">
          <Champ
            icone={<MapPin className="size-[0.9375rem] lg:size-[1.0625rem]" />}
            label={copy.fromLabel}
            valeur={copy.fromValue}
          />
          <Champ
            icone={
              <ArrowRight className="size-[0.9375rem] lg:size-[1.0625rem]" />
            }
            label={copy.toLabel}
            valeur={copy.toValue}
          />
          <Champ
            icone={
              <CalendarDays className="size-[0.9375rem] lg:size-[1.0625rem]" />
            }
            label={copy.dateLabel}
            valeur={copy.dateValue}
            dernier
          />
        </div>

        <div className="mt-3 grid h-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_0.875rem_1.75rem_-1rem_rgba(255,107,0,0.85)] lg:mt-3.5 lg:h-[2.875rem] lg:text-[0.9375rem]">
          {copy.submit}
        </div>

        <div className="mt-[1.125rem] flex items-baseline justify-between lg:mt-[1.375rem]">
          <span className="text-xs font-extrabold tracking-[-0.01em] lg:text-[0.8125rem]">
            {copy.resultsTitle}
          </span>
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">
            {copy.resultsMeta}
          </span>
        </div>

        <div className="mt-2.5 flex flex-col gap-2 lg:gap-2.5">
          {copy.results.map((resultat, index) => (
            <div
              key={resultat.name}
              className={cn(
                "flex items-center gap-2.5 rounded-[0.875rem] border border-border bg-surface-elevated p-3 lg:gap-[0.6875rem] lg:rounded-2xl",
                // La dernière carte s'efface : elle dit que la liste continue
                // sous le bord de l'écran, sans avoir à dessiner un défilement.
                index === copy.results.length - 1 ? "opacity-50" : "",
              )}
            >
              <span className={cn("size-[2.125rem] shrink-0 rounded-full lg:size-[2.375rem]", AVATARS[index] ?? AVATARS[0])} />
              <span className="flex-1 leading-tight">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold lg:text-[0.8125rem]">
                    {resultat.name}
                  </span>
                  {resultat.verified ? (
                    <ShieldCheck className="size-[0.8125rem] text-success" />
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[0.625rem] font-semibold text-muted-foreground lg:text-[0.6875rem]">
                  {resultat.detail}
                </span>
              </span>
              <span className="text-sm font-black tracking-[-0.02em] text-primary lg:text-[0.9375rem]">
                {resultat.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Trois teintes de la charte, pour distinguer les profils sans photo. */
const AVATARS = ["bg-primary/16", "bg-secondary/32", "bg-accent/14"] as const;

function Champ({
  icone,
  label,
  valeur,
  dernier = false,
}: {
  icone: React.ReactNode;
  label: string;
  valeur: string;
  dernier?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 lg:gap-[0.6875rem] lg:px-3.5 lg:py-[0.8125rem]",
        dernier ? "" : "border-b border-border",
      )}
    >
      <span className="text-primary">{icone}</span>
      <span className="leading-tight">
        <span className="block text-[0.5625rem] font-bold tracking-[0.1em] text-muted-foreground uppercase lg:text-[0.625rem]">
          {label}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] font-bold lg:text-sm">
          {valeur}
        </span>
      </span>
    </div>
  );
}
