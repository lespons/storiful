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
      className={`flex flex-row gap-4 px-4 py-1 rounded-md 
      ${props.index % 2 === 0 ? 'bg-amber-200' : 'bg-white/30'}
      ${(pathname?.indexOf(props.id) ?? 0) > 0 ? 'ring-4' : 'hover:text-white cursor-pointer'}
      shadow-md  transition-transform duration-300 hover:bg-black hover:text-white
      `}
      onClick={() => r.replace(`/itemtype/${props.id}`)}>
      <div className="flex-[2] font-bold">{props.name}</div>
      <div className="flex gap-1">
        <div className={'font-semibold my-auto'}>
          {props.type === 'PRODUCT' ? (
            <WrenchScrewdriverIcon className={'size-5'} />
          ) : (
            <ShoppingBagIcon className={'size-5'} />
          )}
        </div>
        {props.childrenCount ? <div className={'my-auto'}>({props.childrenCount})</div> : null}
      </div>

      {/*<div className="font-extralight w-60">{props.id}</div>*/}
    </div>
  );
}
