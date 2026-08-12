"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Ce qui s'affiche quand un écran cesse de fonctionner.
 *
 * ═══ Pourquoi la session est fermée ═══
 *
 * Dans un espace connecté, la cause la plus fréquente d'un écran qui
 * casse est un **décalage** : des données rendues avec une session qui
 * n'est plus celle du serveur — jeton tourné dans un autre onglet,
 * compte dont les droits ont changé, déploiement pendant la navigation.
 * Proposer « Réessayer » rejoue alors exactement le même échec, et l'on
 * recommence jusqu'à écrire au support.
 *
 * Refermer la session remet tout le monde d'accord : on repart d'un état
 * propre, et une nouvelle connexion prend une minute. C'est brutal
 * seulement en apparence — l'alternative est une boucle sans issue.
 *
 * ═══ Pourquoi « Réessayer » reste, et en premier ═══
 *
 * Une panne réseau passagère se répare d'un clic. On ne déconnecte donc
 * pas d'emblée : on laisse une chance à la tentative, et la sortie n'est
 * proposée qu'ensuite. Fermer la session de quelqu'un à la première
 * erreur lui coûterait trois mois de connexion pour un incident d'une
 * seconde.
 *
 * ═══ Ce que le message ne dit pas ═══
 *
 * Le détail technique n'est affiché que hors production. « Minified
 * React error #441 » n'aide personne et inquiète tout le monde ; en
 * production on montre une phrase utile, et l'empreinte que le support
 * peut recouper avec les journaux.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [fermeture, setFermeture] = useState(false);

  useEffect(() => {
    // Journalisé même en production : sans trace, un incident qui ne se
    // reproduit pas chez nous reste invisible pour toujours.
    console.error("Écran en échec", { message: error.message, digest: error.digest });
  }, [error]);

  const detail =
    process.env.NODE_ENV === "production"
      ? error.digest
        ? `Référence à communiquer au support : ${error.digest}`
        : "Réessayez, ou reconnectez-vous si le problème persiste."
      : error.message;

  return (
    <Container className="py-10">
      <ErrorState
        title="Une erreur inattendue est survenue"
        description={detail}
        action={
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>
              Réessayer
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={fermeture}
              onClick={async () => {
                setFermeture(true);
                // L'échec est ignoré volontairement : ce qui compte est
                // de repartir propre. Une déconnexion qui échoue ne doit
                // pas laisser la personne bloquée sur cet écran.
                await fetch("/api/auth/logout", { method: "POST" }).catch(
                  () => undefined,
                );
                window.location.href = "/";
              }}
            >
              {fermeture ? "Déconnexion…" : "Fermer ma session et repartir"}
            </Button>
          </div>
        }
      />
    </Container>
  );
}
