'use server';

import { getServerUserInfo, signOut } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';

export async function UserAppNav() {
  const userInfo = await getServerUserInfo();

  return (
    <AppNav
      username={userInfo?.email}
      logout={async () => {
        'use server';
        try {
          await signOut();
        } catch (e) {
          if (isRedirectError(e)) {
            throw e;
          }
        } finally {
          setTimeout(() => {
            redirect('/login');
          });
        }
      }}
    />
  );
}
