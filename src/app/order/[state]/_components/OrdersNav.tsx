'use client';

import { Tab } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { BriefcaseIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/solid';

export default function OrdersNav({ className }: { className: string }) {
  const router = useRouter();
  // todo use array params to render
  return (
    <>
      <Tab
        className={`${className} flex gap-1 text-violet-800 data-[selected]:bg-violet-500/10 hover:bg-violet-800/10`}
        onClick={() => {
          router.push(`/order/created`);
        }}>
        <BriefcaseIcon className="size-5 my-auto" />
        todo
      </Tab>
      <Tab
        className={`${className} flex gap-1 text-green-800 data-[selected]:bg-green-500/10 data-[selected]:text-black hover:bg-green-800/10`}
        onClick={() => {
          router.push(`/order/completed`);
        }}>
        <CheckCircleIcon className={'size-5 my-auto'} />
        completed
      </Tab>
      <Tab
        className={`${className} flex gap-1 text-orange-800 data-[selected]:bg-orange-500/10 data-[selected]:text-black hover:bg-orange-800/10`}
        onClick={() => {
          router.push(`/order/sent`);
        }}>
        <TruckIcon className={'size-5 my-auto'} />
        sent
      </Tab>
    </>
  );
}
