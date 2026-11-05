import { test, expect, openPage, products } from './fixtures';

test('pointer and keyboard highlight are visible in payment options', async ({ page }) => {
  await openPage(page, '/pos');
  await page.getByRole('combobox').click();
  const option = page.getByRole('option', { name: 'GCash', exact: true });
  await option.hover();
  await expect(option).toHaveAttribute('data-highlighted');
  const fill = await option.evaluate(e => getComputedStyle(e).backgroundColor);
  expect(fill).not.toBe('rgba(0, 0, 0, 0)');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-slot="select-value"]')).toHaveText('GCash');
});

test('long restock options wrap, fit the viewport, and scroll to the last option', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const name = 'Heavy duty replacement assembly with a long descriptive product name';
  const options = Array.from({ length: 60 }, (_, index) => ({ ...products[0], id: 1000 + index, name: `${name} ${index}`, sku: `LONG-${index}` }));
  await page.route('**/api/products', route => route.fulfill({ json: options }));
  await openPage(page, '/stock/restock');
  await page.getByRole('combobox').click();
  const popup = page.locator('[data-slot="select-content"]');
  await expect(popup).toBeVisible();
  const label = page.getByRole('option').first().locator('div').first();
  const fit = await label.evaluate(e => ({ client: e.clientWidth, scroll: e.scrollWidth, height: e.clientHeight }));
  expect(fit.scroll, 'Long option text must not be clipped horizontally').toBeLessThanOrEqual(fit.client + 1);
  expect(fit.height, 'Long labels should wrap to multiple lines').toBeGreaterThan(30);
  const bounds = await popup.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(667);
  await page.keyboard.press('End');
  await expect(page.getByRole('option').last()).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-slot="select-value"]')).toContainText('LONG-59');
});
