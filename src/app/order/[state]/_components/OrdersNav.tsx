'use client';

import { Tab } from '@headlessui/react';
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

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
        <WrenchScrewdriverIcon className="size-5 my-auto" />
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
      <Tab
        className={`${className} flex gap-1 text-gray-900 data-[selected]:bg-gray-500/10 data-[selected]:text-black hover:bg-gray-800/10`}
        onClick={() => {
          router.push(`/order/archive`);
        }}>
        <ArchiveBoxIcon className={'size-5 my-auto'} />
        archive
      </Tab>
    </>
  );
}
