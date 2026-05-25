/**
 * Log Colorizer — assigns deterministic colors to log prefixes/patterns
 * and classifies each argument by type for syntax-highlighted rendering.
 *
 * Prefix detection: extracts leading string patterns from console args.
 *   console.log("===>>>", data)  → prefix "===>>>"
 *   console.log("[API]", url)    → prefix "[API]"
 *   console.log("count =", n)    → prefix "count ="
 *   console.log(data)            → no prefix (default color)
 */

// 12 visually distinct colors for prefix hashing (VSCode-inspired)
const PREFIX_PALETTE = [
  '#4EC9B0', // teal
  '#569CD6', // blue
  '#CE9178', // orange
  '#C586C0', // purple
  '#DCDCAA', // yellow
  '#D16969', // dark red
  '#9CDCFE', // light blue
  '#B5CEA8', // green
  '#D7BA7D', // gold
  '#4FC1FF', // cyan
  '#C8C8C8', // silver
  '#D4A0FF', // lavender
] as const;

// Deterministic hash → palette index
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Extracts a prefix pattern from the first string argument.
 * Returns null if no meaningful prefix is found.
 */
export function extractPrefix(firstArg: unknown): string | null {
  if (typeof firstArg !== 'string') return null;
  const trimmed = firstArg.trim();
  if (trimmed.length === 0) return null;

  // Skip if it looks like a full sentence or data (no prefix-like pattern)
  // A prefix is: short (≤ 40 chars) AND either:
  //   - ends with a delimiter: : = > ) ] | -
  //   - wrapped in brackets: [TAG], (INFO), {DEBUG}
  //   - is all symbols: ===>>>, ---, ***, ###
  //   - ends with a space + is short (≤ 20 chars) like "count ="

  // Bracket-wrapped: [API], (DEBUG), {NET}
  if (/^[\[\(\{].+[\]\)\}]$/.test(trimmed) && trimmed.length <= 40) {
    return trimmed;
  }

  // Ends with delimiter: : = > ) ] | -
  if (trimmed.length <= 40 && /[:=\->\)\]|]$/.test(trimmed)) {
    return trimmed;
  }

  // All symbols (no letters/digits) like ===>>>, ---
  if (/^[^a-zA-Z0-9\s]+$/.test(trimmed) && trimmed.length <= 20) {
    return trimmed;
  }

  // Short word followed by colon/equals in the string
  const match = trimmed.match(/^([A-Za-z_][\w\s]{0,20}[=:])/)
  if (match) {
    return match[1].trim();
  }

  return null;
}

/**
 * Returns a deterministic color for a given prefix string.
 */
export function getColorForPrefix(prefix: string): string {
  const index = hashString(prefix) % PREFIX_PALETTE.length;
  return PREFIX_PALETTE[index];
}

// Argument type classification for syntax-highlighted rendering
export type ArgType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' |
  'object' | 'array' | 'error' | 'function' | 'symbol' | 'date' | 'regex';

export interface ColoredArg {
  type: ArgType;
  value: string;       // serialized display string
  color: string;       // display color
}

// Type → color mapping (VSCode syntax colors)
const TYPE_COLORS: Record<ArgType, string> = {
  string: '#CE9178',   // orange (like VSCode strings)
  number: '#B5CEA8',   // green
  boolean: '#569CD6',  // blue
  null: '#569CD6',     // blue
  undefined: '#858585', // gray
  object: '#9CDCFE',   // light blue
  array: '#9CDCFE',    // light blue
  error: '#F44747',    // red
  function: '#DCDCAA', // yellow
  symbol: '#C586C0',   // purple
  date: '#D7BA7D',     // gold
  regex: '#D16969',    // dark red
};

function classifyArg(value: unknown): ArgType {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value instanceof Error) return 'error';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regex';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'function') return 'function';
  if (typeof value === 'symbol') return 'symbol';
  if (typeof value === 'object') return 'object';
  return typeof value as ArgType;
}

/**
 * Converts raw console args into colored arg descriptors for rich rendering.
 */
export function colorizeArgs(args: unknown[]): ColoredArg[] {
  return args.map(arg => {
    const type = classifyArg(arg);
    const color = TYPE_COLORS[type];

    let value: string;
    switch (type) {
      case 'string':
        value = arg as string;
        break;
      case 'number':
      case 'boolean':
        value = String(arg);
        break;
      case 'null':
        value = 'null';
        break;
      case 'undefined':
        value = 'undefined';
        break;
      case 'error': {
        const err = arg as Error;
        value = `${err.name}: ${err.message}`;
        break;
      }
      case 'function':
        value = `[Function: ${(arg as Function).name || 'anonymous'}]`;
        break;
      case 'symbol':
        value = (arg as Symbol).toString();
        break;
      case 'date':
        value = (arg as Date).toISOString();
        break;
      case 'regex':
        value = (arg as RegExp).toString();
        break;
      case 'array':
      case 'object':
        try {
          const seen = new WeakSet();
          value = JSON.stringify(arg, (_key, val) => {
            if (typeof val === 'object' && val !== null) {
              if (seen.has(val)) return '[Circular]';
              seen.add(val);
            }
            if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
            if (typeof val === 'undefined') return '[undefined]';
            return val;
          }, 2);
          if (value.length > 500) {
            value = value.slice(0, 500) + '\n...';
          }
        } catch {
          value = String(arg);
        }
        break;
      default:
        value = String(arg);
    }

    return { type, value, color };
  });
}

/**
 * For a set of serialized args, detect the prefix and return the prefix color.
 * Returns default text color if no prefix detected.
 */
export function getLogPrefixColor(args: unknown[]): string | null {
  if (args.length === 0) return null;
  const prefix = extractPrefix(args[0]);
  if (!prefix) return null;
  return getColorForPrefix(prefix);
}

export function getArgTypeColor(type: ArgType): string {
  return TYPE_COLORS[type];
}
