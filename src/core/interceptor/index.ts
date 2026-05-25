export { patchFetch, unpatchFetch, getOriginalFetch } from './FetchInterceptor';
export { patchXHR, unpatchXHR } from './XHRInterceptor';
export { patchConsole, unpatchConsole } from './ConsoleInterceptor';
export { InterceptorManager } from './InterceptorManager';
export type { InterceptorConfig } from './InterceptorManager';
