import { test, expect, openPage } from './fixtures';

test('dropdown options have an opaque themed surface in light and dark mode', async ({ page }) => {
  await openPage(page, '/pos');
  const trigger = page.getByRole('combobox');
  for (const dark of [false, true]) {
    await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark);
    await trigger.click();
    const popup = page.locator('[data-slot="select-content"]');
    await expect(popup).toBeVisible();
    const background = await popup.evaluate(element => getComputedStyle(element).backgroundColor);
    expect(background, 'Options must not show page content through the popup').not.toBe('rgba(0, 0, 0, 0)');
    await page.keyboard.press('Escape');
  }
});

test('product edit shows the selected category name before the menu is opened', async ({ page }) => {
  await openPage(page, '/products/101');
  await expect(page.locator('input').first()).toHaveValue('UI-TEST-001');
  await expect(page.locator('[data-slot="select-value"]')).toHaveText('Engine parts');
});
