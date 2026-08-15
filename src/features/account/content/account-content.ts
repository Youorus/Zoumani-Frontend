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

  dashboard: {
    eyebrow: "Votre espace Zoumani",
    statusTitle: "L’essentiel, aujourd’hui",
    profileCta: "Mettre à jour mon profil",
    unavailableTitle: "Information momentanément indisponible",
    unavailableDescription:
      "Votre espace reste accessible. Réessayez dans un instant pour actualiser cette partie.",
    unavailableCta: "Actualiser",
    identityTitle: "Confiance du profil",
    identityStages: {
      absent: {
        title: "Votre profil attend sa vérification",
        description:
          "Faites-la maintenant pour pouvoir publier un voyage et rassurer les familles qui vous confient un colis.",
        cta: "Commencer la vérification",
      },
      en_cours: {
        title: "Votre dossier est entre nos mains",
        description:
          "Notre équipe vérifie vos informations. Vous n’avez rien à faire pour le moment.",
        cta: "Voir mon dossier",
      },
      a_corriger: {
        title: "Une précision débloquera votre profil",
        description:
          "Une information ou un document doit être corrigé avant que nous puissions vous vérifier.",
        cta: "Répondre maintenant",
      },
      verifie: {
        title: "Votre identité inspire confiance",
        description:
          "Votre profil est vérifié. Vous pouvez proposer un voyage et recevoir des colis.",
        cta: "Voir mon profil",
      },
      refuse: {
        title: "Votre dossier doit être repris",
        description:
          "Consultez le motif reçu, puis transmettez les bons éléments pour repartir sur une base claire.",
        cta: "Reprendre mon dossier",
      },
    },
    tripTitle: "Votre prochain voyage",
    tripEmptyTitle: "Aucun départ programmé",
    tripEmptyDescription:
      "Votre prochaine place libre peut aider une famille et financer une partie de votre billet.",
    tripCreateCta: "Proposer un voyage",
    tripManageCta: "Gérer mes voyages",
    tripStatus: {
      draft: "Brouillon à terminer",
      pending_automatic_verification: "Contrôle en cours",
      pending_manual_review: "Examen en cours",
      action_required: "Action demandée",
      verified: "Voyage validé",
      rejected: "Voyage non validé",
      cancelled: "Voyage annulé",
      expired: "Voyage expiré",
      completed: "Voyage accompli",
    },
    rewardsTitle: "Votre prochaine récompense",
    rewardsBalance: "points cumulés",
    rewardsCta: "Voir toutes les récompenses",
    rewardsTop: "Vous avez atteint le plus haut avantage Zoumani.",
    rewardsCatalogPending:
      "Vos points sont bien enregistrés. Le détail des récompenses arrive avec la mise à jour du programme.",
    rewardsRemaining: (points: number) =>
      `${points} point${points > 1 ? "s" : ""} avant de la débloquer`,
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

  theme: {
    toDark: "Passer en thème sombre",
    toLight: "Passer en thème clair",
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
    tracking: "Suivi de mes colis",
    trips: "Mes trajets",
    rewards: "Mes points",
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

    dashboard: {
      eyebrow: "Your Zoumani account",
      statusTitle: "What matters today",
      profileCta: "Update my profile",
      unavailableTitle: "Information temporarily unavailable",
      unavailableDescription:
        "Your account remains available. Try again shortly to refresh this section.",
      unavailableCta: "Refresh",
      identityTitle: "Profile trust",
      identityStages: {
        absent: {
          title: "Your profile is waiting to be verified",
          description:
            "Do it now so you can post a trip and reassure families trusting you with a parcel.",
          cta: "Start verification",
        },
        en_cours: {
          title: "Your file is in our hands",
          description:
            "Our team is checking your details. There is nothing you need to do right now.",
          cta: "View my file",
        },
        a_corriger: {
          title: "One detail will unlock your profile",
          description:
            "Some information or a document needs correcting before we can verify you.",
          cta: "Respond now",
        },
        verifie: {
          title: "Your identity inspires trust",
          description:
            "Your profile is verified. You can post a trip and receive parcels.",
          cta: "View my profile",
        },
        refuse: {
          title: "Your file needs to be reopened",
          description:
            "Read the reason you received, then send the right details to start again clearly.",
          cta: "Reopen my file",
        },
      },
      tripTitle: "Your next trip",
      tripEmptyTitle: "No departure scheduled",
      tripEmptyDescription:
        "Your next spare space can help a family and contribute towards your ticket.",
      tripCreateCta: "Post a trip",
      tripManageCta: "Manage my trips",
      tripStatus: {
        draft: "Draft to finish",
        pending_automatic_verification: "Checks in progress",
        pending_manual_review: "Under review",
        action_required: "Action needed",
        verified: "Trip approved",
        rejected: "Trip not approved",
        cancelled: "Trip cancelled",
        expired: "Trip expired",
        completed: "Trip completed",
      },
      rewardsTitle: "Your next reward",
      rewardsBalance: "points earned",
      rewardsCta: "See all rewards",
      rewardsTop: "You have reached Zoumani’s highest reward.",
      rewardsCatalogPending:
        "Your points are safely recorded. Reward details will appear with the programme update.",
      rewardsRemaining: (points: number) =>
        `${points} point${points > 1 ? "s" : ""} left to unlock it`,
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

    theme: {
      toDark: "Switch to dark theme",
      toLight: "Switch to light theme",
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
      tracking: "Track my parcels",
      trips: "My trips",
      rewards: "My points",
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
