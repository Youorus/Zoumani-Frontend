import { ApiError } from "./api-errors";
import type { ApiErrorPayload, ApiRequestOptions, HttpMethod } from "./api-types";

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Préfixe du passe-plat authentifié.
 *
 * Le navigateur ne parle **jamais** à l'API directement : il appelle sa
 * propre origine, et le serveur ajoute le jeton lu dans un cookie
 * `httpOnly` (ADR-0010). Trois conséquences :
 *
 * 1. aucun jeton ne transite par le JavaScript de page — une faille XSS ne
 *    peut donc pas voler la session ;
 * 2. aucune configuration CORS avec identifiants à tenir exacte ;
 * 3. le rafraîchissement est invisible : il a lieu côté serveur.
 */
const PROXY_PREFIX = "/api/proxy";

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PROXY_PREFIX}${normalizedPath}`;
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort("Request timeout"),
    timeoutMs,
  );

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  };
}

function mergeSignals(signalA?: AbortSignal, signalB?: AbortSignal) {
  if (!signalA) {
    return signalB;
  }

  if (!signalB) {
    return signalA;
  }

  const controller = new AbortController();

  const abort = () => controller.abort();

  signalA.addEventListener("abort", abort, { once: true });
  signalB.addEventListener("abort", abort, { once: true });

  return controller.signal;
}

async function parseResponse<T>(response: Response) {
  if (response.status === 204) {
    return undefined as T;
  }

  const rawBody = await response.text();

  if (!rawBody) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody) as T;
  }

  return rawBody as T;
}

function normalizeHttpError(
  response: Response,
  payload: ApiErrorPayload | string | undefined,
) {
  if (typeof payload === "string") {
    return new ApiError({
      status: response.status,
      code: "HTTP_ERROR",
      message: payload || response.statusText || "HTTP error",
    });
  }

  return new ApiError({
    status: response.status,
    code: payload?.code ?? "HTTP_ERROR",
    message: payload?.message ?? response.statusText ?? "HTTP error",
    details: payload?.details,
  });
}

function normalizeUnexpectedError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new ApiError({
      status: 408,
      code: "REQUEST_TIMEOUT",
      message: "The request timed out.",
    });
  }

  return new ApiError({
    status: 0,
    code: "NETWORK_ERROR",
    message: error instanceof Error ? error.message : "Unexpected network error.",
  });
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
) {
  const {
    method = "GET",
    body,
    headers,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    auth = true,
    cache = "no-store",
  } = options;

  const timeoutController =
    typeof window !== "undefined" ? createTimeoutSignal(timeoutMs) : null;
  const mergedSignal = mergeSignals(signal, timeoutController?.signal);

  try {
    // `auth` n'a plus d'effet sur les en-têtes : le jeton est ajouté par
    // le serveur, à partir d'un cookie que ce code ne peut pas lire. La
    // valeur reste dans le type le temps que les appelants migrent.
    void auth;
    const requestHeaders = new Headers(headers);

    if (!(body instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json");
    }

    requestHeaders.set("Accept", "application/json");

    const response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      // Sans cela, le navigateur n'envoie pas le cookie de session et le
      // serveur ne verrait jamais qui appelle.
      credentials: "same-origin",
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: mergedSignal,
      cache,
    });

    const parsedPayload = await parseResponse<ApiErrorPayload | TResponse>(response);

    if (!response.ok) {
      throw normalizeHttpError(
        response,
        parsedPayload as ApiErrorPayload | string | undefined,
      );
    }

    return parsedPayload as TResponse;
  } catch (error) {
    throw normalizeUnexpectedError(error);
  } finally {
    timeoutController?.clear();
  }
}

function withMethod(method: HttpMethod) {
  return <TResponse, TBody = unknown>(
    path: string,
    options: Omit<ApiRequestOptions<TBody>, "method"> = {},
  ) => request<TResponse, TBody>(path, { ...options, method });
}

export const apiClient = {
  request,
  get: withMethod("GET"),
  post: withMethod("POST"),
  put: withMethod("PUT"),
  patch: withMethod("PATCH"),
  delete: withMethod("DELETE"),
};
