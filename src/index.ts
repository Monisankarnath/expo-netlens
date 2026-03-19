// Reexport the native module. On web, it will be resolved to ExpoNetlensModule.web.ts
// and on native platforms to ExpoNetlensModule.ts
export { default } from './ExpoNetlensModule';
export { default as ExpoNetlensView } from './ExpoNetlensView';
export * from  './ExpoNetlens.types';
