import { test as teardown } from '@playwright/test';
import prisma from '../src/lib/prisma';

teardown('delete database', async ({}) => {
  console.log('deleting test database...');
  await prisma.user.deleteMany({
    where: {}
  });
  // Delete the database
});
