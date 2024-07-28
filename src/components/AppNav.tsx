'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  HomeModernIcon,
  RectangleGroupIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';

export function AppNav({ username }: { username?: string | null }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className="absolute right-2 top-0 text-gray-500 cursor-pointer hover:text-black"
        title={'Logout'}
        aria-description={'logout'}
        onClick={() => signOut()}>
        {username}
      </div>
      <div className="flex gap-4 w-fit text-xl text-black/90">
        <div className="basis-1/3 bg-gray-200  hover:bg-gray-300 rounded-md">
          <a href="/">
            <button
              className={`flex gap-2 px-3 ${['/', '/dashboard'].includes(pathname!) ? 'underline underline-offset-8' : ''}`}>
              <RectangleGroupIcon className={'size-6 my-auto'} />
              Dashboard
            </button>
          </a>
        </div>
        <div className="basis-1/3 bg-blue-100  hover:bg-blue-200 rounded-md">
          <a href="/order">
            <button
              className={`flex gap-2 px-3 ${pathname?.startsWith('/order') ? 'underline underline-offset-8' : ''}`}>
              <RectangleStackIcon className={'size-6 my-auto'} />
              Orders
            </button>
          </a>
        </div>
        <div className="basis-1/3 bg-amber-100 hover:bg-amber-200 rounded-md">
          <a href="/itemtype">
            <button
              className={`flex gap-2 px-3 ${pathname?.startsWith('/itemtype') ? 'underline underline-offset-8' : ''}`}>
              <HomeModernIcon className={'size-6 my-auto'} />
              Warehouse
            </button>
          </a>
        </div>
      </div>
    </>
  );
}
