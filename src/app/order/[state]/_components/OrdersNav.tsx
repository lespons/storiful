'use client';

import { Tab } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function OrdersNav({ className }: { className: string }) {
  const router = useRouter();
  // todo use array params to render
  return (
    <>
      <Tab
        className={`${className} text-violet-800 data-[selected]:bg-violet-500/10`}
        onClick={() => {
          router.push(`/order/created`);
        }}>
        todo
      </Tab>
      <Tab
        className={`${className} text-green-800 data-[selected]:bg-green-500/10 data-[selected]:text-black`}
        onClick={() => {
          router.push(`/order/completed`);
        }}>
        completed
      </Tab>
      <Tab
        className={`${className} text-orange-800 data-[selected]:bg-orange-500/10 data-[selected]:text-black`}
        onClick={() => {
          router.push(`/order/sent`);
        }}>
        sent
      </Tab>
    </>
  );
}
