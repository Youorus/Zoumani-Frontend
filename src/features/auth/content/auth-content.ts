import type { HomeLanguage } from "@/features/home/components/home-content";

/**
 * Textes du parcours d'accès.
 *
 * ═══ Une seule porte, et le vocabulaire le dit ═══
 *
 * On ne dit jamais « connexion » ni « inscription » avant de savoir : la
 * personne saisit son adresse, et c'est le serveur qui tranche. Annoncer
 * « créer un compte » à quelqu'un qui en a déjà un — ou l'inverse — le
 * fait hésiter au premier écran, celui qu'on ne peut pas se permettre de
 * rater.
 *
 * ═══ Ce que ces textes ne promettent pas ═══
 *
 * Aucun « mot de passe oublié » : il n'y en a pas. Aucun choix
 * « expéditeur ou voyageur » : le rôle n'est pas une identité, c'est une
 * position dans une transaction. La même personne expédie lundi et voyage
 * jeudi, avec le même compte.
 */

interface AuthContent {
  contextLabel: string;
  /** Étapes annoncées d'avance, pour qu'aucun code n'arrive par surprise. */
  steps: {
    email: string;
    identity: string;
    phone: string;
    /** La phrase qui explique pourquoi il y a deux vérifications. */
    explanation: string;
  };
  email: {
    eyebrow: string;
    title: string;
    description: string;
    field: string;
    placeholder: string;
    submit: string;
    reassurance: string;
  };
  emailCode: {
    title: string;
    description: (destination: string) => string;
    field: string;
    submit: string;
    resend: string;
    changeEmail: string;
  };
  registration: {
    eyebrow: string;
    title: string;
    description: string;
    firstName: string;
    lastName: string;
    country: string;
    countrySearch: string;
    countryEmpty: string;
    phone: string;
    phoneHelp: string;
    terms: string;
    privacy: string;
    submit: string;
  };
  phoneCode: {
    title: string;
    description: (destination: string) => string;
    field: string;
    submit: string;
    back: string;
  };
  done: {
    titleReturning: string;
    titleNew: string;
    description: string;
    action: string;
  };
  errors: {
    generic: string;
    expired: string;
    support: string;
  };
}

export const authContent: Record<HomeLanguage, AuthContent> = {
  fr: {
    contextLabel: "Accéder à Zoumani",
    steps: {
      email: "Votre e-mail",
      identity: "Vos informations",
      phone: "Votre téléphone",
      explanation:
        "Deux vérifications : un code par e-mail, puis un code par SMS. C'est ce qui garantit qu'un colis et un paiement n'atterrissent jamais chez quelqu'un d'autre.",
    },
    email: {
      eyebrow: "Votre espace",
      title: "Votre adresse e-mail",
      description:
        "Un code vous est envoyé. Si vous avez déjà un compte, vous y accédez ; sinon, nous le créons ensemble.",
      field: "Adresse e-mail",
      placeholder: "vous@exemple.com",
      submit: "Continuer",
      reassurance: "Aucun mot de passe à retenir.",
    },
    emailCode: {
      title: "Le code reçu par e-mail",
      description: (destination) => `Nous l'avons envoyé à ${destination}.`,
      field: "Code à 6 chiffres",
      submit: "Vérifier",
      resend: "Renvoyer un code",
      changeEmail: "Modifier l'adresse",
    },
    registration: {
      eyebrow: "Première visite",
      title: "Faisons connaissance",
      description:
        "Votre adresse est vérifiée. Il ne manque que votre nom et votre téléphone — ce dernier sécurise chaque envoi.",
      firstName: "Prénom",
      lastName: "Nom",
      country: "Pays",
      countrySearch: "Chercher un pays ou un indicatif",
      countryEmpty: "Aucun pays ne correspond.",
      phone: "Numéro de téléphone",
      phoneHelp: "Nous y enverrons un code pour terminer.",
      terms: "J'accepte les conditions d'utilisation",
      privacy: "J'accepte la politique de confidentialité",
      submit: "Recevoir le code",
    },
    phoneCode: {
      title: "Le code reçu par SMS",
      description: (destination) => `Nous l'avons envoyé au ${destination}.`,
      field: "Code à 6 chiffres",
      submit: "Terminer",
      back: "Recommencer",
    },
    done: {
      titleReturning: "Content de vous revoir",
      titleNew: "Bienvenue sur Zoumani",
      description: "Vous resterez connecté pendant trois mois.",
      action: "Continuer",
    },
    errors: {
      generic: "Une erreur est survenue. Réessayez.",
      expired: "Ce parcours a expiré. Recommencez depuis votre adresse.",
      support: "Contactez le support pour débloquer votre compte.",
    },
  },
  en: {
    contextLabel: "Access Zoumani",
    steps: {
      email: "Your email",
      identity: "Your details",
      phone: "Your phone",
      explanation:
        "Two checks: a code by email, then a code by SMS. That is what makes sure a parcel and a payment never end up with someone else.",
    },
    email: {
      eyebrow: "Your space",
      title: "Your email address",
      description:
        "We'll send you a code. If you already have an account, you'll get in; if not, we'll create it together.",
      field: "Email address",
      placeholder: "you@example.com",
      submit: "Continue",
      reassurance: "No password to remember.",
    },
    emailCode: {
      title: "The code sent by email",
      description: (destination) => `We sent it to ${destination}.`,
      field: "6-digit code",
      submit: "Verify",
      resend: "Send a new code",
      changeEmail: "Change address",
    },
    registration: {
      eyebrow: "First visit",
      title: "Let's get acquainted",
      description:
        "Your address is verified. We only need your name and phone — the latter secures every shipment.",
      firstName: "First name",
      lastName: "Last name",
      country: "Country",
      countrySearch: "Search a country or a dialling code",
      countryEmpty: "No matching country.",
      phone: "Phone number",
      phoneHelp: "We'll send a code there to finish.",
      terms: "I accept the terms of use",
      privacy: "I accept the privacy policy",
      submit: "Send me the code",
    },
    phoneCode: {
      title: "The code sent by SMS",
      description: (destination) => `We sent it to ${destination}.`,
      field: "6-digit code",
      submit: "Finish",
      back: "Start over",
    },
    done: {
      titleReturning: "Good to see you again",
      titleNew: "Welcome to Zoumani",
      description: "You'll stay signed in for three months.",
      action: "Continue",
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      expired: "This session expired. Start again from your address.",
      support: "Contact support to unlock your account.",
    },
  },
};
