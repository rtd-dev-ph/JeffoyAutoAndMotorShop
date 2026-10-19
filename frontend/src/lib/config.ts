/**
 * API base URL — reads from Vite env or falls back to the backend development server.
 * During development, Vite proxies API requests (see vite.config.ts), so we use
 * the relative path "/api". In production, set VITE_API_BASE_URL to the deployed backend.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const ENDPOINTS = {
  // Categories
  categories: () => '/api/categories',
  category: (id: number) => `/api/categories/${id}`,

  // Products
  products: () => '/api/products',
  productsAll: () => '/api/products/all',
  lowStock: () => '/api/products/low-stock',
  productSearch: (q: string) => `/api/products/search?q=${encodeURIComponent(q)}`,
  product: (id: number) => `/api/products/${id}`,
  productBySku: (sku: string) => `/api/products/sku/${encodeURIComponent(sku)}`,
  productDeactivate: (id: number) => `/api/products/${id}`,

  // Sales
  checkout: () => '/api/sales/checkout',
  sales: () => '/api/sales',
  sale: (id: number) => `/api/sales/${id}`,
  salesByDate: (date: string) => `/api/sales/date/${date}`,
  saleVoid: (id: number) => `/api/sales/${id}/void`,

  // Stock
  openingStock: (productId: number) => `/api/stock/${productId}/opening`,
  reorder: (productId: number) => `/api/stock/${productId}/reorder`,
  adjustStock: (productId: number) => `/api/stock/${productId}/adjust`,

  // Reports
  dailySales: (date?: string, includeVoided?: boolean) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (includeVoided) params.set('includeVoided', 'true');
    const query = params.toString();
    return `/api/reports/daily-sales${query ? `?${query}` : ''}`;
  },

  // Health
  healthDatabase: () => '/health/database',
} as const;
