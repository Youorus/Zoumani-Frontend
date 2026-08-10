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
