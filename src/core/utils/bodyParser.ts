import { detectContentType, ContentType } from '../models/ContentType';

const DEFAULT_MAX_BODY_SIZE = 512 * 1024; // 512KB

/** Cross-platform byte length — no Blob dependency */
export function getByteLength(text: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text).length;
  }
  // Fallback: estimate UTF-8 byte length
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

export async function readBody(
  response: Response,
  maxSize: number = DEFAULT_MAX_BODY_SIZE
): Promise<{ body: string | null; size: number; contentType: ContentType }> {
  const contentTypeHeader = response.headers.get('content-type') || '';
  const contentType = detectContentType(contentTypeHeader);

  // Don't read binary bodies
  if (contentType === 'binary' || contentType === 'image') {
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    return { body: null, size: contentLength, contentType };
  }

  // Skip very large responses — check Content-Length first to avoid cloning
  const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
  if (contentLength > maxSize * 2) {
    return {
      body: `[Response too large: ${formatBytes(contentLength)}]`,
      size: contentLength,
      contentType,
    };
  }

  try {
    const cloned = response.clone();
    const text = await cloned.text();
    const size = getByteLength(text);

    if (size > maxSize) {
      return {
        body: text.slice(0, maxSize) + '\n... [truncated at ' + formatBytes(maxSize) + ']',
        size,
        contentType,
      };
    }

    return { body: text, size, contentType };
  } catch {
    return { body: null, size: 0, contentType };
  }
}

export function readRequestBody(body: unknown, maxSize: number = DEFAULT_MAX_BODY_SIZE): { body: string | null; size: number } {
  if (body === null || body === undefined) return { body: null, size: 0 };

  let text: string;
  if (typeof body === 'string') {
    text = body;
  } else if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return { body: '[FormData]', size: 0 };
  } else if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    return { body: '[Binary Data]', size: body.byteLength };
  } else if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return { body: '[Binary Data]', size: body.size };
  } else if (typeof body === 'object') {
    try {
      text = JSON.stringify(body);
    } catch {
      return { body: '[Object]', size: 0 };
    }
  } else {
    text = String(body);
  }

  const size = getByteLength(text);
  if (size > maxSize) {
    return { body: text.slice(0, maxSize) + '\n... [truncated]', size };
  }
  return { body: text, size };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + units[i];
}
