import { expect, type Page } from '@playwright/test';

export class PlaywrightItemTypePage {
  readonly page: Page;

  readonly locators;
  constructor(page: Page) {
    this.page = page;

    const inputName = page.locator('#name');

    const radioInventory = page.getByRole('radio', { name: 'inventory' });
    const radioProduct = page.getByRole('radio', { name: 'product' });

    const divItemTypeUnit = page.locator('#itemTypeUnit');

    const divItemTypeChild = page.locator('#itemTypeChild');

    const buttonCreate = page.getByRole('button', { name: 'create' });
    const buttonUpdate = page.getByRole('button', { name: 'update' });

    const buttonClose = this.page.getByRole('button', { name: 'close' });

    const buttonCreateNew = page.getByRole('button', { name: 'create as new' });

    this.locators = {
      inputName,
      radioInventory,
      radioProduct,
      divItemTypeUnit,
      divItemTypeChild,
      buttonCreate,
      buttonUpdate,
      buttonClose,
      buttonCreateNew
    };
  }

  async goToItemType() {
    await this.page.goto('/itemtype');
  }

  async openItemType(name: string) {
    const parent1 = this.page
      .locator("xpath=//div[contains(@class, 'max-w-[45vw]')]")
      .getByText(name, { exact: true })
      .first();

    await expect(parent1).toBeVisible();

    await parent1.click();

    await expect(this.locators.buttonClose).toBeVisible();
  }

  async getChildInput(name: string) {
    const labelParentChild = this.page.getByText(`- ${name}`);
    const inputId = await labelParentChild.getAttribute('for');

    return this.page.locator(`input#${inputId}`);
  }
  async getChildDelete(name: string) {
    const labelParentChild = this.page.getByText(`- ${name}`);
    const inputId = await labelParentChild.getAttribute('for');

    return this.page.locator(`input#${inputId} + button`);
  }

  async createItemType({
    name,
    type,
    unit,
    children
  }: {
    name: string;
    type: 'product' | 'inventory';
    unit?: string;
    children?: Array<{ name: string; value: number }>;
  }) {
    await this.goToItemType();

    await this.locators.inputName.fill(name);
    if (type === 'product') {
      await this.locators.radioProduct.click();
    } else {
      await this.locators.radioInventory.click();
    }

    if (unit) {
      await this.locators.divItemTypeUnit.getByRole('button').click();
      await this.locators.divItemTypeUnit.getByRole('option', { name: unit }).click();
    }
    if (children?.length) {
      for (const { name: chName, value: chValue } of children) {
        await this.locators.divItemTypeChild.getByRole('button').click();
        await this.locators.divItemTypeChild
          .getByRole('option', { name: chName, exact: true })
          .click();

        await (await this.getChildInput(chName)).fill(String(chValue));
      }
    }

    await this.locators.buttonCreate.click();

    const divTestItem2 = this.page
      .locator("xpath=//div[contains(@class, 'max-w-[45vw]')]")
      .getByText(name)
      .first();

    await expect(divTestItem2).toBeVisible();
  }

  async editItemType({
    name,
    newName,
    type,
    unit,
    childrenToAdd,
    childrenToChange,
    childrenToDelete
  }: {
    name: string;
    newName?: string;
    type?: 'product' | 'inventory';
    unit?: string;
    childrenToAdd?: Array<{ name: string; value: number }>;
    childrenToDelete?: Array<{ name: string; value: number }>;
    childrenToChange?: Array<{ name: string; value: number }>;
  }) {
    await this.goToItemType();

    await this.openItemType(name);

    await this.locators.inputName.fill(newName ?? name, { force: true });

    if (type) {
      if (type === 'product') {
        await this.locators.radioProduct.click();
      } else {
        await this.locators.radioInventory.click();
      }
    }

    if (unit) {
      await this.locators.divItemTypeUnit.getByRole('button').click();
      await this.locators.divItemTypeUnit.getByRole('option', { name: unit }).click();
    }

    if (childrenToAdd?.length) {
      for (const { name: chName, value: chValue } of childrenToAdd) {
        await this.locators.divItemTypeChild.getByRole('button').click();
        await this.locators.divItemTypeChild
          .getByRole('option', { name: chName, exact: true })
          .click();

        await (await this.getChildInput(chName)).fill(String(chValue));
      }
    }

    if (childrenToChange?.length) {
      for (const { name: chName, value: chValue } of childrenToChange) {
        await (await this.getChildInput(chName)).fill(String(chValue));
      }
    }

    if (childrenToDelete?.length) {
      for (const { name: chName, value: chValue } of childrenToDelete) {
        await (await this.getChildDelete(chName)).click();
      }
    }

    await this.locators.buttonUpdate.click();
    await this.page.waitForResponse(
      (response) => response.url().includes('/itemtype') && response.status() === 200
    );
  }

  async deleteItemType(name: string) {
    await this.goToItemType();

    const divTestItem2 = this.page
      .locator("xpath=//div[contains(@class, 'max-w-[45vw]')]")
      .getByText(name, {
        exact: true
      });

    await expect(divTestItem2).toBeVisible();

    await divTestItem2.click();

    const buttonDelete = this.page.getByRole('button', { name: 'delete' });
    await buttonDelete.click({
      delay: 3001
    });
    await this.page.waitForURL('/itemtype');
  }
}
