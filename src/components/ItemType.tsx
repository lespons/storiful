'use client';

import { usePathname, useRouter } from 'next/navigation';

export function ItemTypeElement(props: { name: string; type: string; id: string }) {
  const r = useRouter();
  const pathname = usePathname();
  return (
    <div
      className={`flex flex-row gap-5 px-4 py-2 rounded-md ${(pathname?.indexOf(props.id) ?? 0) > 0 ? 'text-fuchsia-800 underline' : 'hover:text-white cursor-pointer'}
      shadow-md  transition-transform duration-300 hover:bg-black hover:text-white hover:scale-105
      `}
      onClick={() => r.replace(`/itemtype/${props.id}`)}>
      <div className="flex-[2] font-bold">{props.name}</div>
      <div className="flex-1">{props.type.toLowerCase()}</div>
      <div className="font-extralight w-60">{props.id}</div>
    </div>
  );
}
