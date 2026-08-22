import { Globe, Headset, Lock, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import type { HomeContent } from "../home-content";
import { PhoneMockup } from "./phone-mockup";
import { StoreBadges } from "./store-badges";

/**
 * Le hero de la page d'accueil.
 *
 * ═══ Ce qu'il dit, et dans quel ordre ═══
 *
 * Le slogan, puis une phrase qui l'explique, puis les deux badges de
 * magasin. Rien entre les deux : cette page n'a qu'une chose à faire
 * obtenir, et c'est l'installation de l'application.
 *
 * À droite, ce que l'on obtient en l'installant. Le téléphone n'est pas un
 * ornement : c'est la seule preuve que le service existe avant de l'avoir
 * téléchargé.
 *
 * ═══ L'ordre change sur petit écran ═══
 *
 * En colonne, les garanties passent AVANT le téléphone (`order-last` sur
 * ce dernier). Le téléphone fait six cents pixels de haut : posé entre le
 * slogan et les garanties, il les repousserait à deux écrans de défilement,
 * alors qu'elles répondent au doute qui vient juste après le slogan —
 * « confier un colis à un inconnu ? ».
 *
 * ═══ Les garanties sont dans le hero ═══
 *
 * Et non dans une section à part. Posée trois écrans plus bas, la réponse
 * arriverait après le doute.
 */

const PICTOS = [ShieldCheck, Lock, Headset];

export function Hero({
  copy,
  stores,
}: {
  copy: HomeContent["hero"];
  stores: HomeContent["stores"];
}) {
  // `{accent}` marque le fragment à mettre en gras — voir `home-content`.
  const [avant, apres] = copy.description.split("{accent}");

  return (
    <section
      id="telecharger"
      className="relative overflow-hidden bg-background pt-24 pb-0 lg:pt-32"
    >
      <HeroDecor />

      <Container className="relative z-10">
        <div className="grid gap-y-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:gap-x-12">
          <div className="max-w-[38rem] lg:col-start-1 lg:row-start-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 py-[0.4375rem] pr-3.5 pl-2.5 text-[0.6875rem] font-bold tracking-[0.14em] text-primary uppercase sm:text-xs">
              <Globe className="size-[0.9375rem] shrink-0" aria-hidden />
              {copy.eyebrow}
            </p>

            <h1 className="mt-5 font-sans text-[clamp(2.375rem,5.4vw,3.875rem)] leading-[1.05] font-black tracking-[-0.035em] text-balance sm:mt-6">
              <span className="block text-wordmark">{copy.titleLineOne}</span>
              <span className="block text-primary">{copy.titleLineTwo}</span>
            </h1>

            <p className="mt-4 max-w-[30rem] text-base leading-[1.6] text-muted-foreground sm:mt-6 sm:text-[1.1875rem]">
              {avant}
              <strong className="font-bold text-foreground">
                {copy.descriptionAccent}
              </strong>
              {apres}
            </p>

            <StoreBadges
              copy={stores}
              className="mt-6 max-w-[26rem] sm:mt-9 sm:max-w-none"
            />
          </div>

          {/* `order-last` : en colonne, le téléphone passe après les
              garanties. Voir la note en tête de fichier. */}
          <div className="order-last flex justify-center lg:order-none lg:col-start-2 lg:row-start-1 lg:justify-end">
            <PhoneMockup copy={copy.phone} />
          </div>

          <ul className="grid gap-5 border-t border-border pt-7 sm:grid-cols-3 sm:gap-0 lg:col-span-2 lg:row-start-2 lg:mt-4">
            {copy.trust.map((item, index) => {
              const Picto = PICTOS[index] ?? ShieldCheck;
              return (
                <li
                  key={item.title}
                  className="flex items-center gap-3.5 sm:px-8 sm:not-first:border-l sm:not-first:border-border sm:first:pl-0 sm:last:pr-0"
                >
                  <Picto
                    className="size-[1.375rem] shrink-0 text-primary"
                    aria-hidden
                  />
                  <span className="leading-tight">
                    <span className="block text-[0.9375rem] font-extrabold">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>

      <div className="h-16 lg:h-20" />
    </section>
  );
}

/**
 * Le halo chaud derrière le téléphone.
 *
 * Vectoriel et non image : il se teinte depuis le thème, reste net à
 * toute densité, et ne coûte rien à charger. C'est le seul décor du hero —
 * les vagues et les silhouettes de la version précédente encombraient une
 * page qui doit se lire d'un coup d'œil.
 */
function HeroDecor() {
  return (
    <div
      className="pointer-events-none absolute -top-40 -right-32 size-[56rem] rounded-full"
      style={{
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--primary) 13%, transparent) 0%, transparent 62%)",
      }}
      aria-hidden="true"
    />
  );
}
