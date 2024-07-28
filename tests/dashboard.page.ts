import type { Page } from '@playwright/test';
import { formatDate } from 'date-fns';

export class PlaywrightDashboardPage {
  readonly page: Page;

  readonly locators;

  constructor(page: Page) {
    this.page = page;

    const openCreateOrderButton = page.getByRole('button', { name: 'create' }).first();

    const inputDeadline = page.getByRole('textbox', { name: 'Deadline Details' });

    const textareaDetails = page.locator("xpath=//*[@id='details']");

    const divOrderItemType = page.locator("xpath=//*[@id='orderItemType']");

    const itemTypeSelectButton = divOrderItemType.getByRole('button');

    this.locators = {
      openCreateOrderButton,
      inputDeadline,
      textareaDetails,
      itemTypeSelectButton,
      divOrderItemType
    };
  }

  async getOrderItem(name: string) {
    return this.page.getByTestId(`orderitem_${name}`);
  }

  getDeadline(daysOffset: number): string {
    const date = new Date();

    date.setDate(date.getDate() + daysOffset);
    return formatDate(date, 'yyyy-MM-dd');
  }

  async getOrderCard(type: 'completed' | 'todo' | 'sent', details: string) {
    return this.page.getByTestId(`${type}_order_${details}`);
  }

  async createOrder(
    orderDetails: string,
    deadlineOffset: number,
    items: Array<{ name: string; value: number }>
  ) {
    await this.locators.openCreateOrderButton.click();

    const deadline = this.getDeadline(deadlineOffset);
    await this.locators.inputDeadline.fill(deadline);
    await this.locators.textareaDetails.fill(orderDetails);

    for (const { name, value } of items) {
      await this.locators.divOrderItemType.getByTestId(name).click();
      const orderItem = await this.getOrderItem(name);
      const inputOrderItemsQuantity = orderItem.locator("xpath=//input[@type='number']");
      await inputOrderItemsQuantity.fill(String(value));
    }

    const buttonCreate = this.page.getByRole('button', { name: 'create' }).last();
    const responsePromise = this.page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await buttonCreate.click();
    await responsePromise;
    const buttonReset = this.page.getByRole('button', { name: 'reset' });
    await buttonReset.click();
    await this.locators.openCreateOrderButton.click();
    await this.page.waitForTimeout(100);
  }
}
