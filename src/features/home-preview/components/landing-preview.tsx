import { ArrowRight, ArrowUpRight, Check, ChevronDown, CircleCheck, Globe2, Heart, Package, Plane, ShieldCheck, Truck, Users, Weight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { homeContent } from "@/features/home/components/home-content";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/features/home/components/hero/store-badges";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import { PARTNER_DEMO, PARTNER_OFFER, PREVIEW_ASSETS, partnerDemoProgress } from "../model/preview-config";
import styles from "./landing-preview.module.css";
import { PreviewInstrumentation } from "./preview-instrumentation";
import { PreviewSearch } from "./preview-search";

const STEPS = [
  { icon: SearchIcon, title: "Trouvez votre trajet", detail: "Choisissez le départ et la destination de votre colis." },
  { icon: Users, title: "Choisissez qui l’emporte", detail: "Comparez les voyageurs et les entreprises de fret." },
  { icon: Package, title: "Gardez le lien", detail: "Organisez la remise et suivez votre colis dans l’application." },
];

function SearchIcon({ size, ...props }: React.ComponentProps<typeof Globe2>) {
  return <Globe2 size={size} {...props} />;
}

const BENEFITS = [
  { icon: Users, title: "Le choix vous appartient", detail: "Un voyageur ou une entreprise de fret : trouvez le trajet qui vous convient." },
  { icon: ShieldCheck, title: "Des profils à consulter", detail: "Dates, kilos disponibles et informations du profil : vous savez avec qui vous échangez." },
  { icon: Heart, title: "Tout au même endroit", detail: "Vos échanges et le suivi de votre colis restent dans l’application Zoumani." },
];

const PARTNER_STEPS = ["Publiez vos trajets", "Recevez des demandes", "Finalisez vos premières expéditions", "Choisissez votre formule partenaire"];

export function LandingPreview() {
  const { completed, total } = partnerDemoProgress(PARTNER_OFFER.complimentaryShipments);
  const partnerUrl = buildWhatsAppUrl(homeContent.fr.whatsapp.businessMessage);
  const androidUrl = buildWhatsAppUrl(homeContent.fr.whatsapp.androidMessage);
  const faq = homeContent.fr.faq.items.filter((item) => [
    "L’application est-elle disponible sur iPhone et Android ?",
    "Combien coûte un envoi avec Zoumani ?",
    "Que puis-je envoyer, et qu’est-ce qui est interdit ?",
  ].includes(item.question));

  return (
    <div className={styles.page}>
      <a href="#contenu-v2" className={styles.skipLink}>Aller au contenu</a>
      <div className={styles.previewBar}>
        <span><span className={styles.previewDot} aria-hidden="true" /> Proposition V2 <span className={styles.previewDetail}>· L’accueil actuel est conservé</span></span>
        <Link href="/" target="_blank" className={styles.compareLink}>Comparer à l’actuelle <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
      <div className={styles.heroCanvas}>
        <header className={`${styles.container} ${styles.header}`}>
          <Link href="/preview/v2" className={styles.brand} aria-label="Zoumani, proposition V2">
            <SymboleZoumani largeur={45} />
            <ZoumaniLogo inverse className={styles.logo} />
          </Link>
          <nav aria-label="Navigation principale" className={styles.navigation}>
            <a href="#fonctionnement">Comment ça marche</a>
            <a href="#voyager">Voyageurs</a>
            <a href="#entreprises">Entreprises de fret</a>
          </nav>
          <a href={APP_STORE_URL} className={styles.headerCta} target="_blank" rel="noreferrer" data-cta="v2-header-apple">Ouvrir Zoumani <ArrowUpRight size={16} aria-hidden="true" /></a>
        </header>
        <main id="contenu-v2">
          <section className={`${styles.container} ${styles.hero}`} aria-labelledby="v2-hero-title" id="hero">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span aria-hidden="true" /> ENVOYER · VOYAGER · CONNECTER</p>
              <h1 id="v2-hero-title">Vos colis voyagent.<br /><em>Vos liens restent proches.</em></h1>
              <p className={styles.heroDescription}>Trouvez un voyageur ou une entreprise de fret pour vos colis. Vous voyagez ? Valorisez vos kilos libres.</p>
              <div className={styles.heroActions}>
                <a href="#envoyer" className={styles.primaryButton} data-cta="v2-hero-sender" data-intent-role="sender">Envoyer un colis <ArrowRight size={19} aria-hidden="true" /></a>
                <a href="#voyager" className={styles.outlineButton} data-cta="v2-hero-traveler" data-intent-role="traveler">Je voyage <Plane size={19} aria-hidden="true" /></a>
              </div>
              <a href="#entreprises" className={styles.heroBusiness} data-cta="v2-hero-business" data-intent-role="business">Je suis une entreprise de fret <ArrowUpRight size={15} aria-hidden="true" /></a>
              <div className={styles.heroFootnote}><Globe2 size={17} aria-hidden="true" /><span>Entre l’Europe, l’Afrique et ceux qui comptent.</span></div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualOrbit} aria-hidden="true" />
              <figure className={styles.portrait}>
                <Image src={PREVIEW_ASSETS.hero.src} alt={PREVIEW_ASSETS.hero.alt} fill sizes="(max-width: 600px) 82vw, (max-width: 1000px) 55vw, 440px" loading="eager" fetchPriority="high" className={styles.portraitImage} />
                <figcaption>Un colis, c’est aussi<br /><strong>une façon d’être là.</strong></figcaption>
              </figure>
              <div className={styles.productDevice}>
                <Image src={PREVIEW_ASSETS.app} alt="Capture de Zoumani : recherche de trajets, voyageurs et kilos disponibles." width={393} height={852} sizes="(max-width: 600px) 110px, 150px" className={styles.appImage} />
              </div>
              <div className={styles.routeCard}>
                <span className={styles.routeIcon}><Package size={20} aria-hidden="true" /></span>
                <div><span className={styles.routeCaption}>EXEMPLE DE TRAJET</span><strong>Paris <ArrowRight size={16} aria-hidden="true" /> Douala</strong><span>Voyageurs & entreprises de fret</span></div>
              </div>
            </div>
          </section>
          <div className={styles.mainCanvas}>
            <section id="envoyer" className={`${styles.container} ${styles.searchSection}`} aria-labelledby="search-title">
              <div className={styles.searchHeading}><div><p className={styles.kicker}>ON COMMENCE PAR VOTRE DESTINATION</p><h2 id="search-title">Où va votre colis ?</h2></div><span className={styles.searchAside}>Un départ. Une destination.<br />Des personnes pour faire le lien.</span></div>
              <PreviewSearch />
            </section>
            <section id="fonctionnement" className={`${styles.container} ${styles.howSection}`} aria-labelledby="how-title">
              <div className={styles.sectionHeading}><p className={styles.kicker}>COMMENT ÇA MARCHE</p><h2 id="how-title">Le bon trajet.<br />La bonne personne.</h2><p>Envoyer un colis commence par trois étapes simples.</p></div>
              <ol className={styles.steps}>
                {STEPS.map((step, index) => <li key={step.title}><div className={styles.stepTop}><step.icon size={25} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{step.title}</h3><p>{step.detail}</p></li>)}
              </ol>
            </section>
            <section id="pourquoi" className={`${styles.container} ${styles.benefitsSection}`} aria-labelledby="benefits-title">
              <div><p className={styles.kicker}>POURQUOI ZOUMANI</p><h2 id="benefits-title">Moins de distance.<br /><em>Plus de confiance.</em></h2><Link href="/envoyer-un-colis" className={styles.textLink}>Tout savoir sur les envois <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
              <ul className={styles.benefits}>{BENEFITS.map((benefit) => <li key={benefit.title}><span className={styles.benefitIcon}><benefit.icon size={22} aria-hidden="true" /></span><div><h3>{benefit.title}</h3><p>{benefit.detail}</p></div></li>)}</ul>
            </section>
            <section id="voyager" className={`${styles.container} ${styles.travelerSection}`} aria-labelledby="traveler-title">
              <div className={styles.travelerPhoto}><Image src={PREVIEW_ASSETS.traveler} alt="Un voyageur, sa valise et un colis, dans un aéroport." fill sizes="(max-width: 760px) 100vw, 45vw" className={styles.travelerImage} /><span className={styles.travelerPhotoNote}><Plane size={16} aria-hidden="true" /> Votre voyage peut faire le lien.</span></div>
              <div className={styles.travelerCopy}><p className={styles.kicker}>VOUS PARTEZ BIENTÔT ?</p><h2 id="traveler-title">Vos kilos libres<br />ont de la valeur.</h2><p>Publiez votre trajet et valorisez la place disponible dans votre valise.</p><div className={styles.travelerChips}><span><Weight size={16} aria-hidden="true" /> Vos kilos</span><span><Check size={16} aria-hidden="true" /> Votre tarif</span><span><Heart size={16} aria-hidden="true" /> Votre choix</span></div><a href={APP_STORE_URL} className={styles.darkButton} target="_blank" rel="noreferrer" data-cta="v2-publish-traveler" data-intent-role="traveler">Publier un voyage <ArrowRight size={18} aria-hidden="true" /></a><Link href="/proposer-un-voyage" className={styles.travelerMore}>Découvrir le parcours voyageur <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
            </section>
          </div>
          <section id="entreprises" className={styles.businessSection} aria-labelledby="business-title">
            <div className={`${styles.container} ${styles.businessGrid}`}>
              <div className={styles.businessCopy}><p className={styles.kicker}>ENTREPRISES DE FRET</p><h2 id="business-title">On vous apporte<br />d’abord des <em>clients.</em></h2><p>Rejoignez le réseau Zoumani et publiez vos trajets. Vos <strong>{total} premières expéditions finalisées</strong> apportées par Zoumani sont sans abonnement.</p><p className={styles.businessPrinciple}>À nous de vous prouver notre valeur.<br />Ensuite, vous choisissez votre formule partenaire.</p><a href={partnerUrl} className={styles.primaryButton} target="_blank" rel="noreferrer" data-cta="v2-join-business" data-intent-role="business">Rejoindre le réseau Zoumani <ArrowUpRight size={18} aria-hidden="true" /></a><span className={styles.businessContactNote}>Échangez avec l’équipe sur WhatsApp.</span><p className={styles.offerNote}>Offre proposée pour cette V2, à valider. « Sans abonnement » concerne l’accès au réseau Zoumani ; le transport conserve vos tarifs.</p></div>
              <div className={styles.partnerDashboard}>
                <div className={styles.dashboardHeader}><span className={styles.dashboardLogo}><Truck size={21} aria-hidden="true" /> Espace partenaire</span><span className={styles.demoBadge}>DÉMONSTRATION</span></div>
                <p className={styles.dashboardLabel}>Activité générée par Zoumani</p><p className={styles.dashboardValue}>{completed}<span> / {total}</span></p><p className={styles.dashboardCaption}>expéditions sans abonnement utilisées</p><progress className={styles.quotaProgress} max={total} value={completed} aria-label={`${completed} expéditions de démonstration sur ${total} sans abonnement`} /><div className={styles.quotaLabels}><span>0</span><span>{total} expéditions</span></div><dl className={styles.dashboardStats}><div><dt>Clients apportés</dt><dd>{Math.min(PARTNER_DEMO.clients, completed)}</dd></div><div><dt>Expéditions finalisées</dt><dd>{completed}</dd></div><div><dt>CA généré</dt><dd>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(PARTNER_DEMO.revenueEur)}</dd></div></dl><div className={styles.dashboardFooter}><CircleCheck size={18} aria-hidden="true" /><span>Vos {total} premières expéditions Zoumani,<br /><strong>sans abonnement.</strong></span></div><p className={styles.demoNote}>Toutes les valeurs de cette carte sont des données de démonstration.</p>
              </div>
            </div>
            <ol className={`${styles.container} ${styles.partnerSteps}`}>{PARTNER_STEPS.map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
          </section>
          <div className={styles.mainCanvas}>
            <section id="faq" className={`${styles.container} ${styles.faqSection}`} aria-labelledby="faq-title"><div><p className={styles.kicker}>AVANT DE VOUS LANCER</p><h2 id="faq-title">L’essentiel,<br />en toute clarté.</h2><p>Les réponses aux premières questions.</p></div><div className={styles.faqList}>{faq.map((item) => <details key={item.question}><summary>{item.question}<ChevronDown size={19} aria-hidden="true" /></summary><p>{item.answer}</p></details>)}<Link href="/#faq" className={styles.textLink}>Toutes les questions fréquentes <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
            <section id="telecharger" className={styles.finalSection} aria-labelledby="final-title"><div className={styles.container}><p className={styles.kicker}>ENVOYEZ VOS COLIS. RENTABILISEZ VOS VOYAGES.</p><h2 id="final-title">Votre prochain colis<br /><em>commence ici.</em></h2><a href="#envoyer" className={styles.darkButton} data-cta="v2-final-sender" data-intent-role="sender">Rechercher un trajet <ArrowRight size={20} aria-hidden="true" /></a><div className={styles.downloadLinks}><a href={APP_STORE_URL} target="_blank" rel="noreferrer" data-cta="v2-download-apple" className={styles.storeBadge}><Image src="/images/stores/app-store-badge-fr.svg" alt="Télécharger dans l’App Store" width={177} height={56} /></a>{PLAY_STORE_URL ? <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" data-cta="v2-download-play" className={styles.storeBadge}><Image src="/images/stores/google-play-badge-fr.png" alt="Disponible sur Google Play" width={194} height={75} /></a> : <a href={androidUrl} target="_blank" rel="noreferrer" className={styles.androidNote} data-cta="v2-android-notify">Android arrive. Être prévenu <ArrowUpRight size={14} aria-hidden="true" /></a>}</div></div></section>
          </div>
        </main>
        <footer className={styles.footer}><div className={styles.container}><div className={styles.footerTop}><div><div className={styles.brand}><SymboleZoumani largeur={42} /><ZoumaniLogo inverse className={styles.logo} /></div><p>Les colis voyagent.<br />Les liens restent proches.</p></div><nav aria-label="Découvrir Zoumani"><Link href="/envoyer-un-colis">Envoyer un colis</Link><Link href="/proposer-un-voyage">Proposer un voyage</Link><a href="#entreprises">Entreprises de fret</a><Link href="/#faq">Questions fréquentes</Link></nav><nav aria-label="Informations légales"><Link href="/mentions-legales">Mentions légales</Link><Link href="/cgu">Conditions générales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/cookies">Cookies</Link></nav></div><div className={styles.footerBottom}><span>© 2026 Zoumani. Tous droits réservés.</span><span>Fait pour rapprocher.</span></div></div></footer>
      </div>
      <PreviewInstrumentation />
    </div>
  );
}
