'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBagIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

export function ItemTypeElement(props: {
  name: string;
  type: string;
  id: string;
  index: number;
  childrenCount: number;
}) {
  const r = useRouter();
  const pathname = usePathname();
  return (
    <div
      className={`flex flex-row gap-3 px-4 py-1 rounded-md bg-white
      ${(pathname?.indexOf(props.id) ?? 0) > 0 ? 'ring-4' : 'hover:text-white cursor-pointer'}
      shadow-md  transition-transform duration-300 hover:bg-black hover:text-white
      `}
      onClick={() => r.replace(`/itemtype/${props.id}`)}>
      <div className={'font-semibold my-auto'}>
        {props.type === 'PRODUCT' ? (
          <WrenchScrewdriverIcon className={'size-5 text-fuchsia-600'} />
        ) : (
          <ShoppingBagIcon className={'size-5 text-blue-600'} />
        )}
      </div>
      <div className="flex-[2] font-bold">{props.name}</div>
      <div className="flex gap-1">
        {props.childrenCount ? (
          <div className={'my-auto  bg-gray-200/50 px-2 rounded-lg'}>{props.childrenCount}</div>
        ) : null}
      </div>
    </div>
  );
}
