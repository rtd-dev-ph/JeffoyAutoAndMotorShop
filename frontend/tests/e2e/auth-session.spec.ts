import { test, expect } from '@playwright/test';

function makeJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.sig`;
}

test('restored session keeps the authenticated username and role after refresh', async ({ page }) => {
  const token = makeJwt({
    sub: '7',
    unique_name: 'admin',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Owner',
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: 'refresh-test',
  });

  await page.addInitScript((value) => {
    window.localStorage.setItem('jaams_token', value);
  }, token);
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/categories' || path === '/api/categories/all') {
      await route.fulfill({ status: 200, json: [] });
      return;
    }
    if (path === '/api/products' || path === '/api/products/all') {
      await route.fulfill({ status: 200, json: [] });
      return;
    }
    if (path.startsWith('/api/reports/daily-sales')) {
      await route.fulfill({ status: 200, json: { date: '2026-01-15', transactionCount: 0, totalItemsSold: 0, totalSales: 0, cashTotal: 0, gCashTotal: 0, sales: [] } });
      return;
    }
    if (path === '/api/sales') {
      await route.fulfill({ status: 200, json: [] });
      return;
    }
    await route.fulfill({ status: 200, json: {} });
  });

  await page.goto('/');
  await expect(page.getByRole('button', { name: /Logout \(admin\)/ })).toBeVisible();
  await expect(page.getByText('Logout (user)')).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('button', { name: /Logout \(admin\)/ })).toBeVisible();
  await expect(page.getByText('Logout (user)')).toHaveCount(0);
});
