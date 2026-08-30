export type HomeLanguage = "fr" | "en";

/**
 * Où la navigation peut mener.
 *
 * Des **ancres** d’abord : la vitrine tenait en une page, et le typage
 * empêche d’écrire un lien vers une section qui n’existe pas.
 *
 * Et depuis la préinscription, une **route**. Elle est énumérée comme le
 * reste plutôt que d’ouvrir le type à `string` : une adresse mal écrite
 * doit échouer à la compilation, pas produire un 404 découvert par un
 * visiteur venu d’une publicité.
 */
export type HomeSectionHref =
  | "#telecharger"
  | "#fonctionnement"
  | "#securite"
  | "#partenaires"
  | "#faq"
  | "/preinscription"
  | "/confidentialite"
  | "/mentions-legales";

export interface HomeStep {
  number: string;
  title: string;
  detail: string;
}

export interface HomeContent {
  navigation: ReadonlyArray<{ href: HomeSectionHref; label: string }>;
  language: {
    triggerLabel: string;
    menuLabel: string;
  };
  mobileMenu: {
    title: string;
    description: string;
  };
  downloadCta: string;

  hero: {
    /** La pastille au-dessus du titre. */
    eyebrow: string;
    /** « Envoyez vos colis. » — en bordeaux, la couleur de la marque. */
    titleLineOne: string;
    /** « Rentabilisez vos voyages. » — en orange : la promesse qu’on ne devine pas. */
    titleLineTwo: string;
    /** `{accent}` y marque le fragment à mettre en gras. */
    description: string;
    descriptionAccent: string;
    /** Les trois garanties du bandeau bas, en réponse au doute immédiat. */
    trust: ReadonlyArray<{ title: string; detail: string }>;
    /** L’écran d’application montré dans le téléphone. */
    /**
     * L'appel à rejoindre la liste de lancement.
     *
     * Il a remplacé le téléphone en trompe-l'œil et ses trois voyageurs.
     * Ceux-là s'appelaient Alex D., Fatou N. et Samuel K., affichaient des
     * prix et une pastille « vérifié » : personne n'existait. Montrer une
     * offre qu'on n'a pas est le plus court chemin vers la déception au
     * premier vrai écran.
     */
    waitlist: {
      title: string;
      lede: string;
      senderCta: string;
      travelerCta: string;
      note: string;
    };
  };

  /** Les badges de magasin, partagés par le hero et le pied de page. */
  stores: {
    locale: HomeLanguage;
    appleTop: string;
    appleBottom: string;
    playTop: string;
    playBottom: string;
    /** Affiché tant que l’application n’est publiée sur aucun magasin. */
    soon: string;
  };

  partners: {
    eyebrow: string;
    title: string;
    description: string;
    listLabel: string;
    disclaimer: string;
  };

  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    /** Deux parcours, deux onglets : on ne lit que le sien. */
    tabs: ReadonlyArray<{ id: string; label: string; steps: readonly HomeStep[] }>;
    /** `{accent}` y marque le fragment à mettre en gras. */
    guarantee: string;
    guaranteeAccent: string;
  };

  faq: {
    eyebrow: string;
    title: string;
    description: string;
    contactCta: string;
    items: ReadonlyArray<{ question: string; answer: string }>;
  };

  footer: {
    title: string;
    description: string;
    linkGroups: ReadonlyArray<{
      title: string;
      /** Sans `href` ni `whatsapp`, le libellé reste du texte : la page
       *  n’existe pas encore, et un lien mort coûte plus cher qu’un mot. */
      links: ReadonlyArray<{
        label: string;
        href?: HomeSectionHref;
        whatsapp?: boolean;
      }>;
    }>;
    legal: string;
    storeLegal: string;
    legalLinks: readonly string[];
  };

  whatsapp: {
    ariaLabel: string;
    message: string;
  };
}

export const homeContent: Record<HomeLanguage, HomeContent> = {
  fr: {
    navigation: [
      { href: "#fonctionnement", label: "Comment ça marche" },
      { href: "#securite", label: "Sécurité" },
      { href: "#partenaires", label: "Partenaires" },
      { href: "#faq", label: "FAQ" },
      { href: "/preinscription", label: "Pré-inscription" },
    ],
    language: {
      triggerLabel: "Choisir la langue",
      menuLabel: "Langue",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Retrouvez les sections de la page.",
    },
    downloadCta: "Rejoindre la liste",

    hero: {
      eyebrow: "France · Afrique · Le monde",
      titleLineOne: "Envoyez vos colis.",
      titleLineTwo: "Rentabilisez vos voyages.",
      description:
        "Zoumani connecte {accent} pour des envois simples, sécurisés et humains.",
      descriptionAccent: "expéditeurs et voyageurs",
      trust: [
        {
          title: "Voyageurs vérifiés",
          detail: "Profils contrôlés pour votre tranquillité.",
        },
        {
          title: "Colis sécurisés",
          detail: "Chaque colis est suivi jusqu’à sa remise.",
        },
        {
          title: "Communauté humaine",
          detail: "Des échanges simples, respectueux et bienveillants.",
        },
      ],
      waitlist: {
        title: "Zoumani ouvre bientôt",
        lede: "Dites-nous votre trajet. Nous vous prévenons dès qu’il s’ouvre.",
        senderCta: "J’ai un colis à envoyer",
        travelerCta: "Je pars bientôt en voyage",
        note: "Une minute, sans créer de compte.",
      },
    },

    stores: {
      locale: "fr",
      appleTop: "Télécharger sur l’",
      appleBottom: "App Store",
      playTop: "Disponible sur",
      playBottom: "Google Play",
      soon: "Bientôt",
    },

    partners: {
      eyebrow: "Transport & protection",
      title: "Votre colis avance. Sa valeur reste protégée.",
      description:
        "Zoumani s’appuie sur les acteurs de l’acheminement et de l’assurance pour couvrir le trajet, du dépôt jusqu’à la remise.",
      listLabel: "Écosystème de transport et d’assurance",
      disclaimer:
        "Partenariats, garanties, plafonds et exclusions présentés à titre exploratoire, sous réserve d’accord et des conditions du contrat sélectionné.",
    },

    howItWorks: {
      eyebrow: "Comment ça marche",
      title: "Trois étapes. Zoumani s’occupe de tout le reste.",
      description:
        "Vous ne cherchez personne, vous ne négociez rien. La plateforme vérifie, met en relation et sécurise l’argent.",
      tabs: [
        {
          id: "expediteur",
          label: "J’envoie un colis",
          steps: [
            {
              number: "01",
              title: "Décrivez votre envoi",
              detail:
                "D’où il part, où il va, ce qu’il contient. Le contenu déclaré est contrôlé avant d’aller plus loin.",
            },
            {
              number: "02",
              title: "Choisissez un voyageur",
              detail:
                "La plateforme vous présente les voyageurs vérifiés qui font déjà le trajet. Vous comparez, vous réservez.",
            },
            {
              number: "03",
              title: "Suivez jusqu’à la remise",
              detail:
                "Vous suivez le colis étape par étape. Le voyageur n’est payé qu’une fois le colis remis.",
            },
          ],
        },
        {
          id: "voyageur",
          label: "Je voyage",
          steps: [
            {
              number: "01",
              title: "Publiez votre voyage",
              detail:
                "Votre trajet, vos dates, les kilos libres dans votre bagage. La vérification d’identité ne se fait qu’une fois.",
            },
            {
              number: "02",
              title: "Acceptez les colis",
              detail:
                "Zoumani vous envoie des demandes déjà contrôlées. Vous gardez la main sur ce que vous emportez.",
            },
            {
              number: "03",
              title: "Remettez, encaissez",
              detail:
                "À l’arrivée, vous remettez le colis au destinataire. Le paiement est libéré sur votre compte.",
            },
          ],
        },
      ],
      guarantee:
        "Vérification d’identité, mise en relation, paiement séquestré, suivi : {accent}. Vous n’échangez ni argent ni coordonnées en direct.",
      guaranteeAccent: "Zoumani s’en charge",
    },

    faq: {
      eyebrow: "Questions fréquentes",
      title: "Tout ce qu’on nous demande avant de télécharger.",
      description:
        "Une question qui n’est pas là ? Écrivez-nous, la réponse rejoindra cette page.",
      contactCta: "Poser une question",
      items: [
        {
          question: "Qu’est-ce que Zoumani ?",
          answer:
            "Zoumani est une application de cotransportage : elle met en relation les personnes qui ont un colis à envoyer et les voyageurs qui ont de la place dans leurs bagages. Zoumani ne transporte rien elle-même — elle vérifie les identités, sécurise le paiement et suit l’acheminement jusqu’à la remise.",
        },
        {
          question: "Comment envoyer un colis avec un voyageur ?",
          answer:
            "Vous décrivez votre envoi dans l’application — départ, destination, contenu, poids. Zoumani vous propose les voyageurs vérifiés qui font déjà ce trajet. Vous en choisissez un, vous payez dans l’application, et vous suivez le colis jusqu’à sa remise au destinataire.",
        },
        {
          question: "Combien coûte un envoi avec Zoumani ?",
          answer:
            "Le prix dépend du poids du colis, du trajet et du voyageur choisi. Il s’affiche en toutes lettres avant la réservation et n’augmente pas ensuite : ce que vous voyez est ce que vous payez.",
        },
        {
          question: "Comment les voyageurs sont-ils vérifiés ?",
          answer:
            "Chaque voyageur passe une vérification d’identité avant de pouvoir accepter un colis : pièce d’identité contrôlée et coordonnées confirmées. Au fil de ses voyages, son profil porte aussi l’historique des avis laissés par les expéditeurs.",
        },
        {
          question: "Quand le voyageur est-il payé ?",
          answer:
            "Jamais avant la remise. Le montant est retenu par Zoumani au moment de la réservation et n’est libéré sur le compte du voyageur qu’une fois le colis remis au destinataire.",
        },
        {
          question: "Que puis-je envoyer, et qu’est-ce qui est interdit ?",
          answer:
            "Vous déclarez le contenu à l’avance et il est contrôlé avant le départ. Tout ce que la réglementation aérienne et douanière interdit est refusé : espèces, produits dangereux ou inflammables, denrées périssables, substances réglementées et marchandises soumises à taxe.",
        },
        {
          question: "Vers quels pays Zoumani fonctionne-t-il ?",
          answer:
            "Zoumani fonctionne partout où un voyageur publie un trajet. Les liaisons entre l’Europe et l’Afrique sont les plus fournies, parce que c’est là que le besoin d’envoyer est le plus fort.",
        },
        {
          question: "Mon colis est-il assuré ?",
          answer:
            "Une protection contre la perte, le vol et les dommages peut être ajoutée à l’envoi, auprès d’assureurs partenaires. Les garanties, les plafonds et les exclusions dépendent de l’option retenue et du contrat de l’assureur.",
        },
        {
          question: "L’application est-elle disponible sur iPhone et Android ?",
          answer:
            "Zoumani sortira sur l’App Store et sur Google Play. Les badges de cette page deviendront des liens le jour de la publication — d’ici là, ils portent la mention « Bientôt ».",
        },
      ],
    },

    footer: {
      title: "Votre colis part avec le prochain voyageur.",
      description:
        "Tout se passe dans l’application : la recherche, la vérification, le paiement et le suivi.",
      linkGroups: [
        {
          title: "Zoumani",
          links: [
            { label: "Comment ça marche", href: "#fonctionnement" },
            { label: "Partenaires", href: "#partenaires" },
            { label: "Rejoindre la liste", href: "/preinscription" },
          ],
        },
        {
          title: "Expédier",
          links: [
            { label: "Envoyer un colis" },
            { label: "Contenus autorisés" },
            { label: "Suivre un colis" },
          ],
        },
        {
          title: "Voyager",
          links: [
            { label: "Publier un voyage" },
            { label: "Vérification d’identité" },
            { label: "Rémunération" },
          ],
        },
        {
          title: "Aide",
          links: [
            { label: "Questions fréquentes", href: "#faq" },
            { label: "Confidentialité", href: "/confidentialite" },
            { label: "Mentions légales", href: "/mentions-legales" },
            { label: "Nous contacter sur WhatsApp", whatsapp: true },
          ],
        },
      ],
      legal: "Tous droits réservés.",
      storeLegal:
        "Apple et le logo Apple sont des marques d’Apple Inc. Google Play et le logo Google Play sont des marques de Google LLC.",
      legalLinks: ["Mentions légales", "CGU", "Confidentialité", "Cookies"],
    },

    whatsapp: {
      ariaLabel: "Contacter Zoumani sur WhatsApp",
      message: "Bonjour Zoumani, j’ai une question sur le service.",
    },
  },

  en: {
    navigation: [
      { href: "#fonctionnement", label: "How it works" },
      { href: "#securite", label: "Safety" },
      { href: "#partenaires", label: "Partners" },
      { href: "#faq", label: "FAQ" },
      { href: "/preinscription", label: "Join the waitlist" },
    ],
    language: {
      triggerLabel: "Choose a language",
      menuLabel: "Language",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Jump to a section of the page.",
    },
    downloadCta: "Join the waitlist",

    hero: {
      eyebrow: "France · Africa · Worldwide",
      titleLineOne: "Send your parcels.",
      titleLineTwo: "Make your trips pay.",
      description:
        "Zoumani connects {accent} for simple, secure and human deliveries.",
      descriptionAccent: "senders and travellers",
      trust: [
        {
          title: "Verified travellers",
          detail: "Profiles checked for your peace of mind.",
        },
        {
          title: "Secure parcels",
          detail: "Every parcel is tracked until handover.",
        },
        {
          title: "A human community",
          detail: "Simple, respectful and thoughtful exchanges.",
        },
      ],
      waitlist: {
        title: "Zoumani opens soon",
        lede: "Tell us your route. We’ll let you know as soon as it opens.",
        senderCta: "I have a parcel to send",
        travelerCta: "I’m travelling soon",
        note: "One minute, no account needed.",
      },
    },

    stores: {
      locale: "en",
      appleTop: "Download on the",
      appleBottom: "App Store",
      playTop: "Get it on",
      playBottom: "Google Play",
      soon: "Soon",
    },

    partners: {
      eyebrow: "Shipping & protection",
      title: "Your parcel moves. Its value stays protected.",
      description:
        "Zoumani builds on established shipping and insurance players to cover the journey, from drop-off to handover.",
      listLabel: "Shipping and insurance ecosystem",
      disclaimer:
        "Partnerships, cover, limits and exclusions shown for illustration, subject to agreement and to the terms of the selected policy.",
    },

    howItWorks: {
      eyebrow: "How it works",
      title: "Three steps. Zoumani handles everything else.",
      description:
        "You search for no one and negotiate nothing. The platform verifies, connects and secures the money.",
      tabs: [
        {
          id: "expediteur",
          label: "I’m sending a parcel",
          steps: [
            {
              number: "01",
              title: "Describe your parcel",
              detail:
                "Where it leaves from, where it goes, what is inside. The declared contents are checked before anything else.",
            },
            {
              number: "02",
              title: "Pick a traveller",
              detail:
                "The platform shows you the verified travellers already making that trip. You compare, you book.",
            },
            {
              number: "03",
              title: "Follow it to the handover",
              detail:
                "You track the parcel step by step. The traveller is only paid once it has been handed over.",
            },
          ],
        },
        {
          id: "voyageur",
          label: "I’m travelling",
          steps: [
            {
              number: "01",
              title: "Post your trip",
              detail:
                "Your route, your dates, the spare kilos in your luggage. Identity verification happens only once.",
            },
            {
              number: "02",
              title: "Accept parcels",
              detail:
                "Zoumani sends you requests that have already been checked. You stay in control of what you carry.",
            },
            {
              number: "03",
              title: "Hand over, get paid",
              detail:
                "On arrival you hand the parcel to the recipient. The payment is released to your account.",
            },
          ],
        },
      ],
      guarantee:
        "Identity checks, matching, escrowed payment, tracking: {accent}. You never exchange money or contact details directly.",
      guaranteeAccent: "Zoumani takes care of it",
    },

    faq: {
      eyebrow: "Frequently asked questions",
      title: "Everything people ask before downloading.",
      description:
        "Not seeing your question? Write to us — the answer will join this page.",
      contactCta: "Ask a question",
      items: [
        {
          question: "What is Zoumani?",
          answer:
            "Zoumani is a crowdshipping app: it connects people who have a parcel to send with travellers who have room in their luggage. Zoumani carries nothing itself — it verifies identities, secures the payment and tracks the journey through to the handover.",
        },
        {
          question: "How do I send a parcel with a traveller?",
          answer:
            "You describe your parcel in the app — origin, destination, contents, weight. Zoumani shows you the verified travellers already making that trip. You pick one, you pay in the app, and you follow the parcel until it reaches the recipient.",
        },
        {
          question: "How much does sending a parcel cost?",
          answer:
            "The price depends on the weight of the parcel, the route and the traveller you pick. It is shown in full before you book and does not go up afterwards: what you see is what you pay.",
        },
        {
          question: "How are travellers verified?",
          answer:
            "Every traveller goes through identity verification before they can accept a parcel: ID checked and contact details confirmed. As they travel, their profile also carries the reviews left by senders.",
        },
        {
          question: "When is the traveller paid?",
          answer:
            "Never before the handover. Zoumani holds the amount from the moment you book, and releases it to the traveller’s account only once the parcel has reached the recipient.",
        },
        {
          question: "What can I send, and what is forbidden?",
          answer:
            "You declare the contents in advance and they are checked before departure. Anything air and customs regulations forbid is refused: cash, dangerous or flammable goods, perishables, controlled substances and dutiable merchandise.",
        },
        {
          question: "Which countries does Zoumani cover?",
          answer:
            "Zoumani works anywhere a traveller posts a trip. Routes between Europe and Africa are the busiest, because that is where the need to send is strongest.",
        },
        {
          question: "Is my parcel insured?",
          answer:
            "Cover against loss, theft and damage can be added to a shipment through partner insurers. The guarantees, limits and exclusions depend on the option chosen and on the insurer’s policy.",
        },
        {
          question: "Is the app available on iPhone and Android?",
          answer:
            "Zoumani is coming to the App Store and Google Play. The badges on this page will become links on release day — until then they carry a “Soon” mark.",
        },
      ],
    },

    footer: {
      title: "Your parcel leaves with the next traveller.",
      description:
        "Everything happens in the app: the search, the verification, the payment and the tracking.",
      linkGroups: [
        {
          title: "Zoumani",
          links: [
            { label: "How it works", href: "#fonctionnement" },
            { label: "Partners", href: "#partenaires" },
            { label: "Join the waitlist", href: "/preinscription" },
          ],
        },
        {
          title: "Sending",
          links: [
            { label: "Send a parcel" },
            { label: "Accepted contents" },
            { label: "Track a parcel" },
          ],
        },
        {
          title: "Travelling",
          links: [
            { label: "Post a trip" },
            { label: "Identity verification" },
            { label: "Getting paid" },
          ],
        },
        {
          title: "Help",
          links: [
            { label: "FAQ", href: "#faq" },
            { label: "Privacy", href: "/confidentialite" },
            { label: "Legal notice", href: "/mentions-legales" },
            { label: "Message us on WhatsApp", whatsapp: true },
          ],
        },
      ],
      legal: "All rights reserved.",
      storeLegal:
        "Apple and the Apple logo are trademarks of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.",
      legalLinks: ["Legal notice", "Terms", "Privacy", "Cookies"],
    },

    whatsapp: {
      ariaLabel: "Message Zoumani on WhatsApp",
      message: "Hello Zoumani, I have a question about the service.",
    },
  },
};
