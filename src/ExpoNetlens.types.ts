export type OnNativeTrafficEvent = {
  id: string;
  url: string;
  method: string;
  statusCode?: number;
  duration?: number;
  requestHeaders: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  error?: string;
};

export type OnNativeLogEvent = {
  id: string;
  level: string;
  tag: string;
  message: string;
};

export type OnShakeEvent = {};

export type ExpoNetlensModuleEvents = {
  onNativeTraffic: (event: OnNativeTrafficEvent) => void;
  onNativeLog: (event: OnNativeLogEvent) => void;
  onShake: (event: OnShakeEvent) => void;
};
