import { test as setup } from '@playwright/test';
import bcrypt from 'bcrypt';
import prisma from '../src/lib/prisma';
import { PlaywrightBasePage } from './base-page';

setup('create new database data', async ({}) => {
  console.log('creating test data');

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(PlaywrightBasePage.BASE_USER_PASSWORD, salt);

  await prisma.user.create({
    data: {
      email: PlaywrightBasePage.BASE_USER_EMAIL,
      name: PlaywrightBasePage.BASE_USER_NAME,
      password
    }
  });
  // Initialize the database
});
