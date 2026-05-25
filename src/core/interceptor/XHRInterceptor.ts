import { TrafficRecord, RequestData, ResponseData, TrafficError } from '../models/TrafficRecord';
import { detectContentType } from '../models/ContentType';
import { readRequestBody, getByteLength } from '../utils/bodyParser';
import { HTTPMethod } from '../models/HTTPMethod';

type TrafficCallback = (record: TrafficRecord) => void;
type UpdateCallback = (id: string, updates: Partial<TrafficRecord>) => void;

let isPatched = false;
let stopped = false;
let originalOpen: typeof XMLHttpRequest.prototype.open | null = null;
let originalSend: typeof XMLHttpRequest.prototype.send | null = null;
let originalSetRequestHeader: typeof XMLHttpRequest.prototype.setRequestHeader | null = null;

export function patchXHR(
  onRecord: TrafficCallback,
  onUpdate: UpdateCallback,
  config: { maxBodySize: number }
): void {
  if (isPatched) return;
  isPatched = true;
  stopped = false;

  originalOpen = XMLHttpRequest.prototype.open;
  originalSend = XMLHttpRequest.prototype.send;
  originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
    (this as any)._netlens = {
      id: `xhr-${Date.now()}-${++xhrCounter}`,
      method: method.toUpperCase() as HTTPMethod,
      url: typeof url === 'string' ? url : url.toString(),
      headers: {} as Record<string, string>,
      startTime: Date.now(),
    };
    return originalOpen!.apply(this, [method, url, ...args] as any);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name: string, value: string) {
    if ((this as any)._netlens) {
      (this as any)._netlens.headers[name.toLowerCase()] = value;
    }
    return originalSetRequestHeader!.call(this, name, value);
  };

  XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
    const meta = (this as any)._netlens;
    if (!meta || stopped) {
      return originalSend!.call(this, body);
    }

    // NO header injection — never modify the developer's request

    const bodyData = readRequestBody(body, config.maxBodySize);

    const request: RequestData = {
      url: meta.url,
      method: meta.method,
      headers: meta.headers,
      body: bodyData.body,
      bodySize: bodyData.size,
      contentType: detectContentType(meta.headers['content-type']),
    };

    const record: TrafficRecord = {
      id: meta.id,
      timestamp: meta.startTime,
      request,
      timings: { startTime: meta.startTime },
      status: 'pending',
      isMocked: false,
    };

    // Never let recording break the actual request
    try { onRecord(record); } catch {}

    const originalOnReadyStateChange = this.onreadystatechange;

    this.onreadystatechange = function (ev: Event) {
      // Always call the original handler first — developer's code takes priority
      if (originalOnReadyStateChange) {
        try { originalOnReadyStateChange.call(this, ev); } catch {}
      }

      // Then record (wrapped in try/catch — never break the app)
      if (this.readyState === 4 && !stopped) {
        try {
          const endTime = Date.now();

          if (this.status === 0 && !this.responseText) {
            const error: TrafficError = {
              message: 'Network request failed',
              isTimeout: false,
              isNetworkError: true,
            };
            onUpdate(meta.id, {
              error,
              timings: { startTime: meta.startTime, endTime, duration: endTime - meta.startTime },
              status: 'failed',
            });
          } else {
            const rawHeaders = this.getAllResponseHeaders() || '';
            const responseHeaders: Record<string, string> = {};
            rawHeaders.split('\r\n').forEach((line: string) => {
              const idx = line.indexOf(':');
              if (idx > 0) {
                responseHeaders[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim();
              }
            });

            let responseBody: string | null = null;
            let responseBodySize = 0;
            try {
              responseBody = this.responseText;
              responseBodySize = responseBody ? getByteLength(responseBody) : 0;
              if (responseBody && responseBodySize > config.maxBodySize) {
                responseBody = responseBody.slice(0, config.maxBodySize) + '\n... [truncated]';
              }
            } catch {}

            const responseData: ResponseData = {
              statusCode: this.status,
              statusText: this.statusText,
              headers: responseHeaders,
              body: responseBody,
              bodySize: responseBodySize,
              contentType: detectContentType(responseHeaders['content-type']),
            };

            onUpdate(meta.id, {
              response: responseData,
              timings: { startTime: meta.startTime, endTime, duration: endTime - meta.startTime },
              status: 'completed',
            });
          }
        } catch {}
      }
    };

    // Handle errors and timeouts — record first, then call original
    const originalOnError = this.onerror;
    this.onerror = function (ev: Event) {
      if (!stopped) {
        try {
          const endTime = Date.now();
          onUpdate(meta.id, {
            error: { message: 'XHR Error', isTimeout: false, isNetworkError: true },
            timings: { startTime: meta.startTime, endTime, duration: endTime - meta.startTime },
            status: 'failed',
          });
        } catch {}
      }
      if (originalOnError) {
        try { originalOnError.call(this, ev as any); } catch {}
      }
    };

    const originalOnTimeout = this.ontimeout;
    this.ontimeout = function (ev: Event) {
      if (!stopped) {
        try {
          const endTime = Date.now();
          onUpdate(meta.id, {
            error: { message: 'Request timed out', isTimeout: true, isNetworkError: false },
            timings: { startTime: meta.startTime, endTime, duration: endTime - meta.startTime },
            status: 'failed',
          });
        } catch {}
      }
      if (originalOnTimeout) {
        try { originalOnTimeout.call(this, ev as any); } catch {}
      }
    };

    return originalSend!.call(this, body);
  };
}

export function unpatchXHR(): void {
  if (!isPatched) return;
  stopped = true;
  if (originalOpen) XMLHttpRequest.prototype.open = originalOpen;
  if (originalSend) XMLHttpRequest.prototype.send = originalSend;
  if (originalSetRequestHeader) XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader;
  originalOpen = null;
  originalSend = null;
  originalSetRequestHeader = null;
  isPatched = false;
  xhrCounter = 0;
}

let xhrCounter = 0;
