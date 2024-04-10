import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import * as Yup from 'yup';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { getToken, GetTokenParams } from 'next-auth/jwt';
import { headers } from 'next/headers';

export const getServerUserInfo = async () => {
  'use server';
  const header = headers();
  const userInfo = await getServerAuthToken({ headers: header });
  return userInfo;
};

export const getServerAuthToken = async (req: GetTokenParams['req']) => {
  'use server';
  return await getToken({
    req: req,
    cookieName: 'authjs.session-token',
    secret: process.env.AUTH_SECRET!
  } as GetTokenParams);
};

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = Yup.object({
          email: Yup.string().email(),
          password: Yup.string().min(6)
        }).validateSync(credentials);

        const user = await prisma.user.findUniqueOrThrow({
          where: {
            email: parsedCredentials.email
          }
        });

        const passwordMatch = await bcrypt.compare(parsedCredentials.password!, user.password);

        if (!passwordMatch) {
          throw new Error('Incorrect password');
        }
        return user;
      }
    })
  ]
});
