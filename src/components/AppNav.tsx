'use client';

import { usePathname } from 'next/navigation';

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`flex flex-row min-w-full place-content-center text-3xl pb-5 ${pathname === '/' ? 'underline underline-offset-8' : ''}`}>
        <a href="/">Home</a>
      </div>
      <div className="flex flex-row min-w-full font-light text-2xl">
        <div className="basis-1/3">
          <a href="/order">
            <button
              className={`min-w-full text-right p-3 bg-fuchsia-700 hover:bg-opacity-15 bg-opacity-5 ${pathname === '/order' ? 'underline underline-offset-8' : ''}`}>
              Orders
            </button>
          </a>
        </div>
        <div className="basis-1/3">
          <a href="/stock">
            <button
              className={`min-w-full p-3 bg-fuchsia-700  hover:bg-opacity-15 bg-opacity-5 ${pathname === '/stock' ? 'underline underline-offset-8' : ''}`}>
              Stock
            </button>
          </a>
        </div>
        <div className="basis-1/3">
          <a href="/itemtype">
            <button
              className={`min-w-full text-left p-3 bg-fuchsia-700 hover:bg-opacity-15 bg-opacity-5 ${pathname === '/itemtype' ? 'underline underline-offset-8' : ''}`}>
              Item types
            </button>
          </a>
        </div>
      </div>
    </>
  );
}
