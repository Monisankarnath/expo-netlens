const MAX_STRING_LENGTH = 10000;

export function safeStringify(value: unknown, maxLength = MAX_STRING_LENGTH): string {
  const seen = new WeakSet();

  try {
    const result = JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
      if (typeof val === 'symbol') return val.toString();
      if (typeof val === 'bigint') return val.toString();
      if (val instanceof Error) return { message: val.message, stack: val.stack, name: val.name };
      if (val instanceof RegExp) return val.toString();
      if (val instanceof Date) return val.toISOString();
      if (typeof val === 'undefined') return '[undefined]';
      return val;
    }, 2);

    if (result && result.length > maxLength) {
      return result.slice(0, maxLength) + '... [truncated]';
    }
    return result ?? '[undefined]';
  } catch {
    return String(value);
  }
}

export function serializeConsoleArgs(args: unknown[]): string[] {
  return args.map(arg => {
    if (typeof arg === 'string') return arg;
    return safeStringify(arg);
  });
}

export function createPreview(args: string[], maxLength = 200): string {
  const joined = args.join(' ');
  if (joined.length <= maxLength) return joined;
  return joined.slice(0, maxLength) + '...';
}
