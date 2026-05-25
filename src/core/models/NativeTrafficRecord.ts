export interface NativeTrafficRecord {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  statusCode?: number;
  duration?: number;
  requestHeaders: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string | null;
  responseBody?: string | null;
  requestBodySize: number;
  responseBodySize: number;
  error?: string;
}
