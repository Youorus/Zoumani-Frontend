"use client";

import { createContext, useContext, type ReactNode } from "react";

import { accountContent } from "@/features/account/content/account-content";
import type { HomeLanguage } from "@/features/home/components/home-content";

/**
 * La langue de l'espace, décidée une fois et lue partout.
 *
 * ═══ Pourquoi un contexte plutôt qu'un paramètre d'URL ═══
 *
 * La langue vient de la **préférence du compte**, que seul le serveur
 * connaît. La faire descendre par les propriétés obligerait chaque page à
 * la redemander à l'API, et chaque composant à la transmettre à ses
 * enfants — jusqu'à ce que l'un l'oublie, et qu'un fragment reste en
 * français au milieu d'un écran anglais.
 *
 * ═══ Pourquoi un contexte et non un store global ═══
 *
 * Un store est une variable de module : sur le serveur, il est partagé par
 * toutes les requêtes du processus. La langue d'un utilisateur pourrait
 * apparaître dans la page d'un autre. Un contexte naît avec l'arbre de
 * rendu et meurt avec lui.
 */
const AccountCopyContext = createContext(accountContent.fr);

export function AccountCopyProvider({
  language,
  children,
}: {
  language: HomeLanguage;
  children: ReactNode;
}) {
  return (
    <AccountCopyContext value={accountContent[language]}>{children}</AccountCopyContext>
  );
}

/** Les textes de l'espace, dans la langue de la personne connectée. */
export function useAccountCopy() {
  return useContext(AccountCopyContext);
}
