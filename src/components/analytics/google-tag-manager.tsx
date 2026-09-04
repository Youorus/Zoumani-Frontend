import Script from "next/script";

import { env } from "@/lib/env/env";

/**
 * Le conteneur Google Tag Manager.
 *
 * ═══ Rien ne se charge sans identifiant ═══
 *
 * Absent, ce composant ne rend rien : pas un octet de tiers, pas une
 * requête. Le site reste ce qu'il était — et c'est le comportement par
 * défaut, pas un cas d'erreur.
 *
 * ═══ Le consentement précède le conteneur ═══
 *
 * Le premier script pose le `dataLayer` et refuse tout **avant** que GTM
 * ne se charge. L'ordre n'est pas cosmétique : une balise qui démarre
 * sans état de consentement se considère autorisée, et dépose ses
 * cookies avant qu'on ait pu dire non.
 *
 * `wait_for_update` laisse 500 ms à la réponse enregistrée d'un visiteur
 * connu, pour qu'il n'ait pas à re-cliquer.
 *
 * Ce script relit `zoumani.consent.v2` — la clé actuelle, qui porte les
 * deux finalités. Il lisait `zoumani.consent.analytics`, l'ancienne, à
 * une seule valeur : un visiteur connu de GTM aurait dû re-répondre, et
 * son refus de la publicité n'aurait pas été reconduit. Sans effet
 * aujourd'hui — aucun conteneur n'est configuré — mais c'est le genre de
 * détail qu'on ne retrouve pas le jour où l'on rebranche GTM.
 *
 * ═══ Pourquoi `afterInteractive` ═══
 *
 * GTM ne doit pas entrer dans le chemin critique du premier affichage :
 * il se charge une fois la page utilisable. C'est ce qui garde le LCP,
 * et un conteneur qui ralentit la page coûte plus de visiteurs qu'il n'en
 * mesure.
 *
 * ═══ Ce qu'on ne met pas ═══
 *
 * Aucune balise `<noscript>` avec l'iframe habituelle. Elle ne sert qu'à
 * compter les visiteurs sans JavaScript — une fraction infime — et
 * dépose un cookie sans qu'aucun consentement n'ait pu être recueilli,
 * puisque le bandeau lui-même a besoin de JavaScript.
 */
export function GoogleTagManager() {
  const id = env.NEXT_PUBLIC_GTM_ID;
  if (!id) return null;

  return (
    <>
      {/* ═══ Une balise brute, et non `next/script` ═══

          Ce script doit s'exécuter **avant** tout le reste : une balise
          qui démarre sans état de consentement se considère autorisée, et
          dépose ses cookies avant qu'on ait pu dire non.

          `next/script` en `beforeInteractive` ferait la même chose, mais
          n'est pas prévu hors du document racine — le linter le signale,
          à raison. Une balise `<script>` posée ici est plus simple et
          plus sûre : le navigateur l'exécute là où elle se trouve.

          `wait_for_update` laisse 500 ms à la réponse enregistrée d'un
          visiteur connu, pour qu'il n'ait pas à re-cliquer. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{var c=JSON.parse(localStorage.getItem('zoumani.consent.v2')||'null');if(c&&(c.analytics||c.marketing)){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied'});}}catch(e){}`,
        }}
      />
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`}
      </Script>
    </>
  );
}
