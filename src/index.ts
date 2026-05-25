// Provider
export { NetLensProvider } from './ui/NetLensProvider';
export type { NetLensProviderProps } from './ui/NetLensProvider';

// Hook
export { useNetLens } from './ui/hooks/useNetLens';

// Types
export type { TrafficRecord, RequestData, ResponseData, RequestTimings, TrafficError } from './core/models/TrafficRecord';
export type { NativeTrafficRecord } from './core/models/NativeTrafficRecord';
export type { LogEntry, NativeLogEntry, LogLevel, NativeLogLevel, ColoredArgData } from './core/models/LogEntry';
export type { HTTPMethod } from './core/models/HTTPMethod';
export type { ContentType } from './core/models/ContentType';
export type { StatusCategory } from './core/models/StatusCategory';
export type { TrafficFilter, ExportFormat } from './core/models/TrafficFilter';
export type { MockRule, MockMatching, MockAction, MockResponse, MockErrorType } from './core/mock/types';
export type { BreakpointRule } from './core/breakpoint/types';
export type { TrafficStats } from './core/storage/TrafficStatistics';

// Formatters (useful for programmatic access)
export { formatToCurl } from './core/formatters/CURLFormatter';

// Imperative API singleton (to be expanded in Phase 2)
class NetLensAPI {
  show() {
    console.warn('NetLens.show() — use the useNetLens() hook or FAB button instead');
  }

  hide() {
    console.warn('NetLens.hide() — use the useNetLens() hook instead');
  }

  clear() {
    console.warn('NetLens.clear() — use the useNetLens() hook instead');
  }

  stop() {
    console.warn('NetLens.stop() — use the useNetLens() hook instead');
  }

  mock = {
    json: (_pattern: string, _body: unknown, _status?: number) => {
      console.warn('NetLens.mock — coming in Phase 2');
    },
    error: (_pattern: string, _type?: string) => {
      console.warn('NetLens.mock — coming in Phase 2');
    },
    delay: (_pattern: string, _ms?: number) => {
      console.warn('NetLens.mock — coming in Phase 2');
    },
    addRule: (_rule: any) => {
      console.warn('NetLens.mock — coming in Phase 2');
    },
    clearRules: () => {
      console.warn('NetLens.mock — coming in Phase 2');
    },
  };

  export = {
    toCurl: (_recordId: string) => {
      console.warn('NetLens.export — use formatToCurl() directly');
      return '';
    },
    toHar: () => {
      console.warn('NetLens.export — coming in Phase 2');
      return '';
    },
  };
}

export const NetLens = new NetLensAPI();
