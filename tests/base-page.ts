import { type Locator, type Page } from '@playwright/test';

export class PlaywrightBasePage {
  static BASE_USER_EMAIL = 'test@test.com';
  static BASE_USER_NAME = 'test user';
  static BASE_USER_PASSWORD = 'test_password';
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly buttonLogin: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('#email');

    this.passwordInput = page.locator('#password');
    this.buttonLogin = page.getByRole('button', { name: 'Log in' });
  }

  async loginAsDefaultUser() {
    await this.page.goto('/login');
    await this.emailInput.fill(PlaywrightBasePage.BASE_USER_EMAIL);
    await this.passwordInput.fill(PlaywrightBasePage.BASE_USER_PASSWORD);

    await this.buttonLogin.click();
    await this.page.waitForURL('/');
  }
}
