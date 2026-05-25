import { LogEntry, LogLevel } from '../models/LogEntry';
import { serializeConsoleArgs, createPreview } from '../utils/serializer';
import { shouldIgnoreLog } from '../utils/autoIgnore';
import { colorizeArgs, getLogPrefixColor } from '../utils/logColorizer';

type LogCallback = (entry: LogEntry) => void;

const LEVELS: LogLevel[] = ['log', 'warn', 'error', 'info', 'debug'];
const originals: Partial<Record<LogLevel, Function>> = {};
let isPatched = false;
let logCounter = 0;

export function patchConsole(onLog: LogCallback): void {
  if (isPatched) return;
  isPatched = true;

  for (const level of LEVELS) {
    originals[level] = console[level];

    console[level] = function (...args: unknown[]) {
      // Always call original first — developer's console output is never affected
      originals[level]!.apply(console, args);

      // Everything below is wrapped — if ANY of our code throws,
      // the developer's console.log still worked normally above
      try {
        const serialized = serializeConsoleArgs(args);
        const preview = createPreview(serialized);

        if (shouldIgnoreLog(preview)) return;

        // Colorize args (type-aware + prefix detection)
        let coloredArgs: LogEntry['coloredArgs'] = [];
        let prefixColor: string | null = null;
        try {
          const colored = colorizeArgs(args);
          coloredArgs = colored.map(({ type, value, color }) => ({ type, value, color }));
          prefixColor = getLogPrefixColor(args);
        } catch {
          // Fallback: plain uncolored args
          coloredArgs = serialized.map(s => ({ type: 'string' as const, value: s, color: '#CCCCCC' }));
        }

        // Capture stack trace for errors
        let stackTrace: string | undefined;
        if (level === 'error') {
          const errorArg = args.find(a => a instanceof Error);
          if (errorArg instanceof Error) {
            stackTrace = errorArg.stack;
          } else {
            stackTrace = new Error().stack?.split('\n').slice(2).join('\n');
          }
        }

        const entry: LogEntry = {
          id: `log-${Date.now()}-${++logCounter}`,
          timestamp: Date.now(),
          level,
          args: serialized,
          coloredArgs,
          preview,
          prefixColor,
          stackTrace,
        };

        onLog(entry);
      } catch {
        // Silently fail — never interfere with the developer's app
      }
    };
  }
}

export function unpatchConsole(): void {
  if (!isPatched) return;
  for (const level of LEVELS) {
    if (originals[level]) {
      console[level] = originals[level] as any;
    }
  }
  isPatched = false;
  logCounter = 0;
}
