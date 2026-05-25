export const colors = {
  // Base — Chrome DevTools dark gray-blue
  background: '#202124',
  surface: '#292a2d',
  surfaceElevated: '#35363a',
  border: '#3c3c3c',

  // Text
  textPrimary: '#e8eaed',
  textSecondary: '#9aa0a6',
  textTertiary: '#5f6368',

  // Accent — Google blue
  accent: '#8ab4f8',
  accentHover: '#669df6',

  // Selection
  selection: '#1a3a5c',
  activeTab: '#202124',
  inactiveTab: '#292a2d',

  // Status
  success: '#81c995',
  redirect: '#fdd663',
  clientError: '#f28b82',
  serverError: '#ffb74d',
  pending: '#9aa0a6',
  mocked: '#c58af9',

  // Methods
  methodGet: '#81c995',
  methodPost: '#8ab4f8',
  methodPut: '#fdd663',
  methodPatch: '#ffb74d',
  methodDelete: '#f28b82',
  methodOther: '#9aa0a6',

  // Log levels
  logDefault: '#e8eaed',
  logInfo: '#8ab4f8',
  logWarn: '#fdd663',
  logError: '#f28b82',
  logDebug: '#9aa0a6',

  // JSON syntax
  jsonKey: '#8ab4f8',
  jsonString: '#f28b82',
  jsonNumber: '#81c995',
  jsonBoolean: '#8ab4f8',
  jsonNull: '#9aa0a6',
  jsonBracket: '#fdd663',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.7)',
  badge: '#f28b82',
  toast: '#81c995',
  destructive: '#f28b82',
} as const;

export type ColorToken = keyof typeof colors;
