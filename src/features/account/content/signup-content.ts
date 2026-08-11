import type { HomeLanguage } from "@/features/home/components/home-content";

import type { AccountRole } from "../types/account-role";

interface RoleContent {
  tab: string;
  eyebrow: string;
  title: string;
  description: string;
  story: string;
  benefits: readonly string[];
  submit: string;
  successTitle: string;
  successDescription: string;
}

interface SignupContent {
  contextLabel: string;
  rolePrompt: string;
  routeLabel: string;
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    passwordHint: string;
    showPassword: string;
    hidePassword: string;
    terms: string;
  };
  secureNote: string;
  submitting: string;
  roles: Record<AccountRole, RoleContent>;
}

export const signupContent: Record<HomeLanguage, SignupContent> = {
  fr: {
    contextLabel: "Création de compte",
    rolePrompt: "Je veux…",
    routeLabel: "Votre première recherche est déjà prête",
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Adresse email",
      phone: "Téléphone",
      password: "Mot de passe",
      passwordHint: "8 caractères, une majuscule et un chiffre",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      terms:
        "J’accepte les conditions d’utilisation et la politique de confidentialité de Zoumani.",
    },
    secureNote:
      "Vos données sont protégées et utilisées uniquement pour sécuriser votre expérience Zoumani.",
    submitting: "Création de votre espace…",
    roles: {
      sender: {
        tab: "Envoyer un colis",
        eyebrow: "Un espace pour chaque lien qui compte",
        title: "Envoyez sereinement. Gardez chaque étape à portée de main.",
        description:
          "Retrouvez les voyageurs vérifiés, vos échanges et la protection de vos colis dans un espace simple.",
        story: "De vos mains aux leurs, avec des nouvelles tout au long du chemin.",
        benefits: [
          "Recherches et alertes mémorisées",
          "Suivi du colis centralisé",
          "Protection et paiements sécurisés",
        ],
        submit: "Créer mon compte expéditeur",
        successTitle: "Bienvenue dans votre espace expéditeur.",
        successDescription:
          "Votre recherche est conservée. Vous pourrez maintenant préparer votre premier envoi.",
      },
      traveler: {
        tab: "Rentabiliser un voyage",
        eyebrow: "Votre trajet peut rapprocher deux familles",
        title: "Voyagez comme prévu. Gagnez en rendant service.",
        description:
          "Publiez vos départs, choisissez les colis que vous acceptez et construisez votre réputation à votre rythme.",
        story: "Un peu de place dans vos bagages peut devenir beaucoup pour quelqu’un.",
        benefits: [
          "Rémunération annoncée avant l’accord",
          "Colis vérifiés avec vous",
          "Avis, points et profil de confiance",
        ],
        submit: "Créer mon compte voyageur",
        successTitle: "Bienvenue parmi les voyageurs Zoumani.",
        successDescription:
          "Votre espace est prêt. La vérification de profil sera votre prochaine étape.",
      },
    },
  },
  en: {
    contextLabel: "Create an account",
    rolePrompt: "I want to…",
    routeLabel: "Your first search is already saved",
    fields: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      phone: "Phone number",
      password: "Password",
      passwordHint: "8 characters, one uppercase letter and one number",
      showPassword: "Show password",
      hidePassword: "Hide password",
      terms: "I accept Zoumani’s terms of use and privacy policy.",
    },
    secureNote: "Your data is protected and used only to secure your Zoumani experience.",
    submitting: "Creating your space…",
    roles: {
      sender: {
        tab: "Send a parcel",
        eyebrow: "A space for every connection that matters",
        title: "Send with peace of mind. Keep every step close.",
        description:
          "Find verified travelers, conversations and parcel protection in one simple space.",
        story: "From your hands to theirs, with updates all along the way.",
        benefits: [
          "Saved searches and alerts",
          "Centralised parcel tracking",
          "Protection and secure payments",
        ],
        submit: "Create my sender account",
        successTitle: "Welcome to your sender space.",
        successDescription:
          "Your search is saved. You can now prepare your first shipment.",
      },
      traveler: {
        tab: "Make my trip worthwhile",
        eyebrow: "Your journey can bring two families closer",
        title: "Travel as planned. Earn by helping someone.",
        description:
          "Publish departures, choose what you carry and build your reputation at your own pace.",
        story: "A little space in your luggage can mean a great deal to someone.",
        benefits: [
          "Payment shown before you agree",
          "Parcels checked with you",
          "Reviews, points and a trusted profile",
        ],
        submit: "Create my traveler account",
        successTitle: "Welcome to the Zoumani traveler community.",
        successDescription:
          "Your space is ready. Profile verification will be your next step.",
      },
    },
  },
};
