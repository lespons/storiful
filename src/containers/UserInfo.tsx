'use server';

import { getServerUserInfo } from '@/lib/auth';

export async function UserInfo() {
  const userInfo = await getServerUserInfo();

  return <div className="absolute bottom-0">{userInfo?.email}</div>;
}
