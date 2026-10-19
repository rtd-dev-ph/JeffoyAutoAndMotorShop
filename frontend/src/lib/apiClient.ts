/**
 * API client — wraps the native `fetch` API with convenience features:
 *
 * 1. Automatically prepends the base URL
 * 2. Sets JSON headers on both request and response
 * 3. Throws typed errors on non-2xx responses
 * 4. Parses JSON responses safely
 *
 * Usage:
 *   import { apiClient } from '@/lib/apiClient';
 *   const categories = await apiClient.get<CategoryDto[]>('/api/categories');
 */

import { API_BASE_URL } from './config';

export class ApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Safely parse JSON, returning undefined instead of throwing on empty bodies.
 */
async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // Not JSON — could be a plain-text error or HTML error page
    return text;
  }
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  // 204 No Content — nothing to parse
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    // Try to extract a useful error message from Problem Details (RFC 9110)
    if (data && typeof data === 'object' && 'detail' in data) {
      throw new ApiError(
        (data as { detail: string }).detail,
        response.status,
        response.statusText,
      );
    }
    throw new ApiError(
      (typeof data === 'string' ? data : undefined) || response.statusText || 'Request failed',
      response.status,
      response.statusText,
    );
  }

  return data as T;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
