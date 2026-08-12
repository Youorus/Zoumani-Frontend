import type { HomeLanguage } from "@/features/home/components/home-content";

/**
 * Les mots de l'espace personnel, dans les deux langues.
 *
 * ═══ Le vocabulaire dit ce que Zoumani croit ═══
 *
 * On ne dit jamais « voyageur » ni « expéditeur » comme on dirait un
 * métier. La même personne dépose un colis en mars et emmène celui d'un
 * autre en juillet — ce sont deux **choses qu'on fait**, jamais deux
 * catégories de gens. Les libellés sont donc des verbes : « Envoyer un
 * colis », « Proposer un trajet ».
 *
 * ═══ Écrit pour être lu par tout le monde ═══
 *
 * Des phrases courtes, aucun anglicisme, aucun terme d'informatique. Une
 * grand-mère à Douala et son petit-fils à Paris utilisent la même
 * application : ce qui est clair pour elle l'est aussi pour lui,
 * l'inverse n'est pas vrai.
 *
 * ═══ D'où vient la langue, ici ═══
 *
 * De la **préférence du compte**, jamais d'un paramètre d'URL. Sur la
 * partie publique, `?lang=` a du sens : un visiteur arrive par un lien et
 * il faut bien choisir. Une fois connecté, la personne a déclaré sa
 * langue une fois pour toutes — la redemander à chaque adresse serait lui
 * faire répéter ce qu'on sait déjà, et un lien partagé sans le paramètre
 * la remettrait en français sans prévenir.
 *
 * C'est aussi cette même préférence qui décide de la langue des e-mails
 * et des SMS, côté API : l'écran et la boîte mail ne se contredisent
 * jamais.
 */

const accountFr = {
  greeting: (firstName: string) => `Bonjour, ${firstName}`,
  welcome: (firstName: string) => `Bienvenue, ${firstName}`,

  search: {
    title: "Où va votre colis ?",
    description:
      "Cherchez quelqu'un qui part bientôt sur ce trajet. Vous verrez ce qu'il reste de place dans ses bagages, et ce que ça coûte.",
  },

  actions: {
    title: "Ou faites voyager les colis des autres",
    travel: {
      title: "Je pars en voyage",
      description:
        "Vous avez de la place dans vos bagages ? Déclarez votre trajet et gagnez de quoi financer une partie du billet.",
      cta: "Proposer mon trajet",
    },
  },

  identity: {
    pending: "Vérifiez votre identité",
    pendingDescription:
      "Elle vous sera demandée avant votre premier trajet ou votre premier envoi. La faire maintenant vous évitera d'attendre ce jour-là.",
    verified: "Votre identité est vérifiée",
    verifiedDescription:
      "Vous pouvez proposer un trajet et accepter des colis en toute confiance.",
    cta: "Vérifier mon identité",
  },

  verification: {
    absent: "Identité non vérifiée",
    absentAction: "Vérifier mon identité",
    pending: "Vérification en cours",
    toFix: "Une précision est attendue",
    badgeToFix: "Action attendue de votre part",
    pendingHint: "Nous revenons vers vous sous 48 heures ouvrées.",
    verified: "Identité vérifiée",
    rejected: "Vérification refusée",
    rejectedAction: "Reprendre mon dossier",
    badgeVerified: "Compte vérifié",
    badgeRejected: "Vérification refusée",
  },

  notifications: {
    label: "Mes notifications",
    title: "Notifications",
    empty:
      "Rien de nouveau pour l'instant. Vous serez prévenu ici quand un voyageur accepte votre colis, quand un envoi arrive, ou quand un paiement est libéré.",
  },

  menu: {
    label: "Mon compte",
    shipments: "Mes envois",
    trips: "Mes trajets",
    messages: "Messages",
    profile: "Mon profil",
    payments: "Paiements et remboursements",
    admin: "Administration",
    signOut: "Me déconnecter",
  },

  footer: {
    help: "Besoin d'aide ?",
    terms: "Conditions d'utilisation",
    privacy: "Confidentialité",
    rights: "Zoumani — le transport de colis entre voyageurs et expéditeurs.",
  },

  soon: {
    title: "Bientôt disponible",
    description:
      "Cette partie de votre espace arrive prochainement. En attendant, cherchez un voyageur ou proposez votre trajet depuis votre accueil.",
    cta: "Revenir à mon espace",
  },
};

/** Les textes de l'espace, tels qu'un composant les reçoit. */
export type AccountCopy = typeof accountFr;

export const accountContent = {
  fr: accountFr,
  en: {
    greeting: (firstName: string) => `Hello, ${firstName}`,
    welcome: (firstName: string) => `Welcome, ${firstName}`,

    search: {
      title: "Where is your parcel going?",
      description:
        "Find someone travelling that route soon. You will see how much room is left in their luggage, and what it costs.",
    },

    actions: {
      title: "Or carry other people's parcels",
      travel: {
        title: "I am travelling",
        description:
          "Room to spare in your luggage? Post your trip and earn towards the price of your ticket.",
        cta: "Post my trip",
      },
    },

    identity: {
      pending: "Verify your identity",
      pendingDescription:
        "It will be asked before your first trip or your first parcel. Doing it now saves you the wait on that day.",
      verified: "Your identity is verified",
      verifiedDescription: "You can post a trip and accept parcels with confidence.",
      cta: "Verify my identity",
    },

    verification: {
      absent: "Identity not verified",
      absentAction: "Verify my identity",
      pending: "Verification in progress",
      toFix: "Something is expected from you",
      badgeToFix: "Action needed from you",
      pendingHint: "We will get back to you within two working days.",
      verified: "Identity verified",
      rejected: "Verification declined",
      rejectedAction: "Reopen my file",
      badgeVerified: "Verified account",
      badgeRejected: "Verification declined",
    },

    notifications: {
      label: "My notifications",
      title: "Notifications",
      empty:
        "Nothing new for now. You will be told here when a traveller accepts your parcel, when a delivery arrives, or when a payment is released.",
    },

    menu: {
      label: "My account",
      shipments: "My parcels",
      trips: "My trips",
      messages: "Messages",
      profile: "My profile",
      payments: "Payments and refunds",
      admin: "Administration",
    signOut: "Sign out",
    },

    footer: {
      help: "Need help?",
      terms: "Terms of use",
      privacy: "Privacy",
      rights: "Zoumani — parcels carried by travellers, for senders.",
    },

    soon: {
      title: "Coming soon",
      description:
        "This part of your account is on its way. In the meantime, find a traveller or post your trip from your home screen.",
      cta: "Back to my account",
    },
  },
} satisfies Record<HomeLanguage, AccountCopy>;
