import type { HomeLanguage } from "@/features/home/components/home-content";

export interface ShipmentSearchContent {
  contextLabel: string;
  loading: {
    eyebrow: string;
    title: string;
    description: string;
    stages: readonly string[];
  };
  summary: {
    routeLabel: string;
    parcelLabel: string;
    editLabel: string;
  };
  results: {
    eyebrow: string;
    title: (count: number) => string;
    description: string;
    verified: string;
    reviews: string;
    trips: string;
    points: string;
    capacity: string;
    perKg: string;
    protection: string;
    chooseLabel: string;
    trustTitle: string;
    trustItems: readonly string[];
    trustNote: string;
  };
  empty: {
    eyebrow: string;
    title: string;
    description: string;
    alertEyebrow: string;
    alertTitle: string;
    alertDescription: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    consentLabel: string;
    submitLabel: string;
    submittingLabel: string;
    privacyNote: string;
    successTitle: string;
    successDescription: string;
    accountEyebrow: string;
    accountTitle: string;
    accountDescription: string;
    accountCta: string;
    accountBenefits: readonly string[];
  };
  error: {
    title: string;
    description: string;
    retryLabel: string;
  };
}

export const shipmentSearchContent: Record<HomeLanguage, ShipmentSearchContent> = {
  fr: {
    contextLabel: "Recherche de voyage",
    loading: {
      eyebrow: "Recherche en cours",
      title: "Nous cherchons ceux qui vont déjà dans votre direction.",
      description:
        "Zoumani vérifie les trajets, la capacité disponible et les profils les plus fiables pour votre colis.",
      stages: ["Trajets analysés", "Capacités vérifiées", "Voyageurs de confiance"],
    },
    summary: {
      routeLabel: "Votre recherche",
      parcelLabel: "Colis",
      editLabel: "Modifier la recherche",
    },
    results: {
      eyebrow: "Des voyageurs sont déjà en route",
      title: (count) => `${count} voyageur${count > 1 ? "s" : ""} pour votre colis`,
      description:
        "Comparez les profils, la capacité et le tarif. Vous confirmerez ensemble le contenu avant le départ.",
      verified: "Identité vérifiée",
      reviews: "avis",
      trips: "trajets réussis",
      points: "points confiance",
      capacity: "Capacité disponible",
      perKg: "par kg",
      protection: "Protection colis disponible",
      chooseLabel: "Choisir ce voyageur",
      trustTitle: "Votre colis ne voyage jamais seul.",
      trustItems: [
        "Profil, notes et historique contrôlés",
        "Vérification du colis avant la prise en charge",
        "Paiement libéré après la remise confirmée",
        "Protection disponible selon l’envoi choisi",
      ],
      trustNote: "Vous gardez le dernier mot avant toute confirmation.",
    },
    empty: {
      eyebrow: "Pas encore. Mais bientôt, peut-être.",
      title: "Aucun voyage n’est encore en route sur ce trajet.",
      description:
        "Les nouveaux départs arrivent chaque jour. Laissez-nous un moyen simple de vous prévenir dès qu’une place se libère.",
      alertEyebrow: "Info rapide · sans créer de compte",
      alertTitle: "Prévenez-moi dès qu’un voyage apparaît",
      alertDescription:
        "Votre alerte reprend automatiquement ce trajet et le poids du colis.",
      emailLabel: "Adresse email",
      emailPlaceholder: "vous@exemple.com",
      phoneLabel: "Numéro de téléphone",
      phonePlaceholder: "+33 6 00 00 00 00",
      consentLabel: "J’accepte d’être contacté uniquement pour cette recherche.",
      submitLabel: "Créer mon alerte",
      submittingLabel: "Création de l’alerte…",
      privacyNote: "Pas de spam. Vous pourrez arrêter l’alerte à tout moment.",
      successTitle: "Votre alerte est en route.",
      successDescription:
        "Nous vous préviendrons par email et téléphone dès qu’un trajet correspond.",
      accountEyebrow: "Vous envoyez régulièrement ?",
      accountTitle: "Créez votre espace et gagnez du temps au prochain colis.",
      accountDescription:
        "Enregistrez vos trajets favoris, suivez vos demandes et retrouvez tous vos échanges au même endroit.",
      accountCta: "Créer mon compte expéditeur",
      accountBenefits: [
        "Recherche mémorisée",
        "Suivi centralisé",
        "Profil reconnu par les voyageurs",
      ],
    },
    error: {
      title: "La recherche a été interrompue",
      description:
        "Votre trajet est conservé. Vous pouvez relancer sans tout recommencer.",
      retryLabel: "Relancer la recherche",
    },
  },
  en: {
    contextLabel: "Trip search",
    loading: {
      eyebrow: "Searching",
      title: "We are finding people already heading your way.",
      description:
        "Zoumani checks journeys, available capacity and the most reliable profiles for your parcel.",
      stages: ["Journeys analysed", "Capacity checked", "Trusted travelers"],
    },
    summary: {
      routeLabel: "Your search",
      parcelLabel: "Parcel",
      editLabel: "Edit search",
    },
    results: {
      eyebrow: "Travelers are already on their way",
      title: (count) => `${count} traveler${count > 1 ? "s" : ""} for your parcel`,
      description:
        "Compare profiles, capacity and price. You will check the contents together before departure.",
      verified: "Identity verified",
      reviews: "reviews",
      trips: "successful trips",
      points: "trust points",
      capacity: "Available capacity",
      perKg: "per kg",
      protection: "Parcel protection available",
      chooseLabel: "Choose this traveler",
      trustTitle: "Your parcel never travels alone.",
      trustItems: [
        "Profile, ratings and history checked",
        "Parcel verification before handover",
        "Payment released after confirmed delivery",
        "Protection available according to the selected shipment",
      ],
      trustNote: "You keep the final say before any confirmation.",
    },
    empty: {
      eyebrow: "Not yet. But perhaps very soon.",
      title: "No journey is currently available on this route.",
      description:
        "New departures appear every day. Leave us a simple way to notify you as soon as space becomes available.",
      alertEyebrow: "Quick update · no account required",
      alertTitle: "Let me know when a journey appears",
      alertDescription:
        "Your alert automatically remembers this route and parcel weight.",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "+44 7000 000000",
      consentLabel: "I agree to be contacted only about this search.",
      submitLabel: "Create my alert",
      submittingLabel: "Creating your alert…",
      privacyNote: "No spam. You can stop the alert at any time.",
      successTitle: "Your alert is on its way.",
      successDescription:
        "We will notify you by email and phone as soon as a journey matches.",
      accountEyebrow: "Do you send regularly?",
      accountTitle: "Create your space and save time on your next parcel.",
      accountDescription:
        "Save favourite routes, follow requests and keep every conversation in one place.",
      accountCta: "Create my sender account",
      accountBenefits: [
        "Saved search",
        "Centralised tracking",
        "A profile travelers recognise",
      ],
    },
    error: {
      title: "The search was interrupted",
      description: "Your route is saved. You can retry without starting again.",
      retryLabel: "Retry search",
    },
  },
};
