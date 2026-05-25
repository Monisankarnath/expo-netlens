import { TrafficRecord } from '../models/TrafficRecord';

export function formatToCurl(record: TrafficRecord): string {
  const { request } = record;
  const parts: string[] = ['curl'];

  // Method (skip for GET as it's default)
  if (request.method !== 'GET') {
    parts.push(`-X ${request.method}`);
  }

  // URL (quote it)
  parts.push(`'${request.url}'`);

  // Headers
  for (const [key, value] of Object.entries(request.headers)) {
    // Skip pseudo-headers and internal headers
    if (key.startsWith(':') || key.toLowerCase() === 'x-netlens-js') continue;
    parts.push(`-H '${key}: ${value}'`);
  }

  // Body
  if (request.body && request.method !== 'GET' && request.method !== 'HEAD') {
    // Escape single quotes in body
    const escapedBody = request.body.replace(/'/g, "'\\''");
    parts.push(`-d '${escapedBody}'`);
  }

  return parts.join(' \\\n  ');
}
