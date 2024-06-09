// import { expect, test } from '@playwright/test';
// import { PlaywrightBasePage } from './base-page';
// import { PlaywrightItemTypePage } from './itemtype.page';
//
// test.describe.serial('item type flows ', () => {
//   test('basic item type flow', async ({ page }) => {
//     const playwrightDev = new PlaywrightBasePage(page);
//     const playwrightItemTypePage = new PlaywrightItemTypePage(page);
//
//     await test.step('log in', async () => {
//       await page.goto('/');
//       await playwrightDev.loginAsDefaultUser();
//     });
//
//     await test.step('create', async () => {
//       await playwrightItemTypePage.createItemType({
//         name: 'test item1',
//         type: 'product',
//         unit: 'centimeter (cm)'
//       });
//
//       await playwrightItemTypePage.openItemType('test item1');
//
//       await expect(playwrightItemTypePage.locators.inputName).toHaveValue('test item1');
//       await expect(playwrightItemTypePage.locators.radioProduct).toHaveAttribute(
//         'aria-checked',
//         'true'
//       );
//       await expect(playwrightItemTypePage.locators.divItemTypeUnit.locator('input')).toHaveValue(
//         'centimeter  (cm)'
//       );
//     });
//
//     await test.step('edit', async () => {
//       await playwrightItemTypePage.editItemType({
//         name: 'test item1',
//         newName: 'test item1 CHANGED',
//         unit: 'meter  (m)',
//         type: 'product'
//       });
//       await page.reload({});
//
//       await expect(playwrightItemTypePage.locators.inputName).toHaveValue('test item1 CHANGED');
//       await expect(playwrightItemTypePage.locators.divItemTypeUnit.locator('input')).toHaveValue(
//         'meter  (m)'
//       );
//     });
//
//     await test.step('delete', async () => {
//       await playwrightItemTypePage.deleteItemType('test item1 CHANGED');
//       const newDivTestItem2 = page
//         .locator("xpath=//div[contains(@class, 'max-w-[45vw]')]")
//         .getByText('test item1 CHANGED');
//       await expect(newDivTestItem2).toHaveCount(0);
//     });
//   });
//
//   test('item type flow with children', async ({ page }) => {
//     const playwrightDev = new PlaywrightBasePage(page);
//     const playwrightItemTypePage = new PlaywrightItemTypePage(page);
//
//     await test.step('log in', async () => {
//       await page.goto('/');
//       await playwrightDev.loginAsDefaultUser();
//     });
//
//     await test.step('create', async () => {
//       await playwrightItemTypePage.createItemType({
//         name: 'child1',
//         type: 'inventory'
//       });
//       await playwrightItemTypePage.createItemType({
//         name: 'child2',
//         type: 'inventory'
//       });
//       await playwrightItemTypePage.createItemType({
//         name: 'parent1_child1',
//         type: 'inventory'
//       });
//       await playwrightItemTypePage.createItemType({
//         name: 'parent1',
//         type: 'product',
//         children: [{ name: 'parent1_child1', value: 1 }]
//       });
//
//       await playwrightItemTypePage.createItemType({
//         name: 'root_parent',
//         type: 'product',
//         children: [
//           { name: 'child1', value: 1 },
//           { name: 'child2', value: 10 },
//           { name: 'parent1', value: 20 }
//         ]
//       });
//       await playwrightItemTypePage.openItemType('root_parent');
//
//       expect(await (await playwrightItemTypePage.getChildInput('parent1')).inputValue()).toBe('20');
//       expect(await (await playwrightItemTypePage.getChildInput('child1')).inputValue()).toBe('1');
//       expect(await (await playwrightItemTypePage.getChildInput('child2')).inputValue()).toBe('10');
//     });
//
//     await test.step('edit/ delete child1 from parent and update child2', async () => {
//       await playwrightItemTypePage.editItemType({
//         name: 'root_parent',
//         childrenToDelete: [{ name: 'child1', value: 0 }],
//         childrenToChange: [{ name: 'child2', value: 90 }]
//       });
//       await page.reload({});
//       await expect(playwrightItemTypePage.page.getByText(`- child1`)).toHaveCount(0);
//       expect(await (await playwrightItemTypePage.getChildInput('child2')).inputValue()).toBe('90');
//     });
//
//     await test.step('edit/ add child1 again', async () => {
//       await playwrightItemTypePage.editItemType({
//         name: 'root_parent',
//         childrenToAdd: [{ name: 'child1', value: 30 }]
//       });
//       await page.reload({});
//       expect(await (await playwrightItemTypePage.getChildInput('child1')).inputValue()).toBe('30');
//     });
//
//     await test.step('delete parent1 and check if it is deleted from root_parent', async () => {
//       await playwrightItemTypePage.deleteItemType('parent1');
//       await playwrightItemTypePage.openItemType('root_parent');
//       await expect(playwrightItemTypePage.page.getByText(`- parent1`)).toHaveCount(0);
//     });
//
//     await test.step('clone root_parent', async () => {
//       await playwrightItemTypePage.openItemType('root_parent');
//       await playwrightItemTypePage.locators.buttonCreateNew.click({
//         delay: 3000
//       });
//       await playwrightItemTypePage.openItemType('CLONED FROM root_parent');
//       expect(await (await playwrightItemTypePage.getChildInput('child1')).inputValue()).toBe('30');
//       expect(await (await playwrightItemTypePage.getChildInput('child2')).inputValue()).toBe('90');
//       await expect(playwrightItemTypePage.locators.inputName).toHaveValue(
//         'CLONED FROM root_parent'
//       );
//       await expect(playwrightItemTypePage.locators.radioProduct).toHaveAttribute(
//         'aria-checked',
//         'true'
//       );
//       await playwrightItemTypePage.deleteItemType('CLONED FROM root_parent');
//     });
//
//     await test.step('delete', async () => {
//       await playwrightItemTypePage.deleteItemType('child1');
//       await playwrightItemTypePage.deleteItemType('child2');
//       await playwrightItemTypePage.deleteItemType('parent1_child1');
//       await playwrightItemTypePage.deleteItemType('root_parent');
//     });
//   });
// });
