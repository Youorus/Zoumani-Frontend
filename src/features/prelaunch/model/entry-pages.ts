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
  /**
   * La FAQ **propre à cette page**.
   *
   * ═══ Pourquoi elle n'est pas celle de l'accueil ═══
   *
   * Les deux pages d'entrée affichaient la FAQ de l'accueil, les mêmes
   * neuf questions au mot près. Deux conséquences, toutes deux
   * mauvaises.
   *
   * La première est de contenu : ces neuf questions sont écrites du point
   * de vue de l'expéditeur — « combien coûte un envoi », « que puis-je
   * envoyer », « mon colis est-il assuré ». Servies sur
   * `/proposer-un-voyage`, elles répondent à côté : un voyageur veut
   * savoir ce qu'il gagne, quand il est payé, et ce qu'il risque à la
   * douane.
   *
   * La seconde est de référencement : trois pages du même site portant
   * un contenu principal identique se concurrencent. Google en retient
   * une pour la requête, et les deux autres ont travaillé contre elle.
   *
   * Les réponses ci-dessous suivent les CGU du service — §3 pour le
   * voyage, §5 pour la remise, §7 pour la rémunération, §8 pour les
   * obligations du voyageur. Toute règle qui change là-bas change ici.
   */
  faq: ReadonlyArray<{ question: string; answer: string }>;
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
    faq: [
      {
        question: "Comment envoyer un colis avec un voyageur ?",
        answer:
          "Vous décrivez votre envoi — départ, destination, contenu, poids. Zoumani vous propose les voyageurs vérifiés qui font déjà ce trajet. Vous en choisissez un, vous payez dans l’application, et vous suivez le colis jusqu’à sa remise au destinataire.",
      },
      {
        question: "Combien coûte l’envoi d’un colis par un voyageur ?",
        answer:
          "Le prix dépend du poids, du trajet et du voyageur : chacun fixe lui-même ses tarifs, au kilo ou à la pièce. Le montant total s’affiche en toutes lettres avant la réservation et n’augmente pas ensuite — ce que vous voyez est ce que vous payez.",
      },
      {
        question: "Que puis-je envoyer, et qu’est-ce qui est interdit ?",
        answer:
          "Vous déclarez le contenu à l’avance et le voyageur le vérifie avant le départ. Tout ce que la réglementation aérienne et douanière interdit est refusé : espèces, produits dangereux ou inflammables, denrées périssables, substances réglementées et marchandises soumises à taxe.",
      },
      {
        question: "Comment savoir que le voyageur est fiable ?",
        answer:
          "Chaque voyageur passe une vérification d’identité avant de pouvoir accepter un colis, et son vol est confronté au programme des compagnies — un trajet non vérifié ne peut recevoir aucun colis. Au fil de ses voyages, son profil porte l’historique des avis laissés par les expéditeurs.",
      },
      {
        question: "Quand le voyageur reçoit-il l’argent ?",
        answer:
          "Jamais avant la remise. Zoumani retient le montant à la réservation et ne le libère qu’une fois le colis remis au destinataire. Tant que la remise n’est pas constatée par les deux parties, l’argent reste bloqué.",
      },
      {
        question: "Que se passe-t-il si le colis n’arrive pas ?",
        answer:
          "Vous ouvrez un litige depuis le suivi. Le paiement reste bloqué le temps de l’examen : c’est précisément à cela que sert la retenue. Une couverture contre la perte, le vol et la casse pourra être ajoutée à un envoi via un assureur partenaire, selon l’option choisie.",
      },
      {
        question: "Comment remettre mon colis au voyageur ?",
        answer:
          "Soit en main propre, sur un créneau que vous convenez ensemble, soit par une remise encadrée par Zoumani lorsque la distance ou le délai l’exige. Le mode possible vous est indiqué au moment de la réservation.",
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
    faq: [
      {
        question: "Combien puis-je gagner avec les kilos libres de ma valise ?",
        answer:
          "Vous fixez vous-même vos tarifs, au kilo ou à la pièce, et par catégorie de contenu. Zoumani n’impose aucun prix. Ce que vous annoncez est ce que l’expéditeur voit et accepte avant de réserver.",
      },
      {
        question: "Quand suis-je payé ?",
        answer:
          "À la remise au destinataire, et à ce moment-là seulement — ni au dépôt du colis, ni au décollage, ni à l’atterrissage. Vous demandez ensuite le versement de vos gains dès qu’ils atteignent 10 €, par virement sur un compte SEPA dont vous êtes titulaire.",
      },
      {
        question: "Suis-je obligé d’accepter tous les colis ?",
        answer:
          "Non. Le contenu est déclaré et photographié avant que vous vous engagiez, et vous restez libre de refuser. Au moment de la prise en charge, l’attestation de conformité est l’étape prévue pour refuser ce qui ne correspond pas à ce qui avait été annoncé.",
      },
      {
        question: "Suis-je responsable du contenu du colis à la douane ?",
        answer:
          "Oui. Vous demeurez personnellement responsable du contenu de vos bagages devant les autorités. C’est la raison pour laquelle le contenu est déclaré à l’avance et pourquoi vous devez le vérifier avant d’accepter : ne transportez jamais un colis dont vous n’avez pas vu ce qu’il contient.",
      },
      {
        question: "Comment mon voyage est-il vérifié ?",
        answer:
          "Vous déclarez la compagnie, le numéro de vol, la date et les aéroports. Zoumani confronte ces informations au programme des vols, et à défaut de source exploitable, une vérification humaine se fait sur pièces — billet électronique ou carte d’embarquement. Un trajet non vérifié ne peut recevoir aucun colis.",
      },
      {
        question: "Puis-je annuler mon voyage après avoir accepté un colis ?",
        answer:
          "Tant qu’aucun colis n’est réservé, oui. Dès qu’un expéditeur a payé, l’annulation est refusée : vous pouvez retirer votre offre de la recherche pour ne plus recevoir de nouvelles demandes, mais vous restez engagé envers les colis déjà réservés.",
      },
      {
        question: "Combien de voyages puis-je publier à la fois ?",
        answer:
          "Dix trajets en cours au maximum. C’est un garde-fou contre les publications de masse, et il ne se négocie pas au cas par cas.",
      },
    ],
  },
];

export function entryPageBySlug(slug: string): EntryPage | undefined {
  return ENTRY_PAGES.find((page) => page.slug === slug);
}
