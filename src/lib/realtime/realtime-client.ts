import type { RealtimeEvent } from "./events";

type RealtimeListener = (event: RealtimeEvent) => void;

class RealtimeClient {
  private listeners = new Set<RealtimeListener>();

  connect() {
    return () => {
      this.disconnect();
    };
  }

  disconnect() {
    this.listeners.clear();
  }

  subscribe(listener: RealtimeListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: RealtimeEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const realtimeClient = new RealtimeClient();
