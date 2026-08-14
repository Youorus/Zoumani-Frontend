import { Check } from "lucide-react";

import type { AuthScreen } from "../types/auth-flow";
import styles from "./auth-view.module.css";

/**
 * Les étapes du parcours, nommées.
 *
 * ═══ Pourquoi remplacer les pastilles ═══
 *
 * Quatre points muets disent qu'il reste du chemin, jamais lequel.
 * Quelqu'un qui vient de saisir son adresse ne sait pas qu'un SMS
 * l'attend : il reçoit un second code sans l'avoir vu venir, se demande
 * s'il a fait une erreur, et une partie s'arrête là. Annoncer les deux
 * vérifications **avant** de les demander coûte une ligne et supprime la
 * surprise.
 *
 * ═══ Pourquoi le nombre d'étapes change en cours de route ═══
 *
 * Le parcours bifurque réellement après la preuve de l'adresse : un
 * compte existant enchaîne sur le téléphone, une première venue passe
 * d'abord par ses informations. Afficher dès le départ une étape qui sera
 * peut-être sautée serait un mensonge poli — on préfère l'insérer au
 * moment où elle devient vraie.
 */

interface Step {
  key: string;
  label: string;
}

/** Où en est chaque écran, exprimé en étapes visibles. */
const POSITION: Record<AuthScreen, number> = {
  email: 0,
  "email-code": 0,
  registration: 1,
  "phone-code": 2,
  done: 3,
};

export function AuthSteps({
  screen,
  labels,
  registering,
  phoneFactor,
}: {
  screen: AuthScreen;
  labels: { email: string; identity: string; phone: string };
  /** Vrai dès que le parcours mène à une création de compte. */
  registering: boolean;
  /**
   * L'API exige-t-elle la preuve du téléphone ?
   *
   * Un fil qui annonce une étape jamais atteinte est pire qu'un fil plus
   * court : la personne attend un SMS, ne le reçoit pas, et croit que
   * quelque chose a échoué au moment même où tout a réussi.
   */
  phoneFactor: boolean;
}) {
  const steps: Step[] = [
    { key: "email", label: labels.email },
    ...(registering ? [{ key: "identity", label: labels.identity }] : []),
    ...(phoneFactor ? [{ key: "phone", label: labels.phone }] : []),
  ];

  // Sans l'étape intermédiaire, le téléphone remonte d'un cran.
  const walked = registering ? POSITION[screen] : Math.min(POSITION[screen], 1);
  // Et sans l'étape du téléphone, l'arrivée se fait sur la dernière du fil.
  const current = Math.min(walked, steps.length - (screen === "done" ? 0 : 1));

  return (
    <ol className={styles.steps}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={step.key}
            className={styles.step}
            data-state={done ? "done" : active ? "active" : "todo"}
            // Lu par les lecteurs d'écran comme l'étape en cours. Sans
            // cela, la liste n'est qu'une énumération de mots.
            aria-current={active ? "step" : undefined}
          >
            <span className={styles.stepMark} aria-hidden="true">
              {done ? <Check size={13} strokeWidth={3} /> : index + 1}
            </span>
            <span className={styles.stepLabel}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
