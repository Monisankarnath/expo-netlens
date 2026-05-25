import { HTTPMethod } from './HTTPMethod';
import { ContentType } from './ContentType';

export interface TrafficRecord {
  id: string;
  timestamp: number;
  request: RequestData;
  response?: ResponseData;
  error?: TrafficError;
  timings: RequestTimings;
  status: 'pending' | 'completed' | 'failed' | 'mocked' | 'paused';
  isMocked: boolean;
  tags?: string[];
}

export interface RequestData {
  url: string;
  method: HTTPMethod;
  headers: Record<string, string>;
  body?: string | null;
  bodySize: number;
  contentType?: ContentType;
}

export interface ResponseData {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string | null;
  bodySize: number;
  contentType?: ContentType;
}

export interface RequestTimings {
  startTime: number;
  endTime?: number;
  duration?: number;
  ttfb?: number;
}

export interface TrafficError {
  message: string;
  code?: string;
  isTimeout: boolean;
  isNetworkError: boolean;
}
