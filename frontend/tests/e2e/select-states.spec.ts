import { test, expect, openPage, categories } from './fixtures';

for (const field of [
  { route: '/products/new', label: 'Category', placeholder: 'Select category' },
  { route: '/products/101', label: 'Category', placeholder: 'Engine parts' },
  { route: '/stock/restock', label: 'Product', placeholder: 'Select product' },
  { route: '/pos', label: 'Payment Method', placeholder: 'Cash' },
]) {
  test(`${field.route} dropdown has an accessible field label`, async ({ page }) => {
    await openPage(page, field.route);
    const select = page.getByRole('combobox');
    await expect(select).toHaveAccessibleName(field.label);
    await expect(select).toHaveText(field.placeholder);
    await page.getByText(field.label, { exact: true }).click();
    await expect(select).toBeFocused();
  });
}

for (const form of [
  { route: '/products/new', endpoint: 'categories', noun: 'categories', action: 'Save' },
  { route: '/stock/restock', endpoint: 'products', noun: 'products', action: 'Restock' },
]) {
  test(`${form.route} prevents blank options during loading and explains an empty list`, async ({ page, api }) => {
    let release!: () => void;
    const ready = new Promise<void>(resolve => { release = resolve; });
    await page.route(`**/api/${form.endpoint}`, async route => {
      await ready;
      await route.fulfill({ json: [] });
    });
    await openPage(page, form.route);
    await expect(page.getByRole('combobox')).toBeDisabled();
    await expect(page.getByRole('combobox')).toContainText(`Loading ${form.noun}`);
    await expect(page.getByRole('button', { name: form.action, exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole('combobox')).toContainText(`No ${form.noun} available`);
    await expect(page.getByRole('combobox')).toBeDisabled();
    await expect(page.getByText(`Create a ${form.noun === 'categories' ? 'category' : 'product'} first`, { exact: false })).toBeVisible();
    expect(api.writes).toEqual([]);
  });

  test(`${form.route} distinguishes failed options from empty data and can retry`, async ({ page, api }) => {
    let fail = true;
    await page.route(`**/api/${form.endpoint}`, async route => {
      if (fail) await route.fulfill({ status: 503, json: { detail: 'Options service unavailable' } });
      else await route.fallback();
    });
    await openPage(page, form.route);
    await expect(page.getByRole('alert')).toContainText(`Could not load ${form.noun}`);
    await expect(page.getByRole('combobox')).toBeDisabled();
    await expect(page.getByRole('button', { name: form.action, exact: true })).toBeDisabled();
    fail = false;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('combobox')).toBeEnabled();
    await page.getByRole('combobox').click();
    await expect(page.getByRole('option')).toHaveCount(2);
    expect(api.writes).toEqual([]);
  });
}

test('product edit waits for category labels without briefly showing an ID', async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/categories', async route => {
    await ready;
    await route.fulfill({ json: categories });
  });
  await openPage(page, '/products/101');
  await expect(page.locator('input').first()).toHaveValue('UI-TEST-001');
  await expect(page.getByRole('combobox')).toBeDisabled();
  await expect(page.getByRole('combobox')).toContainText('Loading categories');
  release();
  await expect(page.getByRole('combobox')).toHaveText('Engine parts');
});

test('product edit prevents saving an unavailable category until a valid one is selected', async ({ page, api }) => {
  await page.route('**/api/categories', route => route.fulfill({ json: [categories[1]] }));
  await openPage(page, '/products/101');
  await expect(page.getByRole('combobox')).toHaveText('Select category');
  await expect(page.getByRole('alert')).toContainText('category is no longer available');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(api.writes).toEqual([]);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Oils and lubricants', exact: true }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
