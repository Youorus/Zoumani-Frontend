/**
 * Le dossier de vérification d'identité, tel que l'API le rend.
 *
 * ═══ Neuf statuts, et pourquoi l'interface n'en montre pas neuf ═══
 *
 * Le backend distingue `submitted`, `under_review` et `resubmitted` : un
 * opérateur a besoin de savoir si un dossier attend dans la file, s'il
 * est pris en charge, ou s'il revient après correction. **La personne qui
 * attend, elle, n'a que faire de cette nuance.**
 *
 * Une distinction compte en revanche énormément : `action_required` n'est
 * pas de l'attente. C'est le seul statut où **on attend quelque chose
 * d'elle**, et le confondre avec « en cours d'examen » laisse un dossier
 * bloqué indéfiniment — la personne patiente, l'opérateur patiente, et
 * rien n'avance jusqu'à ce que l'un des deux écrive au support.
 *
 * Traduire les neuf en cinq est donc le travail de l'interface, et il se
 * fait ici, à un seul endroit. Le faire dans chaque composant
 * garantirait qu'un jour l'un d'eux oublie `resubmitted` et affiche
 * « refusé » à quelqu'un dont le dossier est en cours d'examen.
 */

/** Statuts tels que l'API les nomme. */
export type VerificationStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "under_review"
  | "action_required"
  | "resubmitted"
  | "verified"
  | "rejected"
  | "expired";

/** Ce que la personne a besoin de comprendre, et rien de plus. */
export type VerificationStage =
  "absent" | "en_cours" | "a_corriger" | "verifie" | "refuse";

/** Types de pièces tels que l'API les nomme. */
export type IdentityDocumentType =
  | "passport"
  | "national_id_card"
  | "residence_permit";

export interface VerificationDocument {
  id: string;
  documentType: IdentityDocumentType | "selfie";
  status: string;
  issuingCountry: string | null;
  expiresOn: string | null;
  hasBackSide: boolean;
}

/** Le dossier, en `snake_case` : c'est exactement ce que rend l'API. */
export interface RawVerification {
  id: string;
  status: VerificationStatus;
  legal_first_name: string | null;
  legal_last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  residential_address: string | null;
  address_latitude: number | null;
  address_longitude: number | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  expires_at: string | null;
}

/** Le dossier, tel que l'interface le manipule. */
export interface Verification {
  id: string;
  status: VerificationStatus;
  stage: VerificationStage;
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  residentialAddress: string;
  /** Motif du refus, rédigé pour être lu par la personne concernée. */
  rejectionReason: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
}

/**
 * Ramène les neuf statuts aux quatre situations qui parlent à quelqu'un.
 *
 * `expired` rejoint « refusé » et non « absent » : un dossier périmé
 * demande la même chose qu'un refus — reprendre le formulaire — et le
 * ranger avec « rien commencé » ferait croire qu'on n'a jamais rien fait.
 */
export function stageOf(status: VerificationStatus): VerificationStage {
  switch (status) {
    case "verified":
      return "verifie";
    case "rejected":
    case "expired":
      return "refuse";
    case "not_started":
    case "draft":
      return "absent";
    case "action_required":
      // Le seul statut où la balle est dans son camp.
      return "a_corriger";
    default:
      // `submitted`, `under_review`, `resubmitted` : dans les trois cas,
      // la personne attend une réponse et n'a rien à faire.
      return "en_cours";
  }
}

/** Convertit la réponse de l'API vers la forme utilisée par l'interface. */
export function toVerification(raw: RawVerification): Verification {
  return {
    id: raw.id,
    status: raw.status,
    stage: stageOf(raw.status),
    // Les chaînes vides plutôt que `null` : ce sont des valeurs de
    // formulaire, et React refuse de passer d'un champ non contrôlé à un
    // champ contrôlé quand la valeur démarre à `null`.
    legalFirstName: raw.legal_first_name ?? "",
    legalLastName: raw.legal_last_name ?? "",
    dateOfBirth: raw.date_of_birth ?? "",
    nationality: raw.nationality ?? "",
    countryOfResidence: raw.country_of_residence ?? "",
    residentialAddress: raw.residential_address ?? "",
    rejectionReason: raw.rejection_reason,
    submittedAt: raw.submitted_at,
    verifiedAt: raw.verified_at,
  };
}

/** Ce qu'un opérateur peut demander. */
export type RequestKind =
  | "replace_document"
  | "add_document"
  | "retake_selfie"
  | "provide_information"
  | "correct_information";

/** Une demande de correction, telle que l'API la rend. */
export interface RawVerificationRequest {
  id: string;
  kind: RequestKind;
  status: string;
  message: string;
  document_id: string | null;
  user_response: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface VerificationRequest {
  id: string;
  kind: RequestKind;
  /** Ce que l'opérateur a écrit, mot pour mot. */
  message: string;
  documentId: string | null;
  answered: boolean;
  answer: string | null;
}

/**
 * Les demandes en attente de réponse.
 *
 * Celles déjà traitées sont écartées : les afficher mêlerait ce qui
 * reste à faire à ce qui est fait, sur l'écran précis où l'on cherche
 * « qu'est-ce qu'on me demande ».
 */
export function toRequests(raw: RawVerificationRequest[]): VerificationRequest[] {
  return raw.map((request) => ({
    id: request.id,
    kind: request.kind,
    message: request.message,
    documentId: request.document_id,
    answered: request.responded_at !== null,
    answer: request.user_response,
  }));
}
