const IGNORED_URL_PATTERNS = [
  /^https?:\/\/localhost:8081/,
  /^https?:\/\/localhost:19[0-9]{3}/,
  /^https?:\/\/127\.0\.0\.1:8081/,
  /^https?:\/\/10\.0\.2\.2:8081/,     // Android emulator
  /\/symbolicate$/,
  /\/__metro\//,
  /\.hot-update\./,
  /\/logs$/,
  /\/status$/,
  /debugger-ui/,
  /\.bundle\?/,
  /devtools/i,
];

const IGNORED_LOG_PATTERNS = [
  /^Running ".*" with \{/,          // RN app startup
  /^%cDownload the React DevTools/,  // React DevTools suggestion
  /^\[Fast Refresh\]/,
  /^\[HMR\]/,
  /^Bridgeless mode is enabled/,
  /^NEW NativeEventEmitter/,
  /^LogBox/,
];

export function shouldIgnoreURL(url: string): boolean {
  return IGNORED_URL_PATTERNS.some(pattern => pattern.test(url));
}

export function shouldIgnoreLog(message: string): boolean {
  return IGNORED_LOG_PATTERNS.some(pattern => pattern.test(message));
}

export function isHostAllowed(url: string, captureHosts?: string[], ignoreHosts?: string[]): boolean {
  try {
    const hostname = new URL(url).hostname;
    if (ignoreHosts?.length && ignoreHosts.includes(hostname)) return false;
    if (captureHosts?.length) return captureHosts.includes(hostname);
    return true;
  } catch {
    return true;
  }
}
