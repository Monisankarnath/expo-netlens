import { Platform } from 'react-native';

const monoFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: 'Cascadia Code, Fira Code, monospace',
  default: 'monospace',
});

const sansFamily = Platform.select({
  ios: '-apple-system',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  default: 'System',
});

export const typography = {
  mono: {
    fontFamily: monoFamily,
  },
  sans: {
    fontFamily: sansFamily,
  },
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 28,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
