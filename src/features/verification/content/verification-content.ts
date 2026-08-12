import type { HomeLanguage } from "@/features/home/components/home-content";

/**
 * Les mots du parcours de vérification.
 *
 * ═══ Le ton, et pourquoi il compte ici plus qu'ailleurs ═══
 *
 * On demande à quelqu'un de photographier sa pièce d'identité et de
 * l'envoyer à des inconnus. C'est le moment du parcours où l'on abandonne
 * le plus. Chaque phrase répond donc à une question qu'on se pose sans
 * l'écrire : pourquoi vous en avez besoin, qui va le voir, combien de
 * temps c'est gardé, ce qui se passe ensuite.
 *
 * Le vocabulaire administratif est banni : « pièce justificative de
 * domicile » ne veut rien dire pour quelqu'un qui n'a jamais rempli de
 * dossier français.
 */

const fr = {
  title: "Vérifiez votre identité",
  intro:
    "Un colis et un paiement changent de mains sur Zoumani. Savoir qui est en face est ce qui rend cela possible — pour vous comme pour la personne d'en face.",

  privacy: {
    title: "Ce que devient votre document",
    points: [
      "Il est chiffré et rangé dans un stockage privé, jamais accessible publiquement.",
      "Seule l'équipe qui examine les dossiers peut l'ouvrir.",
      "Il n'apparaît jamais sur votre profil, ni pour les voyageurs, ni pour les expéditeurs.",
    ],
  },

  steps: {
    identity: "Qui êtes-vous",
    document: "Votre pièce",
    of: "sur",
    next: "Continuer",
    back: "Retour",
  },

  identity: {
    title: "Votre identité",
    hint: "Exactement comme sur votre pièce d'identité, accents compris.",
    firstName: "Prénom",
    lastName: "Nom",
    birthDate: "Date de naissance",
    nationality: "Nationalité",
    country: "Pays de résidence",
    countrySearch: "Chercher un pays",
    countryEmpty: "Aucun pays ne correspond.",
    address: "Adresse",
    addressHint:
      "Où vous vivez aujourd'hui. Un quartier et un point de repère suffisent s'il n'y a ni numéro ni code postal.",
    addressPlaceholder: "Rue 1.234, quartier Bonapriso, Douala",
  },

  document: {
    title: "Votre pièce d'identité",
    hint: "En cours de validité. Photographiez-la à plat, sans reflet, les quatre coins visibles.",
    type: "Nature de la pièce",
    types: {
      passport: "Passeport",
      national_id: "Carte d'identité",
      residence_permit: "Titre de séjour",
    },
    front: "Recto",
    back: "Verso",
    backHint:
      "Nécessaire pour une carte d'identité et un titre de séjour, pas pour un passeport.",
    issuingCountry: "Pays qui a délivré la pièce",
    expiry: "Date d'expiration",
    selfie: "Photo de vous avec votre pièce",
    selfieHint:
      "Tenez votre document près de votre visage. C'est ce qui relie la pièce à la personne qui la présente.",
    choose: "Choisir un fichier",
    chosen: "Fichier choisi",
  },

  submit: "Transmettre mon dossier",
  submitting: "Envoi en cours…",

  pending: {
    title: "Votre dossier est en cours d'examen",
    body: "Nous vous écrirons dès que la vérification sera terminée. La plupart des dossiers sont traités sous 48 heures ouvrées.",
    recap: "Ce que vous nous avez transmis",
  },

  verified: {
    title: "Votre identité est vérifiée",
    body: "Vous pouvez proposer un trajet et confier un colis. Votre badge est visible de tous : c'est ce qui rassure en premier.",
    action: "Retour à mon espace",
  },

  corrections: {
    title: "Il manque quelque chose à votre dossier",
    body: "Notre équipe a examiné vos documents et a besoin d'une précision avant de conclure. Répondez ci-dessous : votre dossier repart aussitôt à l'examen.",
    kinds: {
      replace_document: "Un document à remplacer",
      add_document: "Un document à ajouter",
      retake_selfie: "Une nouvelle photo de vous",
      provide_information: "Une précision à apporter",
      correct_information: "Une information à corriger",
    },
    newFile: "Le nouveau fichier",
    answer: "Votre réponse",
    answerPlaceholder: "Facultatif — précisez si besoin.",
    submit: "Renvoyer mon dossier",
  },

  rejected: {
    title: "Votre dossier n'a pas été validé",
    reasonLabel: "Motif",
    body: "Corrigez ce qui est signalé, puis renvoyez votre dossier. Vos informations sont conservées : vous n'avez que ce qui pose problème à modifier.",
    action: "Reprendre mon dossier",
  },

  errors: {
    missingDocument: "Ajoutez une photo de votre pièce d'identité.",
    missingSelfie: "Ajoutez une photo de vous tenant votre pièce.",
    missingBack: "Le verso est nécessaire pour cette pièce.",
    missingIssuer: "Indiquez le pays qui a délivré votre pièce.",
    generic: "Une erreur est survenue. Réessayez.",
  },
};

const en: typeof fr = {
  title: "Verify your identity",
  intro:
    "A parcel and a payment change hands on Zoumani. Knowing who is on the other side is what makes that possible — for you as much as for them.",

  privacy: {
    title: "What happens to your document",
    points: [
      "It is encrypted and kept in private storage, never publicly reachable.",
      "Only the team reviewing files can open it.",
      "It never appears on your profile, to travellers or to senders.",
    ],
  },

  steps: {
    identity: "Who you are",
    document: "Your document",
    of: "of",
    next: "Continue",
    back: "Back",
  },

  identity: {
    title: "Your identity",
    hint: "Exactly as it appears on your document, accents included.",
    firstName: "First name",
    lastName: "Last name",
    birthDate: "Date of birth",
    nationality: "Nationality",
    country: "Country of residence",
    countrySearch: "Search a country",
    countryEmpty: "No matching country.",
    address: "Address",
    addressHint:
      "Where you live today. A neighbourhood and a landmark are enough if there is no street number or postcode.",
    addressPlaceholder: "Rue 1.234, Bonapriso, Douala",
  },

  document: {
    title: "Your identity document",
    hint: "Still valid. Photograph it flat, without glare, all four corners visible.",
    type: "Type of document",
    types: {
      passport: "Passport",
      national_id: "National ID card",
      residence_permit: "Residence permit",
    },
    front: "Front",
    back: "Back",
    backHint: "Required for an ID card and a residence permit, not for a passport.",
    issuingCountry: "Country that issued the document",
    expiry: "Expiry date",
    selfie: "Photo of you holding your document",
    selfieHint:
      "Hold your document near your face. That is what links the document to the person presenting it.",
    choose: "Choose a file",
    chosen: "File chosen",
  },

  submit: "Send my file",
  submitting: "Sending…",

  pending: {
    title: "Your file is being reviewed",
    body: "We will write to you as soon as the check is done. Most files are handled within two working days.",
    recap: "What you sent us",
  },

  verified: {
    title: "Your identity is verified",
    body: "You can post a trip and send a parcel. Your badge is visible to everyone: it is what reassures people first.",
    action: "Back to my account",
  },

  corrections: {
    title: "Something is missing from your file",
    body: "Our team reviewed your documents and needs one more thing before concluding. Answer below and your file goes straight back for review.",
    kinds: {
      replace_document: "A document to replace",
      add_document: "A document to add",
      retake_selfie: "A new photo of you",
      provide_information: "A detail to provide",
      correct_information: "Something to correct",
    },
    newFile: "The new file",
    answer: "Your answer",
    answerPlaceholder: "Optional — add a note if useful.",
    submit: "Send my file back",
  },

  rejected: {
    title: "Your file was not accepted",
    reasonLabel: "Reason",
    body: "Fix what is flagged, then send your file again. Your details are kept: you only need to change what is wrong.",
    action: "Reopen my file",
  },

  errors: {
    missingDocument: "Add a photo of your identity document.",
    missingSelfie: "Add a photo of you holding your document.",
    missingBack: "The back is required for this document.",
    missingIssuer: "Tell us which country issued your document.",
    generic: "Something went wrong. Please try again.",
  },
};

export const verificationContent: Record<HomeLanguage, typeof fr> = { fr, en };
export type VerificationCopy = typeof fr;
