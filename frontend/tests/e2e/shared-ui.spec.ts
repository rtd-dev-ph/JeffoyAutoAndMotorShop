import { test, expect, openPage } from './fixtures';

test('shared controls are readable, comfortably sized, and separated from the page', async ({ page }) => {
  await openPage(page, '/products/new');
  const input = page.locator('[data-slot="input"]').first();
  const button = page.getByRole('button', { name: 'Save', exact: true });
  const select = page.getByRole('combobox');
  for (const control of [input, button, select]) {
    const bounds = await control.boundingBox();
    expect(bounds!.height, 'Primary form controls should have at least 40px target height').toBeGreaterThanOrEqual(40);
  }
  const surface = await page.locator('[data-slot="card"]').evaluate(e => getComputedStyle(e).backgroundColor);
  const canvas = await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor);
  expect(surface, 'Cards should stand apart from the page canvas').not.toBe(canvas);
});
