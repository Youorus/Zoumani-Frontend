import { BadgeCheck, Mail, Phone, ShieldCheck, ShieldAlert } from "lucide-react";

import type { AuthenticatedUser } from "@/lib/auth/auth.types";

import { SignOutButton } from "./sign-out-button";
import styles from "./account-overview.module.css";

/**
 * L'espace personnel, tel qu'on l'atteint juste après s'être connecté.
 *
 * ═══ Ce qu'on montre en premier ═══
 *
 * Le nom, puis l'état des trois preuves : adresse, téléphone, identité.
 * C'est ce qu'une place de marché doit rendre visible sans qu'on le
 * cherche — quelqu'un qui n'a pas vérifié son identité découvrira sinon
 * le blocage au pire moment, en publiant un voyage.
 *
 * ═══ Ce qu'on ne montre pas ═══
 *
 * Aucun rôle. Personne n'« est » voyageur ou expéditeur : c'est une
 * position dans une transaction, jamais un attribut du compte. Un badge
 * « voyageur » ici réintroduirait côté interface exactement ce que le
 * backend s'interdit.
 */
export function AccountOverview({
  user,
  welcome,
}: {
  user: AuthenticatedUser;
  /** Vrai à la toute première venue : le compte vient d'être créé. */
  welcome: boolean;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{welcome ? "Bienvenue" : "Votre espace"}</p>
        <h1 className={styles.title}>
          {welcome ? `Bienvenue, ${user.firstName}` : `Bonjour, ${user.firstName}`}
        </h1>
        <p className={styles.subtitle}>
          {welcome
            ? "Votre compte est prêt. Vérifiez votre identité une fois : elle vous suivra ensuite partout."
            : "Vous resterez connecté pendant trois mois, sans avoir à ressaisir de code."}
        </p>
      </header>

      <section className={styles.panel} aria-labelledby="contacts">
        <h2 className={styles.panelTitle} id="contacts">
          Vos coordonnées
        </h2>

        <ContactRow
          icon={<Mail size={18} aria-hidden="true" />}
          label="Adresse e-mail"
          value={user.email ?? "—"}
          verified={user.emailVerified}
        />
        <ContactRow
          icon={<Phone size={18} aria-hidden="true" />}
          label="Téléphone"
          value={user.phone ?? "—"}
          verified={user.phoneVerified}
        />
      </section>

      <section className={styles.panel} aria-labelledby="identite">
        <h2 className={styles.panelTitle} id="identite">
          Votre identité
        </h2>
        <p className={styles.identity}>
          {user.identityVerified ? (
            <>
              <ShieldCheck size={18} className={styles.ok} aria-hidden="true" />
              <span>
                Votre identité est vérifiée. Vous pouvez publier un voyage et
                accepter des colis.
              </span>
            </>
          ) : (
            <>
              <ShieldAlert size={18} className={styles.pending} aria-hidden="true" />
              <span>
                Votre identité n&apos;est pas encore vérifiée. Elle sera demandée avant
                votre premier voyage ou envoi — la faire dès maintenant évite d&apos;attendre
                ce jour-là.
              </span>
            </>
          )}
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="session">
        <h2 className={styles.panelTitle} id="session">
          Votre session
        </h2>
        <p className={styles.sessionNote}>
          Vous resterez connecté trois mois sur cet appareil, sans avoir à
          ressaisir de code. Sur un ordinateur partagé, terminez la session en
          partant.
        </p>
        <SignOutButton label="Se déconnecter" />
      </section>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  verified: boolean;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.rowBody}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowValue}>{value}</span>
      </span>
      {verified ? (
        // Le libellé accompagne l'icône : une pastille verte seule
        // n'existe pas pour qui ne distingue pas les couleurs.
        <span className={styles.verified}>
          <BadgeCheck size={16} aria-hidden="true" />
          Vérifié
        </span>
      ) : (
        <span className={styles.unverified}>À vérifier</span>
      )}
    </div>
  );
}
