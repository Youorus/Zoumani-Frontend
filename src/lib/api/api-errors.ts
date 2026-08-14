export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly details?: unknown;

  constructor({
    message,
    status,
    code,
    details,
  }: {
    message: string;
    status: number | null;
    code: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ValidationFieldError {
  field: string;
  reason: string;
}

interface BackendErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  correlation_id?: string;
}

/** Construit la même erreur riche pour tous les clients HTTP du frontend. */
export function apiErrorFromPayload({
  status,
  statusText,
  payload,
}: {
  status: number;
  statusText?: string;
  payload: unknown;
}): ApiError {
  if (typeof payload === "string") {
    return new ApiError({
      status,
      code: "HTTP_ERROR",
      message: payload || statusText || "Une erreur est survenue.",
    });
  }

  const backend = isRecord(payload) ? (payload as BackendErrorPayload) : null;
  return new ApiError({
    status,
    code: backend?.error?.code ?? "HTTP_ERROR",
    message: backend?.error?.message ?? statusText ?? "Une erreur est survenue.",
    details: backend?.error?.details,
  });
}

/** Erreurs Pydantic attachées à leurs chemins, quand le backend en fournit. */
export function validationFieldsOf(error: unknown): ValidationFieldError[] {
  if (!(error instanceof ApiError) || !isRecord(error.details)) {
    return [];
  }
  const fields = error.details.fields;
  if (!Array.isArray(fields)) {
    return [];
  }
  return fields.flatMap((field) => {
    if (
      !isRecord(field) ||
      typeof field.field !== "string" ||
      typeof field.reason !== "string"
    ) {
      return [];
    }
    return [{ field: field.field, reason: field.reason }];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
