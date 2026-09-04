import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

import { pageMetadata } from "@/lib/seo/metadata";

import { siteConfig } from "@/lib/seo/site";
import styles from "./page.module.css";

/**
 * La politique de confidentialité.
 *
 * ═══ Pourquoi elle existe maintenant ═══
 *
 * Le site ne collectait rien : il n'en avait pas besoin. Depuis la
 * préinscription, il recueille un prénom, un contact et un trajet — et
 * le RGPD n'attend pas le lancement d'un produit pour s'appliquer.
 *
 * Le tunnel y renvoyait déjà, à côté de la case de consentement : le
 * lien menait à un 404, ce qui est la pire façon de parler de vie privée.
 *
 * ═══ Ce qu'elle ne fait pas ═══
 *
 * Elle ne promet rien qui ne soit vrai aujourd'hui. Pas de sous-traitant
 * qu'on n'a pas, pas de durée qu'on ne tient pas, pas de transfert qu'on
 * ne fait pas. Chaque phrase décrit un traitement réel du module
 * `prelaunch`.
 */

export const metadata: Metadata = pageMetadata({
  path: "/confidentialite",
  title: "Politique de confidentialité",
  description:
    "Ce que Zoumani recueille avant son lancement, pourquoi, combien de temps, et comment le faire effacer.",
});

const SECTIONS = [
  {
    titre: "Qui traite vos données",
    corps: [
      `Zoumani, éditeur de ce site, joignable à ${siteConfig.name.toLowerCase()} par l’adresse indiquée en pied de page. Aucune donnée n’est vendue, louée ou cédée à un tiers.`,
    ],
  },
  {
    titre: "Ce que nous recueillons, et pourquoi",
    corps: [
      "**Si vous rejoignez la liste de lancement** : votre prénom, une adresse e-mail ou un numéro de téléphone, et le trajet qui vous intéresse — ville de départ, destination, période approximative, et selon le cas le type de colis ou les kilos disponibles.",
      "Le trajet est la seule donnée qui ait une valeur d’analyse : il nous dit sur quelles liaisons se trouvent en même temps des colis et des voyageurs, donc où ouvrir le service en premier. Le contact sert à vous prévenir quand c’est le cas.",
      "**Si vous acceptez la mesure d’audience** : des statistiques de visite par Google Analytics, et l’enregistrement du déroulement de votre visite — défilement, appuis — par Microsoft Clarity. Le texte que vous saisissez dans les champs n’est pas capturé : la coupure est faite dans votre navigateur, avant tout envoi.",
      "**Si vous acceptez la publicité** : le pixel Meta rattache une pré-inscription à l’annonce qui l’a amenée. Il ne reçoit ni votre prénom, ni votre adresse e-mail, ni votre téléphone — un filtre les écarte avant tout envoi. Les deux finalités se refusent séparément, et refuser n’enlève rien au site.",
      "**L’origine de votre visite** : les paramètres de campagne présents dans l’adresse par laquelle vous êtes arrivé. Ils nous disent quelle publicité fonctionne, et rien de vous.",
    ],
  },
  {
    titre: "Sur quelle base",
    corps: [
      "Votre **consentement**, donné en cochant la case avant d’envoyer le formulaire, ou en acceptant la mesure d’audience. La date de ce consentement est enregistrée avec votre inscription.",
      "Vous pouvez le retirer à tout moment : le retrait ne remet pas en cause ce qui a été fait avant, mais arrête tout pour la suite.",
    ],
  },
  {
    titre: "Combien de temps",
    corps: [
      "Les préinscriptions sont conservées **jusqu’à l’ouverture du service sur votre trajet, et au plus deux ans**. Passé ce délai sans ouverture, elles sont effacées : une liste qu’on n’a pas su servir en deux ans ne sert plus personne.",
      "Vos réponses sur les cookies restent dans votre navigateur jusqu’à ce que vous effaciez les données de ce site. Les durées de chaque cookie déposé sont détaillées sur la page **Cookies**.",
    ],
  },
  {
    titre: "Qui y a accès",
    corps: [
      "L’équipe Zoumani, et notre hébergeur, situé dans l’Union européenne. Les e-mails partent par notre prestataire d’envoi.",
      "Si vous acceptez la mesure d’audience : Google Ireland Limited et Microsoft Ireland Operations Limited. Si vous acceptez la publicité : Meta Platforms Ireland Limited. Ces trois sociétés sont établies dans l’Union européenne et appartiennent à des groupes américains ; les données peuvent donc être transférées hors de l’Union, dans le cadre prévu par leurs conditions respectives.",
    ],
  },
  {
    titre: "Vos droits",
    corps: [
      "Accès, rectification, effacement, opposition, portabilité, retrait du consentement. Écrivez-nous : nous répondons sous un mois, et l’effacement est immédiat.",
      "Vous pouvez aussi saisir la CNIL si notre réponse ne vous satisfait pas.",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1 className={styles.title}>Politique de confidentialité</h1>
        <p className={styles.lede}>
          Zoumani n’est pas encore ouvert. Ce que nous recueillons d’ici là tient en
          une phrase : de quoi vous prévenir, et de quoi savoir où ouvrir en premier.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.titre} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.titre}</h2>
            {section.corps.map((paragraphe) => (
              <p
                key={paragraphe.slice(0, 40)}
                className={styles.paragraph}
                // Le gras est écrit en Markdown dans le contenu ci-dessus ;
                // il n'y en a pas d'autre balise, et le texte vient d'une
                // constante du code — jamais d'une saisie.
                dangerouslySetInnerHTML={{
                  __html: paragraphe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            ))}
          </section>
        ))}

        <p className={styles.updated}>Dernière mise à jour : 4 septembre 2026.</p>
      </main>
      <SiteFooter />
    </>
  );
}
