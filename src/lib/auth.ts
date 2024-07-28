import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import * as Yup from 'yup';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST }
} = NextAuth({
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
