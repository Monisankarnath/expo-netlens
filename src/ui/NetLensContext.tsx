import { createContext } from 'react';
import { TrafficStore } from '../core/storage/TrafficStore';
import { LogStore } from '../core/storage/LogStore';
import { TrafficRecord } from '../core/models/TrafficRecord';
import { LogEntry } from '../core/models/LogEntry';
import { TrafficStats } from '../core/storage/TrafficStatistics';

export interface NetLensContextValue {
  // Stores
  trafficStore: TrafficStore;
  logStore: LogStore;

  // Data (reactive)
  records: readonly TrafficRecord[];
  logs: readonly LogEntry[];
  stats: TrafficStats;

  // Controls
  show: () => void;
  hide: () => void;
  clear: () => void;
  stop: () => void;

  // Config
  redactHeaders: string[];

  // UI
  showToast: () => void;
}

export const NetLensContext = createContext<NetLensContextValue | null>(null);
