import { test, expect, openPage } from './fixtures';

test('product Save opens confirmation and saves the selected category exactly once', async ({ page, api }) => {
  await openPage(page, '/products/101');
  await expect(page.locator('input').first()).toHaveValue('UI-TEST-001');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(api.writes).toEqual([]);
  await dialog.getByRole('button', { name: 'Update Product', exact: true }).click();
  await expect(page.getByText('Products', { exact: true }).last()).toBeVisible();
  expect(api.writes).toHaveLength(1);
  expect(api.writes[0]).toMatchObject({ method: 'PUT', path: '/api/products/101', body: { categoryId: 21 } });
});
