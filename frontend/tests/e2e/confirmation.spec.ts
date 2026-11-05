import { test, expect, openPage } from './fixtures';

test('category confirmation Cancel closes without saving and preserves input', async ({ page, api }) => {
  await openPage(page, '/categories/new');
  await page.locator('input').first().fill('UI regression category');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('input').first()).toHaveValue('UI regression category');
  expect(api.writes).toEqual([]);
});
