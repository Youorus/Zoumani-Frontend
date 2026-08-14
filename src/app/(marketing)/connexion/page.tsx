import type { Metadata } from "next";

import { AuthView } from "@/features/auth/components/auth-view";
import { authContent } from "@/features/auth/content/auth-content";
import { VisitorFlowPage } from "@/features/visitor-flow/components/visitor-flow-page";
import { callPublicApi } from "@/lib/api/upstream.server";

/**
 * La porte d'entrée — connexion **et** inscription.
 *
 * Une seule page pour les deux : la personne saisit son adresse, et le
 * serveur sait si un compte existe. Lui demander d'abord « avez-vous un
 * compte ? » la ferait hésiter au premier écran, et beaucoup s'arrêtent là.
 *
 * `robots: noindex` : une page d'accès n'a rien à faire dans un moteur de
 * recherche, et l'y laisser attire surtout des robots.
 */
export const metadata: Metadata = {
  title: "Accéder à votre espace",
  description: "Connectez-vous ou créez votre compte Zoumani en quelques secondes.",
  robots: { index: false, follow: false },
};

type ConnexionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * La preuve du téléphone est-elle exigée ?
 *
 * ═══ Pourquoi le serveur répond, et pas une constante d'ici ═══
 *
 * L'API en décide, en une ligne de son domaine. Une copie côté frontend
 * serait une seconde source de vérité : le jour du rétablissement, l'une
 * changerait sans l'autre et l'interface annoncerait un parcours qui n'est
 * pas celui qu'elle suit.
 *
 * ═══ Pourquoi ici et non dans le composant ═══
 *
 * Cette page est un composant serveur : la question est posée pendant le
 * rendu, sans aller-retour depuis le navigateur et sans scintillement. Un
 * `fetch` côté client aurait affiché le fil d'étapes, puis l'aurait
 * corrigé sous les yeux de la personne.
 *
 * En cas de panne, on suppose le parcours **complet** : annoncer une étape
 * de trop est une gêne, en annoncer une de moins ferait croire à un bug
 * quand l'écran du SMS apparaît.
 */
async function phoneFactorRequired(): Promise<boolean> {
  try {
    const result = await callPublicApi({ method: "GET", path: "/auth/methods" });
    const body = result.body as { phone_factor?: boolean } | null;
    return body?.phone_factor ?? true;
  } catch {
    return true;
  }
}

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const language = firstValue(params.lang) === "en" ? "en" : "fr";
  // `suite` est posé par `proxy.ts` quand il intercepte une route protégée :
  // après connexion, la personne reprend là où elle allait.
  const redirectTo = firstValue(params.suite);
  const phoneFactor = await phoneFactorRequired();

  return (
    <VisitorFlowPage
      contextLabel={authContent[language].contextLabel}
      language={language}
    >
      <AuthView language={language} redirectTo={redirectTo} phoneFactor={phoneFactor} />
    </VisitorFlowPage>
  );
}
