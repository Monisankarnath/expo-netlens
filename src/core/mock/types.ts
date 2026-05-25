import { HTTPMethod } from '../models/HTTPMethod';

export interface MockRule {
  id: string;
  name: string;
  enabled: boolean;
  matching: MockMatching;
  action: MockAction;
  priority: number;
  hitCount: number;
  createdAt: number;
}

export interface MockMatching {
  urlPattern: string;
  method?: HTTPMethod;
  headerMatchers?: Record<string, string>;
}

export type MockAction =
  | { type: 'respond'; response: MockResponse }
  | { type: 'error'; error: MockErrorType }
  | { type: 'delay'; seconds: number }
  | { type: 'passthrough' };

export interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: string;
  delay?: number;
}

export type MockErrorType = 'network' | 'timeout' | 'abort' | 'dns' | { custom: string };
