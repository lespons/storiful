import { expect, test } from '@playwright/test';
import { PlaywrightBasePage } from './base-page';

test('Login succeed', async ({ page }) => {
  const playwrightDev = new PlaywrightBasePage(page);
  await page.goto('/');
  await playwrightDev.loginAsDefaultUser();

  const buttonDashboard = page.locator('button', { hasText: 'Dashboard' });

  // Expect a title "to contain" a substring.
  await expect(buttonDashboard).toHaveClass(/underline/);
});
