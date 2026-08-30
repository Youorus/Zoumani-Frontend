import Script from "next/script";

import { env } from "@/lib/env/env";

/**
 * Google Analytics 4, chargé directement.
 *
 * ═══ Il ne se charge pas si GTM est présent ═══
 *
 * Charger GA4 par cette balise **et** par une balise de configuration
 * dans le conteneur GTM compterait chaque visite deux fois, sans
 * qu'aucun des deux chemins ne soit fautif. Rien ici ne peut savoir ce
 * que contient le conteneur — il est chargé à distance et son contenu
 * change sans redéploiement. La règle est donc tranchée en amont :
 * **GTM l'emporte**. Poser `NEXT_PUBLIC_GTM_ID` désactive cette balise.
 *
 * Deux chemins possibles, un seul actif, et c'est la configuration qui
 * choisit :
 *
 * - `NEXT_PUBLIC_GTM_ID` posé → GA4 se configure dans l'interface GTM.
 * - lui seul `NEXT_PUBLIC_GA_MEASUREMENT_ID` → GA4 se charge ici.
 *
 * ═══ Le consentement précède toujours ═══
 *
 * `GoogleTagManager` pose le `dataLayer` et refuse les quatre signaux
 * avant tout. Quand GTM est absent, c'est `ConsentDefaults` qui s'en
 * charge — sans quoi `gtag` démarrerait sans état de consentement et se
 * considérerait autorisé.
 *
 * GA4 respecte le Consent Mode nativement : la balise se charge, mais
 * n'écrit ni cookie ni identifiant tant qu'`analytics_storage` vaut
 * `denied`. C'est ce qui permet de la poser sans attendre le clic, et de
 * la débloquer par un `consent update` au moment du oui.
 */
export function GoogleAnalytics() {
  const id = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id || env.NEXT_PUBLIC_GTM_ID) return null;

  return (
    <>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${id}',{send_page_view:true});`}
      </Script>
    </>
  );
}

/**
 * L'état de consentement par défaut, quand GTM ne le pose pas.
 *
 * Une balise brute, et non `next/script` : elle doit s'exécuter **avant**
 * tout le reste. `next/script` en `beforeInteractive` ferait la même
 * chose mais n'est pas prévu hors du document racine — le linter le
 * signale, à raison. Le navigateur exécute une balise `<script>` là où
 * elle se trouve, ce qui est exactement ce qu'on veut.
 *
 * `wait_for_update` laisse 500 ms à la réponse enregistrée d'un visiteur
 * connu, pour qu'il n'ait pas à re-cliquer.
 */
export function ConsentDefaults() {
  // Quand GTM est là, c'est lui qui pose ces valeurs : les poser deux
  // fois n'est pas faux, mais la seconde masquerait la première dans le
  // `dataLayer` et rendrait un débogage illisible.
  if (env.NEXT_PUBLIC_GTM_ID) return null;
  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID && !env.NEXT_PUBLIC_CLARITY_PROJECT_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var c=JSON.parse(localStorage.getItem('zoumani.consent.v2')||'null');if(c&&(c.analytics||c.marketing)){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied'});}}catch(e){}`,
      }}
    />
  );
}
