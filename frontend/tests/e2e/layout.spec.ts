import { test, expect, openPage, receipt } from './fixtures';

export const pages = [
  { route: '/', name: 'DashboardPage', title: 'Dashboard' },
  { route: '/dashboard', name: 'DashboardPage alias', title: 'Dashboard' },
  { route: '/pos', name: 'POSPage', title: 'Point of Sale' },
  { route: '/products', name: 'ProductsPage', title: 'Products' },
  { route: '/products/new', name: 'ProductFormPage create', title: 'Create Product' },
  { route: '/products/101', name: 'ProductFormPage edit', title: 'Edit Product' },
  { route: '/categories', name: 'CategoriesPage', title: 'Categories' },
  { route: '/categories/new', name: 'CategoryFormPage create', title: 'Create Category' },
  { route: '/categories/21', name: 'CategoryFormPage edit', title: 'Edit Category' },
  { route: '/sales', name: 'SalesPage', title: 'Sales History' },
  { route: '/sales/301', name: 'SaleDetailPage', title: 'Sale UI-TEST-SALE-001' },
  { route: '/stock', name: 'StockPage', title: 'Stock Movements' },
  { route: '/stock/restock', name: 'RestockPage', title: 'Restock Product' },
  { route: '/reports', name: 'ReportsPage', title: 'Sales Reports' },
  { route: '/receipt', name: 'ReceiptPage empty', title: 'Receipt' },
  { route: '/receipt', name: 'ReceiptPage populated', title: 'Receipt', state: { receipt } },
  { route: '/login', name: 'LoginPage', title: 'Login' },
];

for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
  for (const target of pages) {
    test(`${target.name} stays within ${viewport.width}px viewport`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await openPage(page, target.route, target.state);
      await expect(page.getByText(target.title, { exact: true }).last()).toBeVisible();
      if (target.route === '/reports') {
        await page.getByRole('button', { name: 'Load Report' }).click();
        await page.getByRole('button', { name: 'Show Preview' }).click();
        await expect(page.getByText('Print Preview', { exact: true })).toBeVisible();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${target.name} must not scroll the entire document sideways`).toBeLessThanOrEqual(1);
      const clipped = await page.locator('input:not([aria-hidden="true"]),button').evaluateAll(elements => elements
        .filter(element => element.getBoundingClientRect().width > 0)
        .filter(element => !element.closest('[data-slot="table-container"]'))
        .map(element => ({ text: element.textContent, bounds: element.getBoundingClientRect().toJSON() }))
        .filter(({ bounds }) => bounds.x < -1 || bounds.right > window.innerWidth + 1));
      expect(clipped, 'Form actions and controls must be reachable without horizontal scroll').toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
