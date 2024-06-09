import { test as teardown } from '@playwright/test';
import prisma from '../src/lib/prisma';

teardown('delete database', async ({}) => {
  console.log('deleting test database...');
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatesHistory.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.itemStock.deleteMany({});
  await prisma.itemChild.deleteMany({});
  await prisma.itemType.deleteMany({});
  await prisma.$executeRaw`ALTER SEQUENCE orders_num_seq RESTART WITH 1;`;

  await prisma.user.deleteMany({
    where: {}
  });
  // Delete the database
});
