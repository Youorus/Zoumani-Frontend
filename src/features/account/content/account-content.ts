/**
 * Les mots de l'espace personnel.
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
 */

export const accountContent = {
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
} as const;
