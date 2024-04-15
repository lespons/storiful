'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function ItemTypeElement(props: { name: string; type: string; id: string }) {
  const r = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // console.log(pathname, searchParams);
  return (
    <div
      className={`flex flex-row gap-5 ${(pathname?.indexOf(props.id) ?? 0) > 0 ? 'text-fuchsia-800 underline' : 'hover:text-white cursor-pointer'}`}
      onClick={() => r.replace(`/itemtype/${props.id}`)}>
      <div className="flex-[2] font-bold">{props.name}</div>
      <div className="flex-1">{props.type.toLowerCase()}</div>
      <div className="font-extralight w-60">{props.id}</div>
    </div>
  );
}
