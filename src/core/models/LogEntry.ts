export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  args: string[];
  coloredArgs: ColoredArgData[];
  preview: string;
  prefixColor: string | null;  // deterministic color based on prefix pattern
  stackTrace?: string;
}

/** Serializable version of ColoredArg (no raw ref — safe for store) */
export interface ColoredArgData {
  type: 'string' | 'number' | 'boolean' | 'null' | 'undefined' |
    'object' | 'array' | 'error' | 'function' | 'symbol' | 'date' | 'regex';
  value: string;
  color: string;
}

export interface NativeLogEntry {
  id: string;
  timestamp: number;
  level: NativeLogLevel;
  tag: string;
  message: string;
  source: 'ios' | 'android';
}

export type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';
export type NativeLogLevel = 'verbose' | 'debug' | 'info' | 'warning' | 'error';
