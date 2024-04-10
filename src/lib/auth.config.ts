import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async session({ session, user, token }) {
      return session;
    },
    authorized({ auth, request: { nextUrl }, ...rest }) {
      const isLoggedIn = !!auth?.user;
      const isLogin = nextUrl.pathname.startsWith('/login');
      if (isLoggedIn) {
        if (isLogin) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      return false; // Redirect unauthenticated users to login page
    }
  },
  providers: [] // Add providers with an empty array for now
} satisfies NextAuthConfig;
