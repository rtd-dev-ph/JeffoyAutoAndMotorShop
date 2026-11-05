import { test, expect, openPage } from './fixtures';

test('restock selection displays the product name and SKU rather than its ID', async ({ page }) => {
  await openPage(page, '/stock/restock');
  await expect(page.locator('[data-slot="select-value"]')).toHaveText('Select product');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Brake pads (UI-TEST-002)', exact: true }).click();
  await expect(page.locator('[data-slot="select-value"]')).toHaveText('Brake pads (UI-TEST-002)');
});
