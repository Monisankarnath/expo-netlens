import { patchFetch, unpatchFetch } from './FetchInterceptor';
import { patchXHR, unpatchXHR } from './XHRInterceptor';
import { patchConsole, unpatchConsole } from './ConsoleInterceptor';
import { TrafficRecord } from '../models/TrafficRecord';
import { LogEntry } from '../models/LogEntry';
import { shouldIgnoreURL, isHostAllowed } from '../utils/autoIgnore';

export interface InterceptorConfig {
  maxBodySize: number;
  captureHosts?: string[];
  ignoreHosts?: string[];
  captureLogs: boolean;
}

export class InterceptorManager {
  private running = false;
  private config: InterceptorConfig;
  private onTraffic: (record: TrafficRecord) => void;
  private onTrafficUpdate: (id: string, updates: Partial<TrafficRecord>) => void;
  private onLog: (entry: LogEntry) => void;

  constructor(
    config: InterceptorConfig,
    onTraffic: (record: TrafficRecord) => void,
    onTrafficUpdate: (id: string, updates: Partial<TrafficRecord>) => void,
    onLog: (entry: LogEntry) => void,
  ) {
    this.config = config;
    this.onTraffic = onTraffic;
    this.onTrafficUpdate = onTrafficUpdate;
    this.onLog = onLog;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    const filteredOnTraffic = (record: TrafficRecord) => {
      if (shouldIgnoreURL(record.request.url)) return;
      if (!isHostAllowed(record.request.url, this.config.captureHosts, this.config.ignoreHosts)) return;
      this.onTraffic(record);
    };

    const filteredOnUpdate = (id: string, updates: Partial<TrafficRecord>) => {
      this.onTrafficUpdate(id, updates);
    };

    patchFetch(filteredOnTraffic, filteredOnUpdate, { maxBodySize: this.config.maxBodySize });
    patchXHR(filteredOnTraffic, filteredOnUpdate, { maxBodySize: this.config.maxBodySize });

    if (this.config.captureLogs) {
      patchConsole(this.onLog);
    }
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    unpatchFetch();
    unpatchXHR();
    unpatchConsole();
  }

  isRunning(): boolean {
    return this.running;
  }
}
