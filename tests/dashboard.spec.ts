import { expect, test } from '@playwright/test';
import { PlaywrightBasePage } from './base-page';
import { PlaywrightItemTypePage } from './itemtype.page';
import { PlaywrightDashboardPage } from './dashboard.page';
import { addDays, formatDate } from 'date-fns';
import prisma from '@/lib/prisma';

test.describe('base orders flow', () => {
  test.beforeEach(async ({ page }) => {
    const playwrightDev = new PlaywrightBasePage(page);
    await playwrightDev.loginAsDefaultUser();
  });

  test.afterEach(async ({ page }) => {});

  test.afterAll(async () => {
    await prisma.orderItem.deleteMany({});
    await prisma.orderStatesHistory.deleteMany({});
    await prisma.order.deleteMany({});

    const idsToDelete = (
      await prisma.itemType.findMany({
        where: {
          name: {
            startsWith: 'order'
          }
        },
        select: {
          id: true
        }
      })
    ).map(({ id }) => id);
    await prisma.itemStock.deleteMany({
      where: {
        OR: [
          {
            itemTypeId: { in: idsToDelete }
          }
        ]
      }
    });
    await prisma.itemChild.deleteMany({
      where: {
        OR: [
          {
            itemTypeId: { in: idsToDelete }
          },
          {
            parentTypeId: { in: idsToDelete }
          }
        ]
      }
    });
    await prisma.itemType.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });
    await prisma.$executeRaw`ALTER SEQUENCE orders_num_seq RESTART WITH 1;`;
  });

  test('should create the order and display the correct data', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);
    await playwrightItemTypePage.createItemType({
      name: 'order1_item1',
      type: 'inventory'
    });

    await page.waitForTimeout(100);
    await page.goto('/');

    const dashboardPage = new PlaywrightDashboardPage(page);

    const orderDetails = 'detail#1';
    await dashboardPage.createOrder(orderDetails, 10, [{ name: 'order1_item1', value: 10 }]);

    const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
    await expect(orderCard.getByTestId('order_number')).toHaveText(/^#(\d+)/);
    await expect(orderCard).toBeVisible();

    await expect(orderCard.getByTestId('order_date')).toHaveText(
      formatDate(new Date(), 'dd MMM yyyy')
    );

    await expect(orderCard.getByTestId('order_new_label')).toBeVisible();
    await expect(orderCard.getByTestId('order_created_by')).toHaveText(
      'Created by ' + PlaywrightBasePage.BASE_USER_NAME
    );

    const orderItem1Div = orderCard.getByTestId('order_item_' + 'order1_item1');
    await expect(orderItem1Div.getByRole('checkbox')).toBeChecked({ checked: false });
    await expect(orderItem1Div.getByText('order1_item1')).toBeVisible();

    await expect(orderCard.getByTestId('order_details')).toHaveText(orderDetails);
    await expect(orderCard.getByTestId('order_deadline')).toHaveText(
      `${formatDate(addDays(new Date(), 10), 'dd MMM EE')}(in ${10} days)`
    );

    await orderCard.hover();
    await expect(orderCard.getByTestId('order_edit')).toBeVisible();
    await expect(orderCard.getByTestId('order_open')).toBeVisible();
  });

  test('should create the order and complete with stock changes', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order2_item1_child1',
      type: 'inventory'
    });
    await playwrightItemTypePage.createItemType({
      name: 'order2_item1',
      type: 'product',
      children: [{ name: 'order2_item1_child1', value: 10 }]
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const dashboardPage = new PlaywrightDashboardPage(page);
    const orderDetails = 'detail#2';
    await dashboardPage.createOrder(orderDetails, 10, [{ name: 'order2_item1', value: 20 }]);

    const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
    await expect(orderCard).toBeVisible();

    const itemStockSize = page
      .getByTestId('stock_view')
      .getByTestId(`itemtype_${'order2_item1'}`)
      .getByRole('contentinfo');
    await expect(itemStockSize).toHaveText('0');
    const itemChildStockSize = page
      .getByTestId('stock_view')
      .getByTestId(`itemtype_${'order2_item1_child1'}`)
      .getByRole('contentinfo');
    await expect(itemStockSize).toHaveText('0');
    await expect(itemChildStockSize).toHaveText('0(200)');

    const orderItem1Div = orderCard.getByTestId('order_item_' + 'order2_item1');
    await orderItem1Div.filter({ hasText: 'order2_item1' }).click();
    await page.waitForResponse(
      (response) => response.url().includes('/order/todo') && response.status() === 200
    );
    await expect(orderItem1Div.getByRole('checkbox')).toBeChecked({ checked: true });

    await expect(itemStockSize).toHaveText('20');

    await orderCard.hover();
    await orderCard.getByRole('button', { name: 'complete' }).click();

    await page.waitForResponse(
      (response) => response.url().includes('/order/todo') && response.status() === 200
    );

    const completedCard = await dashboardPage.getOrderCard('completed', orderDetails);
    await expect(completedCard).toBeVisible();

    await completedCard.hover();
    await completedCard.getByRole('button', { name: 'send' }).click({
      delay: 3000
    });

    const sentCard = await dashboardPage.getOrderCard('sent', orderDetails);
    await expect(sentCard).toBeVisible();

    await expect(itemStockSize).toHaveText('0');
    await expect(itemChildStockSize).toHaveText('-200');

    await page.waitForTimeout(100);
  });

  test('should complete an order and the order should not stay in column TODO after page refresh', async ({
    page
  }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order4_item1',
      type: 'inventory'
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const dashboardPage = new PlaywrightDashboardPage(page);
    const orderDetails = 'detail#4';
    await dashboardPage.createOrder(orderDetails, 12, [{ name: 'order4_item1', value: 120 }]);

    const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
    await expect(orderCard).toBeVisible();

    const orderItem1Div = orderCard.getByTestId('order_item_' + 'order4_item1');
    let responsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await orderItem1Div.filter({ hasText: 'order4_item1' }).click();
    await responsePromise;

    await orderCard.hover({ timeout: 1000 });

    responsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await orderCard.getByRole('button', { name: 'complete' }).click();
    await responsePromise;

    await page.reload();
    const completedCard = await dashboardPage.getOrderCard('todo', orderDetails);
    await expect(completedCard).toHaveCount(0);
  });

  test('should change initial value of item', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order5_item1_child1',
      type: 'inventory'
    });
    await playwrightItemTypePage.createItemType({
      name: 'order5_item1',
      type: 'product',
      children: [{ name: 'order5_item1_child1', value: 10 }]
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const dashboardPage = new PlaywrightDashboardPage(page);
    const orderDetails = 'detail#5';
    await dashboardPage.createOrder(orderDetails, 10, [{ name: 'order5_item1', value: 20 }]);

    const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
    await expect(orderCard).toBeVisible();

    const orderItem1Div = orderCard.getByTestId('order_item_' + 'order5_item1');
    await orderItem1Div.filter({ hasText: 'order5_item1' }).click();
    await page.waitForResponse(
      (response) => response.url().includes('/order/todo') && response.status() === 200
    );
    await expect(orderItem1Div.getByRole('checkbox')).toBeChecked({ checked: true });

    await orderCard.hover();

    const completeResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/order/todo') && response.status() === 200
    );
    await orderCard.getByRole('button', { name: 'complete' }).click();

    await completeResponsePromise;

    await page.reload();

    const completedCard = await dashboardPage.getOrderCard('completed', orderDetails);
    await expect(completedCard).toBeVisible();
    await completedCard.hover({ timeout: 1000 });

    await completedCard.getByTestId('order5_item1_edit').click();
    await completedCard
      .getByTestId('completed-item-edit-order5_item1')
      .getByTestId('newvalue')
      .fill('1');

    const changeValueResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await completedCard.getByTestId('completed-item-edit-order5_item1').getByRole('button').click();
    await changeValueResponsePromise;
    await expect(completedCard.filter({ hasText: '1/ 20' })).toBeVisible();
    await page.waitForTimeout(100);

    // await expect(completedCard.getByRole('button', { name: 'send' })).toBeDisabled();
  });

  test('should not create the order with no children and 0 values', async ({ page }) => {});
  test('should clone the order', async ({ page }) => {});
  test('should open the order', async ({ page }) => {});
  test('should see the messages about hidden order', async ({ page }) => {});

  test('should change stock from editor', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order_item_to_change',
      type: 'product'
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const itemStockView = page
      .getByTestId('stock_view')
      .getByTestId(`itemtype_${'order_item_to_change'}`);
    const itemStockSize = itemStockView.getByRole('contentinfo');
    await expect(itemStockSize).toHaveText('0');

    await itemStockView.click();

    const stockInput = itemStockView.locator("input[placeholder='stock change']");
    await stockInput.fill('10');

    const addButton = itemStockView.getByRole('button', { name: 'add' });
    let responsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await addButton.click();
    await responsePromise;
    await expect(itemStockSize).toHaveText('10');
    await page.waitForTimeout(100);
  });

  test('should set stock from editor', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order_item_to_set',
      type: 'product'
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const itemStockView = page
      .getByTestId('stock_view')
      .getByTestId(`itemtype_${'order_item_to_set'}`);
    const itemStockSize = itemStockView.getByRole('contentinfo');
    await expect(itemStockSize).toHaveText('0');

    await itemStockView.click();

    const stockInput = itemStockView.locator("input[placeholder='stock change']");
    await stockInput.fill('10');

    const setButton = itemStockView.getByRole('button', { name: 'set' });
    let responsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await setButton.click({ delay: 3000 });
    await responsePromise;
    await expect(itemStockSize).toHaveText('10');

    await stockInput.fill('130');
    responsePromise = page.waitForResponse(
      (response) => response.url().includes('/') && response.status() === 200
    );
    await setButton.click({ delay: 3000 });
    await responsePromise;
    await expect(itemStockSize).toHaveText('130');
  });

  test.skip('should calc how much stock will be used to produce the items in order', async ({
    page
  }) => {});
  test('should search in stock view', async ({ page }) => {});
});

// RUN in ONLY MODE
test.describe.skip('concurrency test', () => {
  test.setTimeout(1200_000);
  test.describe.configure({ mode: 'parallel' });
  test.beforeEach(async ({ page }) => {
    const playwrightDev = new PlaywrightBasePage(page);
    await playwrightDev.loginAsDefaultUser();
  });
  test('should create a lot of orders', async ({ page }) => {
    const playwrightItemTypePage = new PlaywrightItemTypePage(page);

    await playwrightItemTypePage.createItemType({
      name: 'order3_item1_child1',
      type: 'inventory'
    });
    await playwrightItemTypePage.createItemType({
      name: 'order3_item1',
      type: 'product',
      children: [{ name: 'order3_item1_child1', value: 2 }]
    });
    await page.waitForTimeout(100);
    await page.goto('/');

    const dashboardPage = new PlaywrightDashboardPage(page);
    for (let i = 0; i < 50; i++) {
      const orderDetails = 'pack_detail#' + i;
      await dashboardPage.createOrder(orderDetails, 10, [{ name: 'order3_item1', value: 20 }]);
      const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
      await expect(orderCard).toBeVisible();
    }

    await page.waitForTimeout(100);
  });

  test('should complete a lot of orders', async ({ page }) => {
    const dashboardPage = new PlaywrightDashboardPage(page);
    await page.waitForTimeout(3000);
    await page.reload();
    for (let i = 0; i < 50; i++) {
      const orderDetails = 'pack_detail#' + i;
      const orderCard = await dashboardPage.getOrderCard('todo', orderDetails);
      const orderItem1Div = orderCard.getByTestId('order_item_' + 'order3_item1');
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/') && response.status() === 200
      );
      await orderItem1Div.filter({ hasText: 'order3_item1' }).click();
      await responsePromise;
      await expect(orderItem1Div.getByRole('checkbox')).toBeChecked({ checked: true });

      await orderCard.hover({ timeout: 2000 });

      const completeResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/') && response.status() === 200
      );
      await orderCard.getByRole('button', { name: 'complete' }).click();

      await completeResponsePromise;
      await page.waitForTimeout(100);
      await page.reload();
    }
    await page.waitForTimeout(100);
  });

  test('should send a lot of orders', async ({ page }) => {
    const dashboardPage = new PlaywrightDashboardPage(page);
    await page.waitForTimeout(5000);
    await page.reload();
    for (let i = 0; i < 50; i++) {
      const orderDetails = 'pack_detail#' + i;
      const completedCard = await dashboardPage.getOrderCard('completed', orderDetails);
      await expect(completedCard).toBeVisible();

      await completedCard.hover({
        timeout: 1000
      });
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/') && response.status() === 200
      );
      await completedCard.getByRole('button', { name: 'send' }).click({ delay: 3000 });

      await responsePromise;
      await page.reload();
    }

    await page.waitForTimeout(100);
  });
});

// });

// test.describe('should change the states', async () => {});
