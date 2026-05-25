export type ContentType = 'json' | 'xml' | 'html' | 'text' | 'form' | 'multipart' | 'image' | 'binary' | 'unknown';

export function detectContentType(mimeType?: string): ContentType {
  if (!mimeType) return 'unknown';
  const lower = mimeType.toLowerCase();
  if (lower.includes('json')) return 'json';
  if (lower.includes('xml')) return 'xml';
  if (lower.includes('html')) return 'html';
  if (lower.includes('text')) return 'text';
  if (lower.includes('form-urlencoded')) return 'form';
  if (lower.includes('multipart')) return 'multipart';
  if (lower.includes('image')) return 'image';
  if (lower.includes('octet-stream') || lower.includes('protobuf')) return 'binary';
  return 'unknown';
}
