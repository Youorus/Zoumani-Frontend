import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { homeContent } from "@/features/home/components/home-content";
import { ENTRY_PAGES, entryPageBySlug } from "@/features/prelaunch/model/entry-pages";
import { siteConfig } from "@/lib/seo/site";
import { buildGraph, faqSchema, serviceSchema } from "@/lib/seo/structured-data";
import styles from "./page.module.css";

/**
 * Les deux pages d'entrée par intention.
 *
 * ═══ Une route dynamique pour deux pages figées ═══
 *
 * `generateStaticParams` les produit à la compilation : elles sont aussi
 * statiques que si elles étaient écrites à la main, et une troisième
 * s'ajoutera par une entrée de `ENTRY_PAGES`, sans dupliquer une mise en
 * page.
 *
 * `dynamicParams = false` est le garde-fou : une adresse inventée rend
 * 404 plutôt que de fabriquer une page vide à la demande. C'est ce qui
 * empêche cette route de dériver vers des centaines de pages faibles.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return ENTRY_PAGES.map((page) => ({ intention: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ intention: string }>;
}): Promise<Metadata> {
  const { intention } = await params;
  const page = entryPageBySlug(intention);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: `${page.title} | ${siteConfig.name}`,
      description: page.description,
      url: `${siteConfig.url}/${page.slug}`,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ intention: string }>;
}) {
  const { intention } = await params;
  const page = entryPageBySlug(intention);
  if (!page) notFound();

  const other = ENTRY_PAGES.find((p) => p.slug !== page.slug);
  const { faq } = homeContent.fr;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        {/* Un seul H1 par page, et c'est celui-ci. */}
        <h1 className={styles.title}>{page.h1}</h1>
        <p className={styles.lede}>{page.lede}</p>

        <Link href={`/preinscription?type=${page.intention}`} className={styles.cta}>
          {page.cta}
        </Link>

        <ul className={styles.benefits}>
          {page.benefits.map((benefit) => (
            <li key={benefit.title} className={styles.benefit}>
              <h2 className={styles.benefitTitle}>{benefit.title}</h2>
              <p className={styles.benefitText}>{benefit.text}</p>
            </li>
          ))}
        </ul>

        {/* Le lien vers l'autre versant : la moitié des visiteurs arrive
            du mauvais côté, et une page sans issue les renvoie au moteur
            de recherche. */}
        {other && (
          <p className={styles.crosslink}>
            {page.intention === "sender" ? "Vous partez bientôt en voyage ? " : "Vous avez un colis à envoyer ? "}
            <Link href={`/${other.slug}`} className={styles.crosslinkAnchor}>
              {other.h1}
            </Link>
            .
          </p>
        )}
      </section>

      {/* La FAQ du site, reprise telle quelle : ces pages posent les
          mêmes questions, et en écrire une seconde version produirait
          deux réponses à tenir d'accord. */}
      <JsonLd schema={buildGraph(serviceSchema, faqSchema(faq.items))} />
    </main>
  );
}
