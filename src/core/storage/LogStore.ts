import { LogEntry } from '../models/LogEntry';

type Listener = () => void;

export class LogStore {
  private entries: LogEntry[] = [];
  private entryMap = new Map<string, LogEntry>();
  private maxEntries: number;
  private listeners = new Set<Listener>();
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingNotify = false;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
  }

  addEntry(entry: LogEntry): void {
    this.entries.unshift(entry);
    this.entryMap.set(entry.id, entry);

    if (this.entries.length > this.maxEntries) {
      const removed = this.entries.pop();
      if (removed) this.entryMap.delete(removed.id);
    }

    this.scheduleNotify();
  }

  getEntries(): readonly LogEntry[] {
    return this.entries;
  }

  getEntry(id: string): LogEntry | undefined {
    return this.entryMap.get(id);
  }

  getCount(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries = [];
    this.entryMap.clear();
    // Clear immediately — user expects instant feedback
    this.flushNotify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Batched notifications — coalesces rapid updates (e.g. many console.logs
   * in a tight loop) into a single re-render per frame (~16ms).
   */
  private scheduleNotify(): void {
    if (this.notifyTimer) {
      this.pendingNotify = true;
      return;
    }
    // Notify immediately for the first update, then batch subsequent ones
    this.flushNotify();
    this.notifyTimer = setTimeout(() => {
      this.notifyTimer = null;
      if (this.pendingNotify) {
        this.pendingNotify = false;
        this.flushNotify();
      }
    }, 16); // ~1 frame
  }

  private flushNotify(): void {
    this.listeners.forEach(l => {
      try { l(); } catch {}
    });
  }
}
