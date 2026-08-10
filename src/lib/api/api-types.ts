export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
  auth?: boolean;
  cache?: RequestCache;
}

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}
