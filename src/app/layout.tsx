import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import type { PropsWithChildren } from "react";

import "./globals.css";

import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig, siteUrl, isIndexable } from "@/lib/seo/site";
import { buildGraph, organizationSchema, websiteSchema } from "@/lib/seo/structured-data";

import { AnalyticsRuntime } from "@/components/analytics/analytics-runtime";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { MicrosoftClarity } from "@/components/analytics/clarity";
import { ConsentDefaults, GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleTagManager } from "@/components/analytics/google-tag-manager";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { AppProviders } from "./providers";

/**
 * Deux familles : Manrope pour ce qui se lit, Bricolage Grotesque pour ce
 * qui s'affiche.
 *
 * ═══ Pourquoi une seconde grotesque, et pas un serif ═══
 *
 * Le site n'utilisait que Manrope : cohérent avec l'application, et
 * interchangeable avec mille vitrines. Un serif a été essayé — trop
 * éditorial pour une plateforme qui veut se lire comme une startup.
 * Bricolage Grotesque garde le registre des grandes marques logicielles
 * — une grotesque serrée, des titres en gras, des chiffres qui tiennent
 * la page — avec des formes assez singulières (le « g », le « a », les
 * terminaisons) pour qu'on la reconnaisse sans la nommer. Ses axes
 * optique et de chasse permettent des titres très grands sans lourdeur.
 *
 * L'application, elle, reste en Manrope : une application n'est pas une
 * affiche.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz", "wdth"],
});

export const metadata: Metadata = {
  // Permet a tous les champs URL des pages enfants d'utiliser des chemins relatifs.
  metadataBase: new URL(siteUrl),

  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "travel",
  authors: [{ name: siteConfig.name, url: siteUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,

  // Pas de hreflang : le basculement FR/EN est un etat client, il n'existe
  // qu'une seule URL indexable par page.
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    locale: siteConfig.locale,
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/opengraph-image?v=3",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.shortDescription}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    // Omis tant que le compte officiel n'existe pas : `@zoumani` désigne
    // quelqu'un d'autre, et l'annoncer lui attribuait chaque partage.
    ...(siteConfig.twitter
      ? { site: siteConfig.twitter, creator: siteConfig.twitter }
      : {}),
    images: ["/opengraph-image?v=3"],
  },

  // Tant qu'aucun domaine public n'est configure, le site reste hors index.
  robots: isIndexable
    ? {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          noimageindex: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : { index: false, follow: false },

  verification: {
    google: siteConfig.verification.google,
    yandex: siteConfig.verification.yandex,
    other: siteConfig.verification.bing
      ? { "msvalidate.01": siteConfig.verification.bing }
      : undefined,
  },

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    title: siteConfig.shortTitle,
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#17120f" },
  ],
};

/*
 * Volontairement **non** asynchrone, et sans lecture de cookie.
 *
 * Y lire la session ferait basculer toute l'application en rendu
 * dynamique : la page d'accueil, qui est l'entrée des moteurs de
 * recherche, cesserait d'être servie statiquement. Le seul gain aurait
 * été d'éviter un bref « Je suis voyageur » avant que le bouton ne
 * devienne « Mon espace ». Ce n'est pas un échange raisonnable.
 */
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${bricolage.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Le consentement, puis le conteneur : une balise qui démarre
            sans état de consentement se considère autorisée. Les deux ne
            rendent rien tant qu'aucun identifiant GTM n'est configuré. */}
        {/* L'ordre compte : le consentement par défaut, puis les
            mesureurs. Une balise qui démarre sans état de consentement
            se considère autorisée. */}
        <ConsentDefaults />
        <GoogleTagManager />
        <GoogleAnalytics />
        {/* Avant les pages : son effet retient la campagne d'arrivée
            aussitôt, et les effets d'un frère précédent sont vidés avant
            ceux qui suivent. C'est ce qui garantit que `landing_viewed`
            trouve l'attribution déjà en place. */}
        <AnalyticsRuntime />
        <AppProviders>{children}</AppProviders>
        <ConsentBanner />
        <MicrosoftClarity />
        <MetaPixel />
        <JsonLd schema={buildGraph(organizationSchema, websiteSchema)} />
      </body>
    </html>
  );
}
