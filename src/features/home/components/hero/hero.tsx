import { ShieldCheck, Lock, Headset } from "lucide-react";

import { Container } from "@/components/layout/container";
import type { HomeContent } from "../home-content";
import { FloatingCards } from "./floating-cards";
import { PhoneMockup } from "./phone-mockup";
import { StoreBadges } from "./store-badges";

/**
 * Le hero de la page d'accueil.
 *
 * ═══ Ce qu'il remplace ═══
 *
 * Un hero sur fond sombre avec image de fond, motif kente et carte de
 * confiance flottante. Celui-ci part du principe inverse : fond crème,
 * texte foncé, et toute la démonstration à droite.
 *
 * ═══ Comment il raconte le service ═══
 *
 * À gauche, ce qu'on promet. À droite, ce que ça donne : un voyageur qui
 * gagne 45 €, une expéditrice qui envoie 2,4 kg, et entre les deux le
 * symbole de la marque relié par un pointillé. C'est le slogan mis en
 * scène — deux phrases, deux personnes, une rencontre.
 *
 * ═══ Ce qui disparaît sur petit écran ═══
 *
 * Les cartes flottantes et le trait qui les relie. Elles se positionnent
 * en absolu autour du téléphone, et sous 1024 px il n'y a plus la largeur
 * pour les poser sans les faire chevaucher. Le téléphone, lui, reste : il
 * porte l'essentiel de la démonstration.
 *
 * ═══ Les trois garanties du bas ═══
 *
 * Elles sont dans le hero et non dans une section à part, parce qu'elles
 * répondent à l'objection immédiate — « confier un colis à un inconnu ? ».
 * Posée trois écrans plus bas, la réponse arriverait après le doute.
 */

const PICTOS = [ShieldCheck, Lock, Headset];

export function Hero({ copy }: { copy: HomeContent["hero"] }) {
  // `{accent}` marque le fragment à mettre en gras — voir `home-content`.
  const [avant, apres] = copy.description.split("{accent}");

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-14 lg:pt-28 lg:pb-20">
      {/* Le halo chaud du haut, et les vagues du bas. Voir `hero-decor`. */}
      <HeroDecor />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1.25fr)] lg:gap-4">
          <div className="max-w-[38rem]">
            <h1 className="font-sans text-[clamp(2.3rem,4.4vw,3.6rem)] leading-[1.04] font-black tracking-[-0.035em]">
              <span className="block text-wordmark">{copy.titleLineOne}</span>
              <span className="block text-primary">{copy.titleLineTwo}</span>
            </h1>

            <p className="mt-6 max-w-[30rem] text-base leading-7 text-muted-foreground sm:text-lg">
              {avant}
              <strong className="font-bold text-foreground">
                {copy.descriptionAccent}
              </strong>
              {apres}
            </p>

            <StoreBadges qrLabel={copy.qrLabel} soon={copy.storeSoon} />
          </div>

          {/* Le conteneur des cartes flottantes ET du téléphone : elles se
              positionnent par rapport à lui, pas à la page. */}
          <div className="relative mx-auto flex min-h-[34rem] w-full max-w-[44rem] items-center justify-end">
            <FloatingCards traveler={copy.traveler} sender={copy.sender} />
            <div className="relative z-0 lg:mr-2">
              <PhoneMockup copy={copy.phone} />
            </div>
          </div>
        </div>
      </Container>

      <Container className="relative z-10">
        <div className="mt-8 grid gap-4 rounded-2xl bg-surface px-6 py-6 shadow-[0_1rem_2.5rem_-1.25rem_rgba(43,29,23,0.25)] sm:grid-cols-3 sm:gap-2 sm:px-8">
          {copy.trust.map((item, i) => {
            const Picto = PICTOS[i] ?? ShieldCheck;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3 sm:justify-center sm:not-first:border-l sm:not-first:border-border sm:not-first:pl-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Picto className="size-5" />
                </span>
                <span className="leading-tight">
                  <span className="block font-bold text-foreground">
                    {item.title}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/**
 * Le décor : un halo chaud derrière le téléphone, et les vagues du bas.
 *
 * Vectoriel et non image : il se teinte depuis le thème, reste net à
 * toute densité, et ne coûte rien à charger. Les silhouettes de monuments
 * de la maquette demanderaient une illustration — voir la note livrée
 * avec ce hero.
 */
function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <defs>
          <radialGradient id="halo" cx="0.72" cy="0.36" r="0.62">
            <stop
              offset="0"
              stopColor="var(--color-primary)"
              stopOpacity="0.16"
            />
            <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#halo)" />
      </svg>

      {/* Les deux vagues, calées en bas. `preserveAspectRatio="none"` :
          elles s'étirent en largeur sans jamais grandir en hauteur. */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[9rem] w-full lg:h-[13rem]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 220"
        fill="none"
      >
        <path
          d="M0 96c220-58 430-70 720-24s440 30 720-22v170H0Z"
          fill="var(--color-primary)"
          opacity="0.14"
        />
        <path
          d="M0 150c250-52 470-46 730-8s450 22 710-30v108H0Z"
          fill="var(--color-accent)"
          opacity="0.1"
        />
      </svg>
    </div>
  );
}
