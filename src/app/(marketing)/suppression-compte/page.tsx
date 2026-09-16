import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { DeletionForm } from "@/features/account-deletion/components/deletion-form";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./page.module.css";

/**
 * La page que Google Play Console demande de déclarer : où une personne
 * peut faire supprimer son compte **sans l'application**.
 *
 * ═══ Ce qu'elle dit, et d'où ça vient ═══
 *
 * Chaque phrase décrit le traitement réel : `EraseOwnAccount` et
 * l'ADR-0013 pour ce qui est effacé, pseudonymisé ou conservé ;
 * l'ADR-0028 pour la preuve par l'adresse et le cas des demandes
 * bloquées. Une durée qui n'est pas fixée est dite non fixée — pas
 * remplacée par un chiffre plausible.
 *
 * ═══ Une page serveur, un îlot client ═══
 *
 * Tout le texte est rendu à la compilation. Seul le formulaire est un
 * composant client : il porte de l'état, pas de contenu indexable.
 */

export const metadata: Metadata = pageMetadata({
  path: "/suppression-compte",
  title: "Supprimer mon compte Zoumani",
  description:
    "Demandez la suppression de votre compte Zoumani et des données associées, sans l’application : un code reçu par e-mail confirme que vous en êtes le titulaire.",
});

const EFFACE = [
  "Nom, prénom, date de naissance, adresse e-mail, numéro de téléphone, langue et pays de résidence.",
  "Photo de profil, et les fichiers qui vont avec.",
  "Pièces d’identité et selfies transmis pour la vérification d’identité, avec leur historique et leurs fichiers. La vérification est faite par notre équipe ; aucun prestataire tiers ne les détient.",
  "Rattachements à un compte Apple ou Google, sessions ouvertes sur tous vos appareils, codes de connexion.",
  "Appareils enregistrés pour les notifications, alertes de disponibilité sur un trajet.",
];

const CONSERVE = [
  {
    quoi: "Paiements, remboursements, factures",
    pourquoi: "Obligation comptable (code de commerce, art. L123-22)",
    duree: "Dix ans",
  },
  {
    quoi: "Expéditions, voyages, suivis de colis, avis émis et reçus, conversations et leurs pièces jointes, dossiers d’assistance",
    pourquoi:
      "Ils documentent une transaction dont une autre personne est partie prenante. Ils sont pseudonymisés : la ligne reste, l’identifiant ne désigne plus personne, et votre nom y apparaît comme « Compte supprimé ».",
    duree: "Non encore fixée — voir ci-dessous",
  },
  {
    quoi: "La trace de votre demande de suppression",
    pourquoi: "Prouver qu’une demande a précédé l’effacement, si quelqu’un le conteste",
    duree: "Conservée sans votre adresse, qui en est retirée dès l’effacement",
  },
];

export default function SuppressionComptePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <h1 className={styles.title}>Supprimer mon compte Zoumani</h1>
        <p className={styles.lede}>
          Vous pouvez demander ici la suppression de votre compte et des données qui y sont
          rattachées, sans installer ni ouvrir l’application. La suppression est définitive.
        </p>

        <section className={styles.formZone} aria-labelledby="demande">
          <h2 id="demande" className={styles.sectionTitle}>
            Faire la demande
          </h2>
          <p className={styles.paragraph}>
            Saisissez l’adresse e-mail de votre compte. Vous recevez un code à six chiffres ;
            en le saisissant, vous confirmez que vous êtes bien le titulaire, et le compte est
            effacé dans la foulée. C’est le même mécanisme que la connexion : il fonctionne
            pour tous les comptes, y compris ceux ouverts avec Apple ou Google, qui n’ont pas
            de mot de passe.
          </p>
          <DeletionForm />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce que la suppression entraîne</h2>
          <p className={styles.paragraph}>
            Votre compte est effacé <strong>immédiatement et définitivement</strong> : il n’y
            a pas de délai de rétractation ni de compte gelé qu’on pourrait réactiver. Vous
            êtes déconnecté de tous vos appareils. Votre adresse e-mail et votre numéro
            redeviennent aussitôt libres si vous souhaitez vous réinscrire un jour — mais
            rien de l’ancien compte ne sera restauré.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce qui est effacé</h2>
          <ul className={styles.list}>
            {EFFACE.map((ligne) => (
              <li key={ligne}>{ligne}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ce qui est conservé, et pourquoi</h2>
          <p className={styles.paragraph}>
            Le droit à l’effacement ne s’étend pas aux données qu’une obligation légale impose
            de garder, ni à celles qui appartiennent aussi à quelqu’un d’autre : la personne
            qui a transporté votre colis a besoin de la trace de ce trajet autant que vous.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Données</th>
                  <th scope="col">Pourquoi</th>
                  <th scope="col">Durée</th>
                </tr>
              </thead>
              <tbody>
                {CONSERVE.map((ligne) => (
                  <tr key={ligne.quoi}>
                    <th scope="row">{ligne.quoi}</th>
                    <td>{ligne.pourquoi}</td>
                    <td>{ligne.duree}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.paragraph}>
            La durée de conservation des données pseudonymisées n’est <strong>pas encore
            fixée</strong> : nous préférons l’écrire que d’afficher un chiffre inventé. Elle
            sera précisée ici et dans la politique de confidentialité dès qu’elle sera arrêtée.
            Les paiements sont traités par Stripe, qui conserve de son côté les données de
            transaction selon ses propres obligations légales ; nous ne lui confions ni votre
            pièce d’identité ni votre photo.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Si un colis, un paiement ou un litige est en cours</h2>
          <p className={styles.paragraph}>
            La suppression ne peut pas s’exécuter automatiquement tant qu’un engagement vous
            lie à quelqu’un : un colis en route, une expédition payée pas encore prise en
            charge, des gains qui vous sont dus, un dossier d’assistance ouvert. Dans ce cas
            votre demande est <strong>enregistrée</strong>, l’écran et un courriel vous
            disent ce qui bloque, et l’équipe termine la suppression dès que l’engagement est
            clos — au plus tard dans le mois qui suit votre demande, comme la loi le prévoit.
            Vous n’avez rien à refaire.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Compte ouvert avec Apple ou Google</h2>
          <p className={styles.paragraph}>
            <strong>Google</strong> : saisissez l’adresse Gmail avec laquelle vous vous
            connectez.
          </p>
          <p className={styles.paragraph}>
            <strong>Apple, sans masquage</strong> : saisissez l’adresse de votre identifiant
            Apple.
          </p>
          <p className={styles.paragraph}>
            <strong>Apple avec « Masquer mon adresse e-mail »</strong> : votre compte Zoumani
            porte une adresse relais en <code>@privaterelay.appleid.com</code>. Vous la
            trouvez sur votre iPhone dans Réglages › votre nom › Se connecter avec Apple ›
            Zoumani. Saisissez cette adresse relais : Apple vous transmet le code dans votre
            vraie boîte. Vous pouvez aussi supprimer le compte depuis l’application, dans votre
            profil.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vous n’avez plus accès à votre adresse e-mail</h2>
          <p className={styles.paragraph}>
            Si vous avez encore l’application, supprimez le compte depuis votre profil : la
            session ouverte suffit. Sinon, écrivez à{" "}
            <a className={styles.link} href="mailto:contact@zoumani.fr">
              contact@zoumani.fr
            </a>{" "}
            depuis une autre adresse en indiquant celle du compte. Nous vous demanderons de
            quoi établir que le compte est bien le vôtre — jamais de mot de passe, jamais
            d’information bancaire — et nous répondons sous un mois.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Délais et contact</h2>
          <p className={styles.paragraph}>
            Quand rien ne s’y oppose, l’effacement est <strong>immédiat</strong> à la saisie
            du code, et un courriel vous le confirme. Quand un engagement bloque, la demande
            est traitée sous un mois au plus. Pour toute question sur vos données :{" "}
            <a className={styles.link} href="mailto:contact@zoumani.fr">
              contact@zoumani.fr
            </a>
            . Le détail de nos traitements est dans la{" "}
            <Link className={styles.link} href="/confidentialite">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <p className={styles.updated}>Dernière mise à jour : 16 septembre 2026.</p>
      </main>
      <SiteFooter />
    </>
  );
}
