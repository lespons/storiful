'use server';

import { getToken, GetTokenParams } from 'next-auth/jwt';
import { headers } from 'next/headers';

export const getServerUserInfo = async () => {
  const header = headers();
  const userInfo = await getServerAuthToken({ headers: header });
  return userInfo;
};

export const getServerAuthToken = async (req: GetTokenParams['req']) => {
  return await getToken({
    req: req,
    cookieName: 'authjs.session-token',
    secret: process.env.AUTH_SECRET!
  } as GetTokenParams);
};
