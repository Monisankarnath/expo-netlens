import { TrafficRecord, RequestData, ResponseData, RequestTimings, TrafficError } from '../models/TrafficRecord';
import { detectContentType } from '../models/ContentType';
import { normalizeHeaders, getContentTypeFromHeaders } from '../utils/headerUtils';
import { readBody, readRequestBody } from '../utils/bodyParser';
import { HTTPMethod } from '../models/HTTPMethod';

type TrafficCallback = (record: TrafficRecord) => void;
type UpdateCallback = (id: string, updates: Partial<TrafficRecord>) => void;

declare const global: { fetch: typeof fetch };

let originalFetch: typeof fetch | null = null;
let isPatched = false;
let stopped = false;

export function patchFetch(
  onRecord: TrafficCallback,
  onUpdate: UpdateCallback,
  config: { maxBodySize: number }
): void {
  if (isPatched) return;
  originalFetch = global.fetch;
  isPatched = true;
  stopped = false;

  global.fetch = async function netlensInterceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // If stopped or no original, pass through
    if (stopped || !originalFetch) {
      return originalFetch!(input, init);
    }

    const id = generateId();
    const startTime = Date.now();

    // Parse request metadata (read-only — never modify the actual request)
    let url: string;
    let method: HTTPMethod;
    let headers: Record<string, string>;

    try {
      url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      method = ((init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()) as HTTPMethod;
      const rawHeaders = init?.headers || (input instanceof Request ? input.headers : {});
      headers = normalizeHeaders(rawHeaders);
    } catch {
      // If metadata parsing fails, just pass through without recording
      return originalFetch!(input, init);
    }

    // Parse request body (read-only)
    const requestBodyData = readRequestBody(init?.body, config.maxBodySize);

    const request: RequestData = {
      url,
      method,
      headers,
      body: requestBodyData.body,
      bodySize: requestBodyData.size,
      contentType: detectContentType(getContentTypeFromHeaders(headers)),
    };

    const timings: RequestTimings = { startTime };

    const record: TrafficRecord = {
      id,
      timestamp: startTime,
      request,
      timings,
      status: 'pending',
      isMocked: false,
    };

    // Notify store — never let this break the actual request
    try { onRecord(record); } catch {}

    // Call the ORIGINAL fetch with UNMODIFIED arguments
    try {
      const response = await originalFetch!(input, init);

      if (!stopped) {
        const endTime = Date.now();

        // Read response body from a clone — errors here must not affect the response
        let bodyResult = { body: null as string | null, size: 0, contentType: detectContentType(response.headers.get('content-type') || '') };
        try {
          bodyResult = await readBody(response.clone(), config.maxBodySize);
        } catch {}

        const responseHeaders = normalizeHeaders(response.headers);
        const responseData: ResponseData = {
          statusCode: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: bodyResult.body,
          bodySize: bodyResult.size,
          contentType: bodyResult.contentType,
        };

        try {
          onUpdate(id, {
            response: responseData,
            timings: { startTime, endTime, duration: endTime - startTime },
            status: 'completed',
          });
        } catch {}
      }

      // Always return the original, unmodified response
      return response;
    } catch (err: any) {
      if (!stopped) {
        const endTime = Date.now();
        const error: TrafficError = {
          message: err?.message || 'Unknown error',
          code: err?.code,
          isTimeout: err?.name === 'AbortError' || err?.message?.includes('timeout'),
          isNetworkError: err?.message?.includes('Network') || err?.message?.includes('network') || err?.name === 'TypeError',
        };

        try {
          onUpdate(id, {
            error,
            timings: { startTime, endTime, duration: endTime - startTime },
            status: 'failed',
          });
        } catch {}
      }

      // Always rethrow the original error — never swallow it
      throw err;
    }
  };
}

export function unpatchFetch(): void {
  if (!isPatched || !originalFetch) return;
  stopped = true;
  global.fetch = originalFetch;
  originalFetch = null;
  isPatched = false;
  idCounter = 0;
}

export function getOriginalFetch(): typeof fetch | null {
  return originalFetch;
}

let idCounter = 0;
function generateId(): string {
  return `fetch-${Date.now()}-${++idCounter}`;
}
