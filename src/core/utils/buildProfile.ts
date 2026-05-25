export type BuildProfile = 'development' | 'preview' | 'production';

export function detectBuildProfile(): BuildProfile {
  // @ts-ignore - __DEV__ is a React Native global
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }

  // Check for EAS preview builds
  try {
    // @ts-ignore
    const Constants = require('expo-constants').default;
    if (Constants?.expoConfig?.extra?.eas?.buildProfile === 'preview') {
      return 'preview';
    }
  } catch {}

  return 'production';
}

export function isProduction(): boolean {
  return detectBuildProfile() === 'production';
}
