import type { Unsubscribe } from "./repositories";

/** Tells subscribers that stored data changed; they re-read what they show. */
export class ChangeNotifier {
  private readonly listeners = new Set<() => void>();

  subscribe(listener: () => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(): void {
    for (const listener of this.listeners) listener();
  }
}
