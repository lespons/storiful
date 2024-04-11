'use server';

import { auth } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';

export async function UserAppNav() {
  const session = await auth();

  return <AppNav username={session?.user?.email} />;
}
