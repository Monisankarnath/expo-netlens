import { TrafficRecord } from '../models/TrafficRecord';

type Listener = () => void;

export class TrafficStore {
  private records: TrafficRecord[] = [];
  private recordMap = new Map<string, TrafficRecord>();
  private maxRecords: number;
  private listeners = new Set<Listener>();
  private notifyTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingNotify = false;

  constructor(maxRecords: number = 500) {
    this.maxRecords = maxRecords;
  }

  addRecord(record: TrafficRecord): void {
    this.records.unshift(record);
    this.recordMap.set(record.id, record);

    // FIFO eviction
    if (this.records.length > this.maxRecords) {
      const removed = this.records.pop();
      if (removed) this.recordMap.delete(removed.id);
    }

    this.scheduleNotify();
  }

  updateRecord(id: string, updates: Partial<TrafficRecord>): void {
    const existing = this.recordMap.get(id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    this.recordMap.set(id, updated);

    const idx = this.records.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.records[idx] = updated;
    }

    this.scheduleNotify();
  }

  getRecords(): readonly TrafficRecord[] {
    return this.records;
  }

  getRecord(id: string): TrafficRecord | undefined {
    return this.recordMap.get(id);
  }

  getCount(): number {
    return this.records.length;
  }

  clear(): void {
    this.records = [];
    this.recordMap.clear();
    // Clear immediately — user expects instant feedback
    this.flushNotify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Batched notifications — coalesces rapid updates (e.g. 50 concurrent
   * requests) into a single re-render per frame (~16ms).
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
