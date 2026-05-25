export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export const METHOD_COLORS: Record<HTTPMethod, string> = {
  GET: '#81c995',
  POST: '#8ab4f8',
  PUT: '#fdd663',
  PATCH: '#ffb74d',
  DELETE: '#f28b82',
  HEAD: '#9aa0a6',
  OPTIONS: '#9aa0a6',
};
