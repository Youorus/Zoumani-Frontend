import type { QueryClient } from "@tanstack/react-query";

export interface RealtimeEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  occurredAt: string;
  source: "websocket" | "sse" | "local";
}

export interface RealtimeEventHandler {
  type: string;
  handle: (payload: { event: RealtimeEvent; queryClient: QueryClient }) => void;
}
