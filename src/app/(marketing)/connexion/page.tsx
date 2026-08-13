import type { Metadata } from "next";

import { AuthView } from "@/features/auth/components/auth-view";
import { authContent } from "@/features/auth/content/auth-content";
import { VisitorFlowPage } from "@/features/visitor-flow/components/visitor-flow-page";

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

export default async function ConnexionPage({ searchParams }: ConnexionPageProps) {
  const params = await searchParams;
  const language = firstValue(params.lang) === "en" ? "en" : "fr";
  // `suite` est posé par `proxy.ts` quand il intercepte une route protégée :
  // après connexion, la personne reprend là où elle allait.
  const redirectTo = firstValue(params.suite);

  return (
    <VisitorFlowPage
      contextLabel={authContent[language].contextLabel}
      language={language}
    >
      <AuthView language={language} redirectTo={redirectTo} />
    </VisitorFlowPage>
  );
}
