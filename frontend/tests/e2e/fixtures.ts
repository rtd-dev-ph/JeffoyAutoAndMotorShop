import { test as base, expect, type Page } from '@playwright/test';

// Explicit synthetic fixtures. No credentials or live database writes are used.
export const categories = [
  { id: 21, name: 'Engine parts', description: 'Engine maintenance', isActive: true },
  { id: 22, name: 'Oils and lubricants', description: null, isActive: true },
];
export const products = [{
  id: 101, sku: 'UI-TEST-001', name: 'Oil filter', description: 'UI test fixture',
  categoryId: 21, categoryName: 'Engine parts', costPrice: 80, sellingPrice: 120,
  stockQuantity: 10, lowStockThreshold: 5, isLowStock: false, isActive: true,
  createdAtUtc: '2026-01-15T02:00:00Z', updatedAtUtc: '2026-01-15T02:00:00Z',
}, {
  id: 102, sku: 'UI-TEST-002', name: 'Brake pads', description: null,
  categoryId: 22, categoryName: 'Oils and lubricants', costPrice: 150, sellingPrice: 250,
  stockQuantity: 3, lowStockThreshold: 5, isLowStock: true, isActive: true,
  createdAtUtc: '2026-01-15T02:00:00Z', updatedAtUtc: '2026-01-15T02:00:00Z',
}];
export const sale = {
  id: 301, saleNumber: 'UI-TEST-SALE-001', grandTotal: 120, paymentMethod: 'Cash',
  status: 'Completed', createdAtUtc: '2026-01-15T02:30:00Z', voidedAtUtc: null, voidReason: null,
  items: [{ productId: 101, productSKU: 'UI-TEST-001', productName: 'Oil filter',
    quantity: 1, unitPrice: 120, unitCost: 80, lineTotal: 120 }],
};
export const receipt = { ...sale, saleId: sale.id };
export const report = { date: '2026-01-15', transactionCount: 1, totalItemsSold: 1,
  totalSales: 120, cashTotal: 120, gCashTotal: 0, sales: [sale] };
export const movements = [{ id: 401, productId: 101, productName: 'Oil filter',
  productSKU: 'UI-TEST-001', movementType: 'Restock', quantityChange: 10,
  resultingStockQuantity: 10, saleId: null, reference: 'UI test delivery',
  createdAtUtc: '2026-01-15T02:00:00Z' }];

export async function openPage(page: Page, route: string, state?: unknown) {
  const query = new URLSearchParams({ route });
  if (state) query.set('state', JSON.stringify(state));
  await page.goto(`/tests/harness.html?${query}`);
  await expect(page.locator('#root')).not.toBeEmpty();
}

export const test = base.extend<{ api: { writes: { method: string; path: string; body: unknown }[] } }>({
  api: [async ({ page }, use) => {
    const writes: { method: string; path: string; body: unknown }[] = [];
    await page.route('**/api/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() !== 'GET') {
        writes.push({ method: request.method(), path, body: request.postDataJSON() });
        await route.fulfill({ status: 200, json: path.endsWith('/checkout') ? receipt : {} });
        return;
      }
      let data: unknown;
      if (/^\/api\/categories(?:\/all)?$/.test(path)) data = categories;
      else if (/^\/api\/categories\/\d+$/.test(path)) data = categories.find(c => c.id === Number(path.split('/').at(-1)));
      else if (/^\/api\/products(?:\/all)?$/.test(path)) data = products;
      else if (/^\/api\/products\/\d+$/.test(path)) data = products.find(p => p.id === Number(path.split('/').at(-1)));
      else if (path === '/api/sales') data = [sale];
      else if (path === '/api/sales/301') data = sale;
      else if (path === '/api/reports/daily-sales') data = report;
      else if (path === '/api/stockmovements/all') data = movements;
      else {
        await route.fulfill({ status: 404, json: { detail: `No UI fixture for ${path}` } });
        return;
      }
      await route.fulfill({ status: data ? 200 : 404, json: data ?? { detail: 'Not found' } });
    });
    await use({ writes });
  }, { auto: true }],
});
export { expect };
