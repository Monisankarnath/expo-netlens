export type StatusCategory = 'informational' | 'success' | 'redirect' | 'clientError' | 'serverError';

export function getStatusCategory(code: number): StatusCategory {
  if (code < 200) return 'informational';
  if (code < 300) return 'success';
  if (code < 400) return 'redirect';
  if (code < 500) return 'clientError';
  return 'serverError';
}

export const STATUS_COLORS: Record<StatusCategory, string> = {
  informational: '#9aa0a6',
  success: '#81c995',
  redirect: '#fdd663',
  clientError: '#f28b82',
  serverError: '#ffb74d',
};
