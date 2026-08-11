export type HomeLanguage = "fr" | "en";
export type HomeNavigationHref =
  | "#search"
  | "#services"
  | "#fonctionnement"
  | "#trust"
  | "#help";
export type HomeFooterHref = HomeNavigationHref | "#partners" | "/signup";

export interface HomeContent {
  navigation: ReadonlyArray<{ href: HomeNavigationHref; label: string }>;
  language: {
    triggerLabel: string;
    menuLabel: string;
  };
  mobileMenu: {
    title: string;
    description: string;
  };
  travelerCta: string;
  /** Libellé du bouton d'action une fois la personne connectée. */
  spaceCta: string;
  hero: {
    eyebrow: string;
    titleLineOne: string;
    titleLineTwoPrefix: string;
    titleHighlightOne: string;
    titleHighlightTwo: string;
    titleSuffix: string;
    description: string;
  };
  socialProof: {
    communityLabel: string;
    users: string;
    ratingLabel: string;
  };
  trustCard: {
    eyebrow: string;
    title: string;
    footer: string;
  };
  search: {
    title: string;
    departureLabel: string;
    departureAriaLabel: string;
    destinationLabel: string;
    destinationAriaLabel: string;
    swapLabel: string;
    cityPlaceholder: string;
    citySearchPlaceholder: string;
    cityEmptyText: string;
    citySuggestionsLabel: string;
    weightLabel: string;
    weightOptions: ReadonlyArray<{ value: string; label: string; description: string }>;
    submitLabel: string;
    guarantees: readonly string[];
  };
  promos: {
    sectionLabel: string;
    travelerTitleOne: string;
    travelerTitleTwo: string;
    travelerDescription: string;
    travelerCta: string;
    parcelTitleOne: string;
    parcelTitleTwo: string;
    parcelDescription: string;
    parcelCta: string;
  };
  partners: {
    eyebrow: string;
    title: string;
    description: string;
    protectionEyebrow: string;
    protectionTitle: string;
    protectionDescription: string;
    logisticsLabel: string;
    insuranceLabel: string;
    listLabel: string;
    disclaimer: string;
  };
  howItWorks: {
    eyebrow: string;
    titleLines: readonly [string, string, string];
    description: string;
    steps: ReadonlyArray<{
      number: string;
      title: string;
      description: string;
      imageAlt: string;
      note?: string;
      proof?: {
        label: string;
        meta: string;
        origin?: string;
        destination?: string;
        benefits?: ReadonlyArray<{
          icon: "check" | "rating" | "shield" | "transit" | "wallet";
          label: string;
        }>;
      };
    }>;
    closingEyebrow: string;
    closingTitle: string;
    closingDescription: string;
    senderCta: string;
    travelerCta: string;
    legalNote: string;
  };
  about: {
    eyebrow: string;
    titleLines: readonly [string, string, string];
    lead: string;
    body: string;
    quote: string;
    imageAlt: string;
    imageCaption: string;
    valuesLabel: string;
    values: ReadonlyArray<{ title: string; description: string }>;
    signature: string;
  };
  whatsapp: {
    eyebrow: string;
    label: string;
    ariaLabel: string;
    message: string;
  };
  footer: {
    eyebrow: string;
    title: string;
    description: string;
    senderCta: string;
    travelerCta: string;
    whatsappTitle: string;
    whatsappDescription: string;
    whatsappCta: string;
    linkGroups: ReadonlyArray<{
      title: string;
      links: ReadonlyArray<{ label: string; href: HomeFooterHref }>;
    }>;
    signature: string;
    legal: string;
  };
  stats: ReadonlyArray<{ value: string; label: string }>;
}

export const homeContent: Record<HomeLanguage, HomeContent> = {
  fr: {
    navigation: [
      { href: "#search", label: "Envoyer un colis" },
      { href: "#services", label: "Devenir voyageur" },
      { href: "#fonctionnement", label: "Comment ça marche" },
      { href: "#trust", label: "À propos" },
      { href: "#help", label: "Aide" },
    ],
    language: {
      triggerLabel: "Choisir la langue",
      menuLabel: "Langue",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Retrouvez les services Zoumani.",
    },
    travelerCta: "Je suis voyageur",
    spaceCta: "Mon espace",
    hero: {
      eyebrow: "La diaspora, notre force",
      titleLineOne: "Vos colis voyagent",
      titleLineTwoPrefix: "avec ",
      titleHighlightOne: "ceux qui",
      titleHighlightTwo: "voyagent",
      titleSuffix: " déjà.",
      description:
        "Une solution simple, sûre et humaine pour envoyer vos colis entre l’Afrique et le reste du monde.",
    },
    socialProof: {
      communityLabel: "Membres de la communauté Zoumani",
      users: "+15 000 utilisateurs",
      ratingLabel: "Note de 4,8 sur 5",
    },
    trustCard: {
      eyebrow: "Un réseau de",
      title: "voyageurs de confiance",
      footer: "Partout. Pour vous.",
    },
    search: {
      title: "Envoyer un colis",
      departureLabel: "De",
      departureAriaLabel: "Ville de départ",
      destinationLabel: "À",
      destinationAriaLabel: "Ville d’arrivée",
      swapLabel: "Inverser le départ et la destination",
      cityPlaceholder: "Choisir une ville",
      citySearchPlaceholder: "Rechercher une ville ou un aéroport...",
      cityEmptyText: "Aucune destination trouvée.",
      citySuggestionsLabel: "Destinations populaires",
      weightLabel: "Poids du colis",
      weightOptions: [
        { value: "1", label: "1 kg", description: "Petit colis" },
        { value: "2", label: "2 kg", description: "Colis léger" },
        { value: "5", label: "5 kg", description: "Colis standard" },
        { value: "10", label: "10 kg", description: "Grand colis" },
      ],
      submitLabel: "Rechercher un voyage",
      guarantees: [
        "Paiement sécurisé",
        "Voyageurs vérifiés",
        "Protection du colis",
        "Suivi en temps réel",
      ],
    },
    promos: {
      sectionLabel: "Services Zoumani",
      travelerTitleOne: "Vous voyagez bientôt ?",
      travelerTitleTwo: "Rentabilisez votre bagage",
      travelerDescription: "Aidez quelqu’un, gagnez de l’argent et voyagez léger.",
      travelerCta: "Je suis voyageur",
      parcelTitleOne: "Vous voulez envoyer",
      parcelTitleTwo: "un colis en Afrique ?",
      parcelDescription: "Trouvez un voyageur de confiance et expédiez en toute sérénité.",
      parcelCta: "J’ai un colis à envoyer",
    },
    partners: {
      eyebrow: "Transport, protection, confiance",
      title: "Votre colis avance. Sa valeur reste protégée.",
      description:
        "Zoumani réunit des acteurs de l’acheminement et de l’assurance pour construire une expérience fiable, du départ jusqu’à la remise.",
      protectionEyebrow: "Protection colis",
      protectionTitle: "Une couverture pensée pour les imprévus",
      protectionDescription:
        "Selon l’option et le contrat sélectionnés, votre envoi peut être protégé contre la perte, le vol, les dommages ou un incident pendant le trajet.",
      logisticsLabel: "Transport & livraison",
      insuranceLabel: "Assurance & protection",
      listLabel: "Écosystème potentiel de transport et d’assurance",
      disclaimer:
        "Partenariats, garanties, plafonds et exclusions présentés à titre exploratoire, sous réserve d’accord et des conditions du contrat sélectionné.",
    },
    howItWorks: {
      eyebrow: "Comment ça marche ?",
      titleLines: ["Un colis.", "Un voyage.", "Une personne qui l’attend."],
      description:
        "Pour une maman, un papa, un enfant, un ado ou un ami, ce qui voyage n’est jamais juste un colis. C’est un lien. Zoumani veille sur chaque étape.",
      steps: [
        {
          number: "01",
          title: "Vous préparez votre envoi",
          description:
            "Déclarez d’où il part, où il va et ce qu’il contient. Une première vérification sécurise la suite.",
          imageAlt: "Une femme prépare avec soin un petit colis dans son appartement à Paris.",
          note: "Pour maman, avec tout mon cœur.",
          proof: {
            label: "Contenu déclaré",
            meta: "Première vérification enregistrée",
            benefits: [{ icon: "check", label: "Envoi prêt à être confié" }],
          },
        },
        {
          number: "02",
          title: "Le bon voyageur est déjà en route",
          description:
            "Choisissez un voyageur vérifié, bien noté, qui va déjà dans la bonne direction.",
          imageAlt: "Un voyageur vérifie son téléphone près de son bagage et du colis à l’aéroport.",
          proof: {
            label: "Voyageur vérifié",
            meta: "4,9/5 • 48 avis • 1 240 points",
            origin: "Paris",
            destination: "Douala",
            benefits: [
              { icon: "wallet", label: "Rémunération prévue après la remise" },
            ],
          },
        },
        {
          number: "03",
          title: "Votre colis prend son envol",
          description:
            "Vous vérifiez le colis ensemble. Son assurance choisie et son transit partenaire sont confirmés avant le départ.",
          imageAlt: "Le voyageur avance dans le terminal avec le colis et son bagage.",
          proof: {
            label: "Vérification finale réussie",
            meta: "Colis pris en charge",
            origin: "Paris",
            destination: "Douala",
            benefits: [
              { icon: "shield", label: "Assurance colis sélectionnée" },
              { icon: "transit", label: "Transit partenaire confirmé" },
            ],
          },
        },
        {
          number: "04",
          title: "Et quelqu’un le retrouve.",
          description:
            "Votre proche confirme la remise. Le voyageur est payé, gagne des points et peut recevoir un nouvel avis.",
          imageAlt: "À Douala, le voyageur remet chaleureusement le colis à sa destinataire.",
          note: "Bien reçu. Merci.",
          proof: {
            label: "Arrivé à destination",
            meta: "Remise confirmée par la destinataire",
            benefits: [
              { icon: "wallet", label: "Voyageur payé" },
              { icon: "rating", label: "+120 points • nouvel avis" },
            ],
          },
        },
      ],
      closingEyebrow: "Et voilà. Le voyage est terminé.",
      closingTitle: "De votre main à la sienne.",
      closingDescription:
        "Votre proche reçoit ce qui compte. Le voyageur est récompensé. Chaque remise réussie construit la confiance Zoumani.",
      senderCta: "Trouver un voyageur",
      travelerCta: "Proposer mon trajet",
      legalNote:
        "Profils, points et avis illustratifs. Assurance, rémunération et transit disponibles selon l’envoi, le trajet, l’option choisie et les conditions applicables.",
    },
    about: {
      eyebrow: "À propos de Zoumani",
      titleLines: ["Ce qui nous relie", "mérite mieux", "qu’un simple envoi."],
      lead:
        "Zoumani transforme des trajets qui existent déjà en liens utiles entre celles et ceux qui envoient, voyagent et attendent.",
      body:
        "Notre ambition est simple : rendre les échanges entre l’Afrique, sa diaspora et le reste du monde plus humains, plus fiables et plus accessibles, sans perdre ce qui fait leur valeur — la confiance entre les personnes.",
      quote:
        "Nous ne faisons pas seulement voyager des colis. Nous rapprochons des personnes.",
      imageAlt:
        "Une famille camerounaise de plusieurs générations découvre ensemble le contenu d’un colis reçu d’un proche.",
      imageCaption: "Une part de chez soi, arrivée à destination.",
      valuesLabel: "Les convictions Zoumani",
      values: [
        {
          title: "Humain, toujours",
          description:
            "Derrière chaque colis, il y a une intention, un proche et une histoire qui méritent notre attention.",
        },
        {
          title: "La confiance se mérite",
          description:
            "Vérifications, réputation et preuves de remise rendent chaque trajet plus clair et plus sûr.",
        },
        {
          title: "L’Afrique en mouvement",
          description:
            "Nous révélons la force d’une diaspora qui voyage, s’entraide et crée de la valeur des deux côtés du trajet.",
        },
      ],
      signature: "Pensé avec la diaspora. Construit pour rapprocher.",
    },
    whatsapp: {
      eyebrow: "Une question ?",
      label: "Écrivez-nous",
      ariaLabel: "Contacter Zoumani sur WhatsApp",
      message:
        "Bonjour Zoumani, j’aimerais obtenir des informations sur l’envoi d’un colis ou le parcours voyageur.",
    },
    footer: {
      eyebrow: "Le prochain lien commence ici",
      title: "Un trajet peut rapprocher deux vies.",
      description:
        "Envoyez ce qui compte ou donnez plus de valeur à votre prochain voyage. Zoumani relie les bonnes personnes, au bon moment.",
      senderCta: "Envoyer un colis",
      travelerCta: "Proposer mon trajet",
      whatsappTitle: "Besoin d’en parler ?",
      whatsappDescription: "Notre équipe vous répond directement sur WhatsApp.",
      whatsappCta: "Ouvrir la discussion",
      linkGroups: [
        {
          title: "Services",
          links: [
            { label: "Envoyer un colis", href: "#search" },
            { label: "Devenir voyageur", href: "/signup" },
            { label: "Comment ça marche", href: "#fonctionnement" },
          ],
        },
        {
          title: "Zoumani",
          links: [
            { label: "Notre mission", href: "#trust" },
            { label: "Nos partenaires", href: "#partners" },
            { label: "Aide et contact", href: "#help" },
          ],
        },
      ],
      signature: "Par des Africains, pour l’Afrique et sa diaspora.",
      legal: "Tous droits réservés.",
    },
    stats: [
      { value: "120+", label: "Destinations\ndans le monde" },
      { value: "15 000+", label: "Utilisateurs\nactifs" },
      { value: "100%", label: "Voyageurs vérifiés\net notés" },
      { value: "Protection colis", label: "disponible\nselon l’envoi" },
      { value: "Support 7j/7", label: "Une équipe à votre\nécoute" },
    ],
  },
  en: {
    navigation: [
      { href: "#search", label: "Send a parcel" },
      { href: "#services", label: "Become a traveler" },
      { href: "#fonctionnement", label: "How it works" },
      { href: "#trust", label: "About" },
      { href: "#help", label: "Help" },
    ],
    language: {
      triggerLabel: "Choose language",
      menuLabel: "Language",
    },
    mobileMenu: {
      title: "Navigation",
      description: "Explore Zoumani services.",
    },
    travelerCta: "I’m a traveler",
    spaceCta: "My account",
    hero: {
      eyebrow: "The diaspora, our strength",
      titleLineOne: "Your parcels travel",
      titleLineTwoPrefix: "with ",
      titleHighlightOne: "those who",
      titleHighlightTwo: "already travel",
      titleSuffix: ".",
      description:
        "A simple, secure and human way to send parcels between Africa and the rest of the world.",
    },
    socialProof: {
      communityLabel: "Members of the Zoumani community",
      users: "+15,000 users",
      ratingLabel: "Rated 4.8 out of 5",
    },
    trustCard: {
      eyebrow: "A network of",
      title: "trusted travelers",
      footer: "Everywhere. For you.",
    },
    search: {
      title: "Send a parcel",
      departureLabel: "From",
      departureAriaLabel: "Departure city",
      destinationLabel: "To",
      destinationAriaLabel: "Arrival city",
      swapLabel: "Swap departure and destination",
      cityPlaceholder: "Choose a city",
      citySearchPlaceholder: "Search for a city or airport...",
      cityEmptyText: "No destination found.",
      citySuggestionsLabel: "Popular destinations",
      weightLabel: "Parcel weight",
      weightOptions: [
        { value: "1", label: "1 kg", description: "Small parcel" },
        { value: "2", label: "2 kg", description: "Light parcel" },
        { value: "5", label: "5 kg", description: "Standard parcel" },
        { value: "10", label: "10 kg", description: "Large parcel" },
      ],
      submitLabel: "Search for a trip",
      guarantees: [
        "Secure payment",
        "Verified travelers",
        "Parcel protection",
        "Real-time tracking",
      ],
    },
    promos: {
      sectionLabel: "Zoumani services",
      travelerTitleOne: "Traveling soon?",
      travelerTitleTwo: "Make your luggage pay",
      travelerDescription: "Help someone, earn money and travel lighter.",
      travelerCta: "I’m a traveler",
      parcelTitleOne: "Want to send",
      parcelTitleTwo: "a parcel to Africa?",
      parcelDescription: "Find a trusted traveler and ship with complete peace of mind.",
      parcelCta: "I have a parcel to send",
    },
    partners: {
      eyebrow: "Transport, protection, trust",
      title: "Your parcel keeps moving. Its value stays protected.",
      description:
        "Zoumani brings delivery and insurance specialists together to build a reliable experience from handover to arrival.",
      protectionEyebrow: "Parcel protection",
      protectionTitle: "Coverage designed for the unexpected",
      protectionDescription:
        "Depending on the selected option and policy, your shipment may be protected against loss, theft, damage or an incident in transit.",
      logisticsLabel: "Transport & delivery",
      insuranceLabel: "Insurance & protection",
      listLabel: "Potential transport and insurance ecosystem",
      disclaimer:
        "Partnerships, cover limits and exclusions are shown for exploration, subject to approval and the terms of the selected policy.",
    },
    howItWorks: {
      eyebrow: "How does it work?",
      titleLines: ["One parcel.", "One journey.", "Someone waiting for it."],
      description:
        "For a mother, a father, a child, a teenager or a friend, what travels is never just a parcel. It is a bond. Zoumani looks after every step.",
      steps: [
        {
          number: "01",
          title: "You prepare your parcel",
          description:
            "Declare where it starts, where it is going and what is inside. A first verification secures what comes next.",
          imageAlt: "A woman carefully prepares a small parcel in her Paris apartment.",
          note: "For Mum, with all my heart.",
          proof: {
            label: "Contents declared",
            meta: "First verification recorded",
            benefits: [{ icon: "check", label: "Ready to be entrusted" }],
          },
        },
        {
          number: "02",
          title: "The right traveler is already on the way",
          description:
            "Choose a verified, well-rated traveler already heading in the right direction.",
          imageAlt: "A traveler checks his phone beside his luggage and the parcel at the airport.",
          proof: {
            label: "Verified traveler",
            meta: "4.9/5 • 48 reviews • 1,240 points",
            origin: "Paris",
            destination: "Douala",
            benefits: [{ icon: "wallet", label: "Reward scheduled after handover" }],
          },
        },
        {
          number: "03",
          title: "Your parcel takes off",
          description:
            "You check the parcel together. Its selected insurance and partner transit are confirmed before departure.",
          imageAlt: "The traveler walks through the terminal with the parcel and his luggage.",
          proof: {
            label: "Final verification complete",
            meta: "Parcel collected",
            origin: "Paris",
            destination: "Douala",
            benefits: [
              { icon: "shield", label: "Parcel insurance selected" },
              { icon: "transit", label: "Partner transit confirmed" },
            ],
          },
        },
        {
          number: "04",
          title: "And someone gets it back.",
          description:
            "Your loved one confirms the handover. The traveler is paid, earns points and may receive a new review.",
          imageAlt: "In Douala, the traveler warmly hands the parcel to its recipient.",
          note: "Received. Thank you.",
          proof: {
            label: "Arrived at destination",
            meta: "Handover confirmed by the recipient",
            benefits: [
              { icon: "wallet", label: "Traveler paid" },
              { icon: "rating", label: "+120 points • new review" },
            ],
          },
        },
      ],
      closingEyebrow: "That’s it. The journey is complete.",
      closingTitle: "From your hands to theirs.",
      closingDescription:
        "Your loved one receives what matters. The traveler is rewarded. Every successful handover strengthens trust in Zoumani.",
      senderCta: "Find a traveler",
      travelerCta: "Share my trip",
      legalNote:
        "Profiles, points and reviews are illustrative. Insurance, rewards and transit are available according to the shipment, journey, selected option and applicable terms.",
    },
    about: {
      eyebrow: "About Zoumani",
      titleLines: ["What connects us", "deserves more", "than a simple delivery."],
      lead:
        "Zoumani turns journeys that already exist into useful connections between those who send, travel and wait.",
      body:
        "Our ambition is simple: make exchanges between Africa, its diaspora and the rest of the world more human, reliable and accessible, without losing what gives them value — trust between people.",
      quote: "We do not simply move parcels. We bring people closer together.",
      imageAlt:
        "A multigenerational Cameroonian family discovers together the contents of a parcel sent by a loved one.",
      imageCaption: "A piece of home, safely arrived.",
      valuesLabel: "Zoumani principles",
      values: [
        {
          title: "Human, always",
          description:
            "Behind every parcel is an intention, a loved one and a story worthy of our attention.",
        },
        {
          title: "Trust must be earned",
          description:
            "Verification, reputation and proof of handover make every journey clearer and safer.",
        },
        {
          title: "Africa in motion",
          description:
            "We reveal the strength of a diaspora that travels, helps one another and creates value on both sides of the journey.",
        },
      ],
      signature: "Shaped with the diaspora. Built to bring people closer.",
    },
    whatsapp: {
      eyebrow: "A question?",
      label: "Message us",
      ariaLabel: "Contact Zoumani on WhatsApp",
      message:
        "Hello Zoumani, I would like more information about sending a parcel or becoming a traveler.",
    },
    footer: {
      eyebrow: "The next connection starts here",
      title: "One journey can bring two lives closer.",
      description:
        "Send what matters or give more value to your next journey. Zoumani connects the right people at the right time.",
      senderCta: "Send a parcel",
      travelerCta: "Share my trip",
      whatsappTitle: "Want to talk it through?",
      whatsappDescription: "Our team answers you directly on WhatsApp.",
      whatsappCta: "Start the conversation",
      linkGroups: [
        {
          title: "Services",
          links: [
            { label: "Send a parcel", href: "#search" },
            { label: "Become a traveler", href: "/signup" },
            { label: "How it works", href: "#fonctionnement" },
          ],
        },
        {
          title: "Zoumani",
          links: [
            { label: "Our mission", href: "#trust" },
            { label: "Our partners", href: "#partners" },
            { label: "Help and contact", href: "#help" },
          ],
        },
      ],
      signature: "By Africans, for Africa and its diaspora.",
      legal: "All rights reserved.",
    },
    stats: [
      { value: "120+", label: "Destinations\nworldwide" },
      { value: "15,000+", label: "Active\nusers" },
      { value: "100%", label: "Verified and rated\ntravelers" },
      { value: "Parcel protection", label: "available for\neligible shipments" },
      { value: "Support 7 days", label: "A team ready\nto help" },
    ],
  },
};
