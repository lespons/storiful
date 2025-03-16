'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  CalendarDaysIcon,
  HomeModernIcon,
  RectangleGroupIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';

export function AppNav({ username }: { username?: string | null }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className="absolute right-2 top-0 cursor-pointer text-gray-500 hover:text-black"
        title={'Logout'}
        aria-description={'logout'}
        onClick={() => signOut()}>
        {username}
      </div>
      <div className="flex w-fit gap-4 text-xl text-black/90">
        <div className="basis-1/3 rounded-md bg-gray-200 hover:bg-gray-300">
          <a href="/">
            <button
              className={`flex gap-2 px-3 ${['/', '/dashboard'].includes(pathname!) ? 'underline underline-offset-8' : ''}`}>
              <RectangleGroupIcon className={'my-auto size-6'} />
              Dashboard
            </button>
          </a>
        </div>
        <div className="basis-1/3 rounded-md bg-blue-100 hover:bg-blue-200">
          <a href="/order">
            <button
              className={`flex gap-2 px-3 ${pathname?.startsWith('/order') ? 'underline underline-offset-8' : ''}`}>
              <RectangleStackIcon className={'my-auto size-6'} />
              Orders
            </button>
          </a>
        </div>
        <div className="basis-1/3 rounded-md bg-amber-100 hover:bg-amber-200">
          <a href="/itemtype">
            <button
              className={`flex gap-2 px-3 ${pathname?.startsWith('/itemtype') ? 'underline underline-offset-8' : ''}`}>
              <HomeModernIcon className={'my-auto size-6'} />
              Warehouse
            </button>
          </a>
        </div>
        <div className="basis-1/3 rounded-md bg-green-100 hover:bg-green-200">
          <a href="/report">
            <button
              className={`flex gap-2 px-3 ${pathname?.startsWith('/report') ? 'underline underline-offset-8' : ''}`}>
              <CalendarDaysIcon className={'my-auto size-6'} />
              Reports
            </button>
          </a>
        </div>
      </div>
    </>
  );
}
