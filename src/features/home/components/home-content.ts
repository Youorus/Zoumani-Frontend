export type HomeLanguage = "fr" | "en";

/**
 * Où la navigation peut mener.
 *
 * Des **ancres** d'abord : la vitrine tient en une page, et le typage
 * empêche d'écrire un lien vers une section qui n'existe pas. Puis les
 * **routes**, énumérées : une adresse mal écrite doit échouer à la
 * compilation, pas produire un 404 découvert par un visiteur venu d'une
 * publicité.
 */
export type HomeSectionHref =
  | "#telecharger"
  | "#envoyer"
  | "#voyager"
  | "#entreprises"
  | "#fonctionnement"
  | "#partenaires"
  | "#faq"
  | "/envoyer-un-colis"
  | "/proposer-un-voyage"
  | "/confidentialite"
  | "/mentions-legales"
  | "/cgu"
  | "/cookies";

export interface HomeStep {
  number: string;
  title: string;
  detail: string;
}

/** Les trois publics de la page. L'ordre est celui des chapitres. */
export type AudienceId = "sender" | "traveler" | "business";

export interface HomeContent {
  navigation: ReadonlyArray<{ href: HomeSectionHref; label: string }>;
  /** Le bouton de la barre : il mène au magasin, et le dit. */
  headerCta: string;
  language: {
    triggerLabel: string;
    menuLabel: string;
  };
  mobileMenu: {
    title: string;
    description: string;
  };

  hero: {
    /** « Disponible sur l'App Store · Android bientôt » */
    eyebrow: string;
    /** Le titre, en deux lignes. `{em}` marque le mot en italique orange. */
    title: string;
    titleEmphasis: string;
    /** `{accent}` y marque le fragment à mettre en gras. */
    description: string;
    descriptionAccent: string;
    secondaryCta: string;
    note: string;
    /** La bande qui défile sous le hero. */
    tickerLabel: string;
    ticker: readonly string[];
    phoneAlt: string;
  };

  /**
   * Les indicateurs : quatre chiffres **vrais**, datés.
   *
   * Chacun vient d'une donnée qu'on peut produire — la table des agences
   * démarchées, la liste des pays de destination, une règle du produit.
   * Aucun compteur d'utilisateurs ni de colis : ils sont trop petits pour
   * être écrits, et un chiffre gonflé se découvre au lancement. La date
   * en pied dit quand ils ont été relevés ; ils se mettent à jour ici.
   */
  signals: {
    items: ReadonlyArray<{ value: string; label: string; detail: string }>;
    asOf: string;
  };

  /**
   * Les réseaux de transport et d'assurance.
   *
   * Des logos, en gris, sous un titre qui dit « s'appuie sur » et non
   * « partenaire » : les transporteurs sont ceux qu'on atteint par
   * l'étiquette créée dans l'application ; les assureurs sont à l'étude.
   * L'avertissement le dit en clair, sous la bande.
   */
  partners: {
    eyebrow: string;
    title: string;
    description: string;
    carriersLabel: string;
    insurersLabel: string;
    disclaimer: string;
  };

  /**
   * Le colis qui n'attend plus : des expéditeurs partout en Europe, un
   * point relais près de chez eux, le voyageur qui part. Dessiné, pas
   * seulement dit.
   */
  reach: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    /** Les trois colonnes du schéma. */
    senders: { label: string; cities: readonly string[] };
    relay: { label: string; title: string; detail: string };
    traveler: { label: string; title: string; detail: string };
    /** La phrase posée sous le schéma. */
    caption: string;
  };

  /**
   * Les trois chapitres : à qui le service s'adresse, et ce qu'il lui
   * apporte. Chacun a son canevas, sa voix et son appel.
   */
  audiences: {
    eyebrow: string;
    title: string;
    chapters: ReadonlyArray<{
      id: AudienceId;
      index: string;
      eyebrow: string;
      title: string;
      titleEmphasis: string;
      lede: string;
      points: ReadonlyArray<{ title: string; detail: string }>;
      cta: { label: string; kind: "store" | "link" | "whatsapp"; href?: HomeSectionHref };
      secondaryCta?: { label: string; kind: "store" | "link" | "whatsapp"; href?: HomeSectionHref };
      /**
       * Le chapitre entreprise porte l'essai. Les montants des offres
       * n'y figurent pas : ils sont en cours de validation, et un prix
       * affiché puis changé coûte plus cher qu'un prix tu.
       */
      offers?: {
        intro: string;
        trial: string;
        today: string;
      };
    }>;
  };

  howItWorks: {
    eyebrow: string;
    title: string;
    description: string;
    tabs: ReadonlyArray<{ id: string; label: string; steps: readonly HomeStep[] }>;
  };

  network: {
    eyebrow: string;
    title: string;
    description: string;
    liveLabel: string;
    soonLabel: string;
    cards: ReadonlyArray<{
      id: "fret" | "vols" | "relais" | "assurance";
      tag: string;
      title: string;
      detail: string;
      soon: boolean;
    }>;
    trademark: string;
  };

  faq: {
    eyebrow: string;
    title: string;
    description: string;
    contactCta: string;
    items: ReadonlyArray<{ question: string; answer: string }>;
  };

  download: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    android: string;
    androidCta: string;
  };

  stores: {
    locale: HomeLanguage;
    appleTop: string;
    appleBottom: string;
    playTop: string;
    playBottom: string;
    soon: string;
  };

  footer: {
    title: string;
    description: string;
    linkGroups: ReadonlyArray<{
      title: string;
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
    /** Le message préécrit d'une entreprise de fret. */
    businessMessage: string;
    /** Le message préécrit de qui veut être prévenu de la sortie Android. */
    androidMessage: string;
  };
}

export const homeContent: Record<HomeLanguage, HomeContent> = {
  fr: {
    navigation: [
      { href: "#envoyer", label: "Envoyer" },
      { href: "#voyager", label: "Voyager" },
      { href: "#entreprises", label: "Entreprises" },
      { href: "#fonctionnement", label: "Comment ça marche" },
      { href: "#faq", label: "FAQ" },
    ],
    headerCta: "Télécharger",
    language: {
      triggerLabel: "Choisir la langue",
      menuLabel: "Langue",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Retrouvez les sections de la page.",
    },

    hero: {
      eyebrow: "Disponible sur l’App Store · Android arrive",
      title: "Envoyez vos colis. {em}",
      titleEmphasis: "Rentabilisez vos voyages.",
      description:
        "La place de marché qui relie expéditeurs, voyageurs et compagnies de fret entre l’Europe et l’Afrique. {accent}",
      descriptionAccent: "Identités vérifiées, vols confirmés, entreprises établies.",
      secondaryCta: "Je suis une entreprise de fret",
      note: "Gratuit pour les particuliers. Sans engagement.",
      tickerLabel: "Corridors Europe → Afrique",
      ticker: [
        "Paris → Dakar",
        "Paris → Douala",
        "Paris → Abidjan",
        "Paris → Bamako",
        "Paris → Yaoundé",
        "Paris → Casablanca",
        "Paris → Alger",
        "Paris → Tunis",
        "Paris → Kinshasa",
        "Paris → Lomé",
        "Paris → Cotonou",
        "Paris → Conakry",
        "Paris → Libreville",
        "Paris → Brazzaville",
        "Paris → Ouagadougou",
        "Paris → Niamey",
        "Paris → Nouakchott",
        "Paris → Antananarivo",
        "Bruxelles → Kinshasa",
        "Bruxelles → Dakar",
        "Bruxelles → Abidjan",
        "Lyon → Casablanca",
        "Lyon → Alger",
        "Marseille → Alger",
        "Marseille → Tunis",
        "Genève → Dakar",
        "Londres → Lagos",
        "Londres → Accra",
        "Londres → Nairobi",
        "Lisbonne → Luanda",
        "Lisbonne → Praia",
        "Madrid → Malabo",
        "Milan → Dakar",
        "Rome → Addis-Abeba",
      ],
      phoneAlt: "L’application Zoumani : la recherche d’un voyageur vers Abidjan.",
    },

    signals: {
      items: [
        {
          value: "+60",
          label: "agences approchées",
          detail: "Transporteurs et agences GP France–Afrique identifiés et contactés pour publier leurs départs.",
        },
        {
          value: "+15",
          label: "pays de destination",
          detail: "Du Sénégal à Madagascar : les pays vers lesquels on nous demande d’envoyer.",
        },
        {
          value: "100 %",
          label: "des trajets vérifiés",
          detail: "Identité contrôlée et vol confronté au programme des compagnies avant toute publication.",
        },
        {
          value: "+2 000",
          label: "personnes veulent expédier",
          detail: "Des expéditeurs qui attendent un départ vers l’Afrique — et la liste grandit chaque jour.",
        },
      ],
      asOf: "Chiffres relevés le 1er octobre 2026.",
    },

    partners: {
      eyebrow: "Les réseaux",
      title: "Votre colis emprunte des réseaux qui existent déjà.",
      description:
        "Pour rejoindre le voyageur, l’étiquette créée dans l’application ouvre les réseaux de transport nationaux. Pour protéger le colis, nous discutons avec les assureurs.",
      carriersLabel: "Transport",
      insurersLabel: "Assurance — à l’étude",
      disclaimer:
        "Les marques citées appartiennent à leurs propriétaires. Zoumani utilise les réseaux de transport par l’étiquetage de l’application ; les couvertures d’assurance sont présentées à titre exploratoire, sous réserve d’accord.",
    },

    reach: {
      eyebrow: "Le colis n’attend plus",
      title: "Partout en Europe, un colis veut partir. Il trouve son {em}.",
      titleEmphasis: "voyageur",
      description:
        "De Paris à Lisbonne, des familles ont un colis à faire partir vers l’Afrique. Avant, il attendait quelqu’un du quartier qui prenne l’avion. Avec Zoumani, il rejoint le voyageur vérifié ou la compagnie de fret établie qui part cette semaine — où que vous habitiez.",
      senders: {
        label: "Des expéditeurs partout en Europe",
        cities: ["Paris", "Bruxelles", "Lyon", "Marseille", "Londres", "Lisbonne", "Madrid", "Milan", "Rome"],
      },
      relay: {
        label: "Le point relais",
        title: "Mondial Relay, près de chez vous",
        detail:
          "Vous déposez le colis avec l’étiquette créée dans l’application. Il rejoint le voyageur sans que vous traversiez la ville.",
      },
      traveler: {
        label: "Le départ",
        title: "Un voyageur vérifié, ou une compagnie de fret établie",
        detail:
          "Les deux publient leurs départs côte à côte, identité et vol contrôlés. Vous choisissez, et vous suivez chaque étape jusqu’à la remise.",
      },
      caption:
        "Le réseau Mondial Relay couvre la France, la Belgique, le Luxembourg, les Pays-Bas, l’Espagne et le Portugal. Ailleurs en Europe, le colis se remet en main propre au voyageur.",
    },

    audiences: {
      eyebrow: "Pour qui",
      title: "Trois façons d’entrer. Une seule place de marché.",
      chapters: [
        {
          id: "sender",
          index: "01",
          eyebrow: "Vous avez un colis",
          title: "Envoyez avec quelqu’un qui part {em}.",
          titleEmphasis: "déjà",
          lede:
            "Quelqu’un prend l’avion cette semaine vers la ville où votre colis doit aller. Zoumani vous le présente, vérifié, avec son prix au kilo et sa date de départ.",
          points: [
            {
              title: "Vous choisissez",
              detail:
                "Voyageurs vérifiés et compagnies de fret, côte à côte, triés par départ. Vous comparez prix, date et avis.",
            },
            {
              title: "Vous savez ce que vous payez",
              detail:
                "Le prix s’affiche en toutes lettres avant de réserver, frais compris. Il n’augmente pas ensuite.",
            },
            {
              title: "Vous ne payez qu’à l’arrivée",
              detail:
                "Le montant est retenu par Zoumani et libéré au voyageur une fois le colis remis à son destinataire.",
            },
          ],
          cta: { label: "Télécharger l’application", kind: "store" },
          secondaryCta: { label: "Comment ça marche", kind: "link", href: "#fonctionnement" },
        },
        {
          id: "traveler",
          index: "02",
          eyebrow: "Vous partez bientôt",
          title: "Vos kilos libres valent de {em}.",
          titleEmphasis: "l’argent",
          lede:
            "Vingt-trois kilos autorisés, quinze emportés. Les huit qui restent ont une valeur pour quelqu’un — et c’est vous qui fixez le prix.",
          points: [
            {
              title: "Vous fixez votre tarif",
              detail: "Au kilo ou à la pièce, par catégorie de contenu. Personne ne décide à votre place.",
            },
            {
              title: "Vous gardez la main",
              detail:
                "Le contenu est déclaré et photographié avant que vous acceptiez. Vous restez libre de refuser.",
            },
            {
              title: "Vous êtes payé à la remise",
              detail:
                "Le gain est libéré dès que le colis est remis, puis versé par virement sur votre compte.",
            },
          ],
          cta: { label: "Publier mon voyage", kind: "store" },
          secondaryCta: { label: "Ce que gagne un voyageur", kind: "link", href: "/proposer-un-voyage" },
        },
        {
          id: "business",
          index: "03",
          eyebrow: "Vous êtes une entreprise de fret",
          title: "Vous avez les vols. Nous avons les {em}.",
          titleEmphasis: "expéditeurs",
          lede:
            "Les particuliers qui cherchent à envoyer un colis vers l’Afrique ouvrent Zoumani. Publiez vos départs là où ils regardent — et laissez la plateforme encaisser, suivre et répondre à votre place.",
          points: [
            {
              title: "Des expéditeurs qui viennent à vous",
              detail:
                "Vos vols et vos kilos disponibles apparaissent là où les expéditeurs cherchent, avec la mention « entreprise vérifiée » que personne d’autre ne porte.",
            },
            {
              title: "Publiez sans friction",
              detail:
                "Vos vols en série, sans preuve de billet ni plafond de kilos. Une offre de fret se publie en quelques minutes depuis l’application.",
            },
            {
              title: "Fini les impayés et les avances",
              detail:
                "Le paiement est garanti par Zoumani à la réservation et versé par virement à la remise. Plus de relances, plus d’argent à courir.",
            },
            {
              title: "Les demandes au même endroit",
              detail:
                "Chaque réservation arrive avec le contenu déclaré et photographié, et la conversation se tient dans l’application. Plus de fils WhatsApp à trier.",
            },
            {
              title: "Vos clients savent où en est leur colis",
              detail:
                "Le suivi étape par étape et la remise constatée par les deux parties répondent à votre place aux « il est où, mon colis ? ».",
            },
            {
              title: "Les colis viennent à vous, les litiges non",
              detail:
                "L’expéditeur dépose en point relais Mondial Relay et le colis arrive à votre adresse, sans collecte. Un désaccord est instruit par l’équipe Zoumani, pas sur votre téléphone.",
            },
          ],
          cta: { label: "Parler à l’équipe", kind: "whatsapp" },
          secondaryCta: { label: "Créer mon compte entreprise", kind: "store" },
          offers: {
            intro: "60 jours offerts",
            trial: "60 jours gratuits, sans engagement, puis un abonnement mensuel ou annuel. Les tarifs vous sont communiqués par l’équipe.",
            today: "Les premières compagnies publient aujourd’hui sans abonnement.",
          },
        },
      ],
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
              title: "Choisissez qui l’emporte",
              detail:
                "Voyageurs vérifiés et compagnies de fret qui font déjà le trajet. Vous comparez, vous réservez, vous payez dans l’application.",
            },
            {
              number: "03",
              title: "Suivez jusqu’à la remise",
              detail:
                "Chaque étape est datée, du dépôt à la remise. Le voyageur n’est payé qu’une fois le colis arrivé.",
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
                "Votre vol, vos dates, les kilos libres dans votre bagage. La vérification d’identité ne se fait qu’une fois.",
            },
            {
              number: "02",
              title: "Acceptez les colis",
              detail:
                "Zoumani vous envoie des demandes déjà contrôlées, contenu déclaré et photographié. Vous gardez la main.",
            },
            {
              number: "03",
              title: "Remettez, encaissez",
              detail:
                "À l’arrivée, vous remettez le colis au destinataire. Le gain est libéré, puis versé sur votre compte.",
            },
          ],
        },
      ],
    },

    network: {
      eyebrow: "Le réseau",
      title: "Votre colis ne dépend pas d’une seule personne.",
      description: "Voici avec qui il avance, ce qui le protège, et ce qui arrive ensuite.",
      liveLabel: "En service",
      soonLabel: "À venir",
      cards: [
        {
          id: "fret",
          tag: "Compagnies de fret",
          title: "Des entreprises vérifiées, à côté des voyageurs",
          detail:
            "Chaque compagnie passe une vérification complète : l’identité de son représentant, puis un extrait d’immatriculation de moins de trois mois. Son offre porte la mention « entreprise vérifiée ».",
          soon: false,
        },
        {
          id: "vols",
          tag: "Vols confirmés",
          title: "Un trajet non vérifié ne reçoit aucun colis",
          detail:
            "Compagnie, numéro de vol, date et aéroports sont confrontés au programme des compagnies. À défaut de source exploitable, une vérification humaine se fait sur pièces.",
          soon: false,
        },
        {
          id: "relais",
          tag: "Mondial Relay",
          title: "Un point relais plutôt qu’un long trajet",
          detail:
            "Le voyageur habite loin ? Déposez votre colis dans un point relais Mondial Relay près de chez vous, avec l’étiquette créée dans l’application. Le prix de ce trajet s’affiche avant le paiement.",
          soon: false,
        },
        {
          id: "assurance",
          tag: "Assurance",
          title: "Une protection contre la perte et la casse",
          detail:
            "Nous préparons une couverture à ajouter au moment de réserver. Elle sera proposée dès qu’un accord avec un assureur sera signé — pas avant.",
          soon: true,
        },
      ],
      trademark:
        "Mondial Relay est une marque de son propriétaire. Zoumani utilise son réseau de points relais pour acheminer les colis jusqu’au voyageur.",
    },

    faq: {
      eyebrow: "Questions fréquentes",
      title: "Tout ce qu’on nous demande avant de télécharger.",
      description: "Une question qui n’est pas là ? Écrivez-nous, la réponse rejoindra cette page.",
      contactCta: "Poser une question",
      items: [
        {
          question: "Qu’est-ce que Zoumani ?",
          answer:
            "Zoumani est une application de cotransportage : elle met en relation les personnes qui ont un colis à envoyer, les voyageurs qui ont de la place dans leurs bagages et les compagnies de fret qui publient leurs vols. Zoumani ne transporte rien elle-même — elle vérifie les identités, sécurise le paiement et suit l’acheminement jusqu’à la remise.",
        },
        {
          question: "L’application est-elle disponible sur iPhone et Android ?",
          answer:
            "Zoumani est disponible dès maintenant sur l’App Store, pour iPhone. La version Android est en préparation : écrivez-nous sur WhatsApp et vous serez prévenu le jour de sa sortie sur Google Play.",
        },
        {
          question: "Comment envoyer un colis avec un voyageur ?",
          answer:
            "Vous décrivez votre envoi dans l’application — départ, destination, contenu, poids. Zoumani vous propose les voyageurs vérifiés et les compagnies de fret qui font déjà ce trajet. Vous en choisissez un, vous payez dans l’application, et vous suivez le colis jusqu’à sa remise au destinataire.",
        },
        {
          question: "Combien coûte un envoi avec Zoumani ?",
          answer:
            "Le prix dépend du poids du colis, du trajet et du voyageur ou de la compagnie choisie : chacun fixe lui-même son tarif, au kilo ou à la pièce. Le montant total s’affiche en toutes lettres avant la réservation et n’augmente pas ensuite : ce que vous voyez est ce que vous payez.",
        },
        {
          question: "Comment les voyageurs sont-ils vérifiés ?",
          answer:
            "Chaque voyageur passe une vérification d’identité avant de pouvoir accepter un colis : pièce d’identité contrôlée et coordonnées confirmées. Son vol est confronté au programme des compagnies — un trajet non vérifié ne reçoit aucun colis. Au fil de ses voyages, son profil porte l’historique des avis laissés par les expéditeurs.",
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
            "Zoumani fonctionne partout où un voyageur ou une compagnie publie un trajet. Les liaisons entre la France, la Belgique et l’Afrique de l’Ouest et centrale — Sénégal, Cameroun, Côte d’Ivoire, Mali, Maroc, RDC — sont les plus demandées, parce que c’est là que le besoin d’envoyer est le plus fort.",
        },
        {
          question: "Je suis une entreprise de fret : que m’apporte Zoumani ?",
          answer:
            "Des expéditeurs qui cherchent exactement ce que vous proposez, sans que vous ayez à les trouver. Vous créez votre compte dans l’application, votre dossier d’entreprise est vérifié, puis vous publiez vos vols et vos kilos disponibles — sans preuve de billet ni plafond. Vos offres portent le badge « entreprise vérifiée », le paiement est garanti à la réservation et versé à la remise. Les 60 premiers jours sont offerts.",
        },
        {
          question: "Mon colis est-il assuré ?",
          answer:
            "Pas encore. Une protection contre la perte, le vol et les dommages est en préparation : elle sera proposée au moment de réserver dès qu’un accord avec un assureur sera signé. En attendant, le voyageur n’est payé qu’une fois le colis remis au destinataire.",
        },
      ],
    },

    download: {
      eyebrow: "Dès aujourd’hui",
      title: "Le prochain départ est dans {em}.",
      titleEmphasis: "votre poche",
      description:
        "Téléchargez Zoumani, décrivez votre colis ou publiez votre voyage. Tout se passe dans l’application : la recherche, la vérification, le paiement et le suivi.",
      android: "Vous êtes sur Android ?",
      androidCta: "Être prévenu de la sortie",
    },

    stores: {
      locale: "fr",
      appleTop: "Télécharger sur l’",
      appleBottom: "App Store",
      playTop: "Disponible sur",
      playBottom: "Google Play",
      soon: "Bientôt",
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
            { label: "Le réseau", href: "#partenaires" },
            { label: "Questions fréquentes", href: "#faq" },
            { label: "Être prévenu sur Android", whatsapp: true },
          ],
        },
        {
          title: "Expédier",
          links: [
            { label: "Envoyer un colis", href: "/envoyer-un-colis" },
            { label: "Ce qu’on peut envoyer", href: "#faq" },
          ],
        },
        {
          title: "Voyager & entreprises",
          links: [
            { label: "Rentabiliser ses kilos", href: "/proposer-un-voyage" },
            { label: "Compagnies de fret", href: "#entreprises" },
            { label: "Nous écrire sur WhatsApp", whatsapp: true },
          ],
        },
        {
          title: "Légal",
          links: [
            { label: "Conditions générales", href: "/cgu" },
            { label: "Confidentialité", href: "/confidentialite" },
            { label: "Cookies", href: "/cookies" },
            { label: "Mentions légales", href: "/mentions-legales" },
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
      businessMessage:
        "Bonjour Zoumani, je représente une entreprise de fret et je souhaite publier mes vols sur la plateforme.",
      androidMessage:
        "Bonjour Zoumani, je suis sur Android : prévenez-moi le jour de la sortie de l’application.",
    },
  },

  en: {
    navigation: [
      { href: "#envoyer", label: "Send" },
      { href: "#voyager", label: "Travel" },
      { href: "#entreprises", label: "Companies" },
      { href: "#fonctionnement", label: "How it works" },
      { href: "#faq", label: "FAQ" },
    ],
    headerCta: "Download",
    language: {
      triggerLabel: "Choose a language",
      menuLabel: "Language",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Jump to a section of the page.",
    },

    hero: {
      eyebrow: "Available on the App Store · Android coming",
      title: "Send your parcels. {em}",
      titleEmphasis: "Make your trips pay.",
      description:
        "The marketplace connecting senders, travellers and freight companies between Europe and Africa. {accent}",
      descriptionAccent: "Verified identities, confirmed flights, established companies.",
      secondaryCta: "I’m a freight company",
      note: "Free for individuals. No commitment.",
      tickerLabel: "Europe → Africa corridors",
      ticker: [
        "Paris → Dakar",
        "Paris → Douala",
        "Paris → Abidjan",
        "Paris → Bamako",
        "Paris → Yaoundé",
        "Paris → Casablanca",
        "Paris → Algiers",
        "Paris → Tunis",
        "Paris → Kinshasa",
        "Paris → Lomé",
        "Paris → Cotonou",
        "Paris → Conakry",
        "Paris → Libreville",
        "Paris → Brazzaville",
        "Paris → Ouagadougou",
        "Paris → Niamey",
        "Paris → Nouakchott",
        "Paris → Antananarivo",
        "Brussels → Kinshasa",
        "Brussels → Dakar",
        "Brussels → Abidjan",
        "Lyon → Casablanca",
        "Lyon → Algiers",
        "Marseille → Algiers",
        "Marseille → Tunis",
        "Geneva → Dakar",
        "London → Lagos",
        "London → Accra",
        "London → Nairobi",
        "Lisbon → Luanda",
        "Lisbon → Praia",
        "Madrid → Malabo",
        "Milan → Dakar",
        "Rome → Addis Ababa",
      ],
      phoneAlt: "The Zoumani app: searching for a traveller to Abidjan.",
    },

    signals: {
      items: [
        {
          value: "+60",
          label: "agencies approached",
          detail: "France–Africa carriers and luggage-courier agencies identified and contacted to publish their departures.",
        },
        {
          value: "+15",
          label: "destination countries",
          detail: "From Senegal to Madagascar: the countries people ask us to send to.",
        },
        {
          value: "100%",
          label: "of trips verified",
          detail: "Identity checked and flight matched against airline schedules before anything is published.",
        },
        {
          value: "+2,000",
          label: "people want to send",
          detail: "Senders waiting for a departure to Africa — and the list grows every day.",
        },
      ],
      asOf: "Figures as of 1 October 2026.",
    },

    partners: {
      eyebrow: "The networks",
      title: "Your parcel travels on networks that already exist.",
      description:
        "To reach the traveller, the label created in the app opens national carrier networks. To protect the parcel, we are talking to insurers.",
      carriersLabel: "Transport",
      insurersLabel: "Insurance — under review",
      disclaimer:
        "Brands belong to their owners. Zoumani uses carrier networks through in-app labelling; insurance cover is shown for exploration only, subject to agreement.",
    },

    reach: {
      eyebrow: "The parcel no longer waits",
      title: "All over Europe, a parcel wants to leave. It finds its {em}.",
      titleEmphasis: "traveller",
      description:
        "From Paris to Lisbon, families have a parcel to send to Africa. It used to wait for someone from the neighbourhood to fly. With Zoumani, it reaches the verified traveller or the established freight company leaving this week — wherever you live.",
      senders: {
        label: "Senders all over Europe",
        cities: ["Paris", "Brussels", "Lyon", "Marseille", "London", "Lisbon", "Madrid", "Milan", "Rome"],
      },
      relay: {
        label: "The pickup point",
        title: "Mondial Relay, near you",
        detail:
          "Drop the parcel with the label created in the app. It reaches the traveller without you crossing town.",
      },
      traveler: {
        label: "The departure",
        title: "A verified traveller, or an established freight company",
        detail:
          "Both publish their departures side by side, identity and flight checked. You choose, and you follow every step through to the handover.",
      },
      caption:
        "The Mondial Relay network covers France, Belgium, Luxembourg, the Netherlands, Spain and Portugal. Elsewhere in Europe, the parcel is handed to the traveller in person.",
    },

    audiences: {
      eyebrow: "Who it’s for",
      title: "Three ways in. One marketplace.",
      chapters: [
        {
          id: "sender",
          index: "01",
          eyebrow: "You have a parcel",
          title: "Send with someone who is {em} going.",
          titleEmphasis: "already",
          lede:
            "Someone is flying this week to the city your parcel needs to reach. Zoumani shows them to you, verified, with their price per kilo and departure date.",
          points: [
            {
              title: "You choose",
              detail:
                "Verified travellers and freight companies, side by side, sorted by departure. Compare price, date and reviews.",
            },
            {
              title: "You know what you pay",
              detail: "The price is shown in full before you book, fees included. It does not go up afterwards.",
            },
            {
              title: "You only pay on arrival",
              detail:
                "Zoumani holds the amount and releases it to the traveller once the parcel reaches the recipient.",
            },
          ],
          cta: { label: "Download the app", kind: "store" },
          secondaryCta: { label: "How it works", kind: "link", href: "#fonctionnement" },
        },
        {
          id: "traveler",
          index: "02",
          eyebrow: "You’re travelling soon",
          title: "Your spare kilos are worth {em}.",
          titleEmphasis: "money",
          lede:
            "Twenty-three kilos allowed, fifteen packed. The eight left over are worth something to someone — and you set the price.",
          points: [
            {
              title: "You set your rate",
              detail: "Per kilo or per item, by type of content. Nobody decides for you.",
            },
            {
              title: "You stay in control",
              detail: "Contents are declared and photographed before you accept. You are free to decline.",
            },
            {
              title: "You’re paid on handover",
              detail: "Your earnings are released once the parcel is delivered, then paid out by bank transfer.",
            },
          ],
          cta: { label: "Post my trip", kind: "store" },
          secondaryCta: { label: "What a traveller earns", kind: "link", href: "/proposer-un-voyage" },
        },
        {
          id: "business",
          index: "03",
          eyebrow: "You’re a freight company",
          title: "You have the flights. We have the {em}.",
          titleEmphasis: "senders",
          lede:
            "People looking to send a parcel to Africa open Zoumani. Publish your departures where they are looking — and let the platform collect, track and answer on your behalf.",
          points: [
            {
              title: "Senders who come to you",
              detail:
                "Your flights and available kilos appear where senders are searching, with a “verified company” label nobody else carries.",
            },
            {
              title: "Publish without friction",
              detail:
                "Your flights in series, with no ticket proof and no kilo cap. A freight offer goes live in minutes from the app.",
            },
            {
              title: "No more unpaid invoices or advances",
              detail:
                "Payment is guaranteed by Zoumani at booking and paid out by bank transfer on handover. No more reminders, no more chasing money.",
            },
            {
              title: "Every request in one place",
              detail:
                "Each booking arrives with contents declared and photographed, and the conversation happens in the app. No more WhatsApp threads to sort.",
            },
            {
              title: "Your customers know where their parcel is",
              detail:
                "Step-by-step tracking and a handover confirmed by both parties answer “where is my parcel?” for you.",
            },
            {
              title: "Parcels come to you, disputes don’t",
              detail:
                "The sender drops the parcel at a Mondial Relay point and it reaches your address, no collection run. A disagreement is handled by the Zoumani team, not on your phone.",
            },
          ],
          cta: { label: "Talk to the team", kind: "whatsapp" },
          secondaryCta: { label: "Create my company account", kind: "store" },
          offers: {
            intro: "60 days free",
            trial: "60 days free, no commitment, then a monthly or yearly subscription. Pricing is shared by the team.",
            today: "The first companies publish today without a subscription.",
          },
        },
      ],
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
              title: "Choose who carries it",
              detail:
                "Verified travellers and freight companies already making that trip. You compare, you book, you pay in the app.",
            },
            {
              number: "03",
              title: "Follow it to the handover",
              detail:
                "Every step is dated, from drop-off to handover. The traveller is only paid once the parcel has arrived.",
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
                "Your flight, your dates, the spare kilos in your luggage. Identity verification happens only once.",
            },
            {
              number: "02",
              title: "Accept parcels",
              detail:
                "Zoumani sends you requests that have already been checked, contents declared and photographed. You stay in control.",
            },
            {
              number: "03",
              title: "Hand over, get paid",
              detail:
                "On arrival you hand the parcel to the recipient. Your earnings are released, then paid to your account.",
            },
          ],
        },
      ],
    },

    network: {
      eyebrow: "The network",
      title: "Your parcel does not depend on a single person.",
      description: "Here is who moves it, what protects it, and what comes next.",
      liveLabel: "Live",
      soonLabel: "Coming",
      cards: [
        {
          id: "fret",
          tag: "Freight companies",
          title: "Verified companies, alongside travellers",
          detail:
            "Each company goes through a full check: the identity of its representative, then a registration extract less than three months old. Its offer carries the “verified company” label.",
          soon: false,
        },
        {
          id: "vols",
          tag: "Confirmed flights",
          title: "An unverified trip receives no parcel",
          detail:
            "Airline, flight number, date and airports are checked against airline schedules. Where no usable source exists, a human review is done on documents.",
          soon: false,
        },
        {
          id: "relais",
          tag: "Mondial Relay",
          title: "A pickup point instead of a long trip",
          detail:
            "The traveller lives far away? Drop your parcel at a Mondial Relay pickup point near you, with the label created in the app. The price of that leg is shown before you pay.",
          soon: false,
        },
        {
          id: "assurance",
          tag: "Insurance",
          title: "Cover against loss and damage",
          detail:
            "We are preparing cover to add when you book. It will be offered as soon as an agreement with an insurer is signed — not before.",
          soon: true,
        },
      ],
      trademark:
        "Mondial Relay is a trademark of its owner. Zoumani uses its pickup point network to carry parcels to the traveller.",
    },

    faq: {
      eyebrow: "Frequently asked questions",
      title: "Everything people ask before downloading.",
      description: "Not seeing your question? Write to us — the answer will join this page.",
      contactCta: "Ask a question",
      items: [
        {
          question: "What is Zoumani?",
          answer:
            "Zoumani is a crowdshipping app: it connects people who have a parcel to send, travellers who have room in their luggage, and freight companies publishing their flights. Zoumani carries nothing itself — it verifies identities, secures the payment and tracks the journey through to the handover.",
        },
        {
          question: "Is the app available on iPhone and Android?",
          answer:
            "Zoumani is available now on the App Store, for iPhone. The Android version is in preparation: message us on WhatsApp and you will be told the day it reaches Google Play.",
        },
        {
          question: "How do I send a parcel with a traveller?",
          answer:
            "You describe your parcel in the app — origin, destination, contents, weight. Zoumani shows you the verified travellers and freight companies already making that trip. You pick one, you pay in the app, and you follow the parcel until it reaches the recipient.",
        },
        {
          question: "How much does sending a parcel cost?",
          answer:
            "The price depends on the weight of the parcel, the route and the traveller or company you pick: each sets their own rate, per kilo or per item. The total is shown in full before you book and does not go up afterwards: what you see is what you pay.",
        },
        {
          question: "How are travellers verified?",
          answer:
            "Every traveller goes through identity verification before they can accept a parcel: ID checked and contact details confirmed. Their flight is checked against airline schedules — an unverified trip receives no parcel. As they travel, their profile also carries the reviews left by senders.",
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
            "Zoumani works anywhere a traveller or a company posts a trip. Routes between France, Belgium and West and Central Africa — Senegal, Cameroon, Côte d’Ivoire, Mali, Morocco, DR Congo — are the most requested, because that is where the need to send is strongest.",
        },
        {
          question: "I’m a freight company: what does Zoumani bring me?",
          answer:
            "Senders looking for exactly what you offer, without you having to find them. You create your account in the app, your company file is verified, then you publish your flights and available kilos — no ticket proof, no cap. Your offers carry the “verified company” badge, payment is guaranteed at booking and paid out on handover. The first 60 days are free.",
        },
        {
          question: "Is my parcel insured?",
          answer:
            "Not yet. Cover against loss, theft and damage is being prepared: it will be offered when you book as soon as an agreement with an insurer is signed. Until then, the traveller is only paid once the parcel has been handed over.",
        },
      ],
    },

    download: {
      eyebrow: "Starting today",
      title: "The next departure is in {em}.",
      titleEmphasis: "your pocket",
      description:
        "Download Zoumani, describe your parcel or post your trip. Everything happens in the app: the search, the verification, the payment and the tracking.",
      android: "On Android?",
      androidCta: "Get notified at launch",
    },

    stores: {
      locale: "en",
      appleTop: "Download on the",
      appleBottom: "App Store",
      playTop: "Get it on",
      playBottom: "Google Play",
      soon: "Soon",
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
            { label: "The network", href: "#partenaires" },
            { label: "FAQ", href: "#faq" },
            { label: "Get notified on Android", whatsapp: true },
          ],
        },
        {
          title: "Sending",
          links: [
            { label: "Send a parcel", href: "/envoyer-un-colis" },
            { label: "What you can send", href: "#faq" },
          ],
        },
        {
          title: "Travelling & companies",
          links: [
            { label: "Make your kilos pay", href: "/proposer-un-voyage" },
            { label: "Freight companies", href: "#entreprises" },
            { label: "Message us on WhatsApp", whatsapp: true },
          ],
        },
        {
          title: "Legal",
          links: [
            { label: "Terms", href: "/cgu" },
            { label: "Privacy", href: "/confidentialite" },
            { label: "Cookies", href: "/cookies" },
            { label: "Legal notice", href: "/mentions-legales" },
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
      businessMessage:
        "Hello Zoumani, I represent a freight company and would like to publish my flights on the platform.",
      androidMessage:
        "Hello Zoumani, I’m on Android: let me know the day the app is released.",
    },
  },
};
