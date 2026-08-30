/**
 * Les pages d'entrée par intention, et la place laissée aux corridors.
 *
 * ═══ Pourquoi deux pages plutôt qu'une ═══
 *
 * « Envoyer un colis au Cameroun » et « rentabiliser ses kilos en
 * voyage » ne sont pas la même recherche, ne se formulent pas dans les
 * mêmes mots, et ne s'achètent pas dans la même campagne. Une page
 * unique obligerait chacun à trier ce qui le concerne — et un moteur à
 * deviner sur quelle requête la classer.
 *
 * ═══ Ce qui n'est pas fait, et pourquoi ═══
 *
 * Aucune page de corridor n'est générée — `/envoyer-colis/paris/douala`
 * et ses semblables. Une page par trajet sans contenu propre est une
 * page faible, et cent pages faibles abaissent le site entier.
 *
 * Ce fichier pose la forme. Le jour où un corridor aura sa matière — des
 * voyageurs réels, un délai constaté, un prix moyen — il deviendra une
 * entrée de cette liste, et sa page se construira à partir de ces faits.
 * Pas avant.
 */

import type { Intention } from "../api/prelaunch-api";

export type EntryPage = {
  slug: string;
  intention: Intention;
  h1: string;
  title: string;
  description: string;
  lede: string;
  cta: string;
  benefits: ReadonlyArray<{ title: string; text: string }>;
};

export const ENTRY_PAGES: readonly EntryPage[] = [
  {
    slug: "envoyer-un-colis",
    intention: "sender",
    h1: "Envoyer un colis avec un voyageur",
    title: "Envoyer un colis avec un voyageur",
    description:
      "Confiez votre colis à quelqu’un qui fait déjà le trajet. Dites-nous où il doit aller : nous vous prévenons dès qu’un voyageur part.",
    lede: "Chaque jour, quelqu’un prend l’avion avec de la place dans sa valise. Pendant ce temps, votre colis attend.",
    cta: "Dire où mon colis doit aller",
    benefits: [
      {
        title: "Vous choisissez le voyageur",
        text: "Son trajet, sa date, les kilos qu’il propose et son prix sont affichés. Vous décidez.",
      },
      {
        title: "Vous savez ce que vous payez",
        text: "Le prix s’affiche avant la réservation et n’augmente pas ensuite.",
      },
      {
        title: "Vous suivez le colis",
        text: "Chaque étape est datée, du départ jusqu’à la remise au destinataire.",
      },
    ],
  },
  {
    slug: "proposer-un-voyage",
    intention: "traveler",
    h1: "Rentabiliser les kilos libres de votre valise",
    title: "Rentabiliser ses kilos disponibles en voyage",
    description:
      "Vous partez bientôt ? Annoncez votre trajet et les kilos qu’il vous reste. Zoumani vous préviendra dès l’ouverture sur ce corridor.",
    lede: "Vous partez avec vingt-trois kilos autorisés et vous en emportez quinze. Les huit qui restent ont une valeur pour quelqu’un.",
    cta: "Annoncer mon trajet",
    benefits: [
      {
        title: "Vous fixez votre prix",
        text: "Vous annoncez ce que vous demandez par kilo. Personne ne le décide à votre place.",
      },
      {
        title: "Vous gardez la main",
        text: "Le contenu est déclaré et photographié avant que vous acceptiez. Vous restez libre de refuser.",
      },
      {
        title: "Vous êtes payé à la livraison",
        text: "Le montant est libéré une fois le colis remis à son destinataire.",
      },
    ],
  },
];

export function entryPageBySlug(slug: string): EntryPage | undefined {
  return ENTRY_PAGES.find((page) => page.slug === slug);
}
