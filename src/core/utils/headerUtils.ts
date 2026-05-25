export function normalizeHeaders(headers: any): Record<string, string> {
  const result: Record<string, string> = {};

  if (!headers) return result;

  // Headers object (from fetch API)
  if (typeof headers.forEach === 'function') {
    headers.forEach((value: string, key: string) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  // Plain object
  if (typeof headers === 'object') {
    for (const [key, value] of Object.entries(headers)) {
      result[key.toLowerCase()] = String(value);
    }
  }

  return result;
}

export function redactHeaders(
  headers: Record<string, string>,
  redactKeys: string[] = ['authorization', 'cookie', 'set-cookie']
): Record<string, string> {
  const result: Record<string, string> = {};
  const redactSet = new Set(redactKeys.map(k => k.toLowerCase()));

  for (const [key, value] of Object.entries(headers)) {
    result[key] = redactSet.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }

  return result;
}

export function getContentTypeFromHeaders(headers: Record<string, string>): string | undefined {
  return headers['content-type'];
}
