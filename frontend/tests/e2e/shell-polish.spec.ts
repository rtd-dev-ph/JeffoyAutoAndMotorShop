import { test, expect, openPage } from './fixtures';

test('shell identifies the active section on list, detail, alias and receipt routes', async ({ page }) => {
  const targets = [
    { route: '/sales/301', section: '/sales' },
    { route: '/products', section: '/products' },
    { route: '/dashboard', section: '/' },
    { route: '/receipt', section: '/pos' },
  ];

  for (const { route, section } of targets) {
    await openPage(page, route);
    const navigation = page.getByRole('navigation');
    const activeLink = navigation.locator(`a[href="${section}"]`);
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
    const activeBackground = await activeLink.evaluate(element => getComputedStyle(element).backgroundColor);
    const inactiveBackground = await navigation.locator('a:not([aria-current])').first()
      .evaluate(element => getComputedStyle(element).backgroundColor);
    expect(activeBackground, 'The current section should also have a visible active treatment').not.toBe(inactiveBackground);
  }
});

for (const width of [375, 768, 1024]) {
  test(`shell menu is labeled, keyboard-dismissible and navigates at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await openPage(page, '/');
    const menuButton = page.getByRole('button', { name: 'Toggle menu' });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    const menuId = await menuButton.getAttribute('aria-controls');
    expect(menuId, 'The disclosure button should identify the navigation it controls').toBeTruthy();

    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(menu).toHaveAttribute('id', menuId!);
    await menu.getByRole('link', { name: 'Sales', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(menuButton).toBeFocused();

    await menuButton.click();
    await menu.getByRole('link', { name: 'Sales', exact: true }).click();
    await expect(page.getByText('Sales History', { exact: true })).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  });
}
