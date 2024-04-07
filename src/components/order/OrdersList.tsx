'use client';

import React, { useState } from 'react';
import { Disclosure } from '@headlessui/react';

export function OrdersList({
  orders,
  onComplete,
  onCompleteOrderItem
}: {
  orders: {
    id: string;
    completed: boolean;
    num: number;
    createdAt: Date;
    completedAt?: Date | null;
    items: {
      id: string;
      quantity: number;
      name: string;
      completed: boolean;
      children: { name: string; quantity: number }[];
    }[];
  }[];
  onComplete?: (id: string) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  return (
    <div className="overflow-auto">
      {!orders.length ? <div>-</div> : null}
      {orders.map((order) => (
        <div
          key={order.id}
          className={`${order.completed ? 'bg-green-600' : 'bg-fuchsia-700'} bg-opacity-10 font-light px-8 py-4 rounded-2xl mb-2`}>
          <div className="text-lg underline">Order #{order.num}</div>
          <div className="text-xs font-light mb-2">{order.createdAt.toDateString()}</div>
          <div>{order.completed}</div>
          <Disclosure defaultOpen={true}>
            <Disclosure.Button className="py-0 text-blue-900">Details</Disclosure.Button>
            <Disclosure.Panel className="text-gray-500">
              {order.items.map((oi) => (
                <div key={oi.id} className="text-sm">
                  <div className="flex flex-row gap-1 text-green-800 font-normal">
                    {order.completed ? null : (
                      <div className="pt-0.5">
                        <input
                          className="cursor-pointer"
                          type="checkbox"
                          checked={oi.completed ?? false}
                          onChange={({ target: { checked } }) => {
                            onCompleteOrderItem?.(oi.id, checked);
                          }}
                        />
                      </div>
                    )}
                    <div className="font-bold">{oi.name}</div>
                    <div className="text-xs pt-0.5">(+{oi.quantity})</div>
                  </div>
                  <div>
                    {oi.children?.map((oic) => (
                      <div
                        key={oic.name}
                        className={`text-red-700 text-xs font-normal flex flex-row gap-1 ${order.completed ? 'pl-2' : 'pl-6'}`}>
                        <div className="font-bold">{oic.name}</div>
                        <div className="text-xs">(-{oic.quantity * oi.quantity})</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Disclosure.Panel>
          </Disclosure>
          <div className="flex">
            {order.completed ? (
              <div className="text-xs font-extralight mt-2">
                ✅&nbsp;{order.completedAt?.toDateString()}
              </div>
            ) : pending || order.items.some((oi) => !oi.completed) ? null : (
              <button
                type="submit"
                onClick={async () => {
                  setPending(true);
                  await onComplete?.(order.id);
                  setTimeout(() => {
                    setPending(false);
                  });
                }}
                className="px-2 py-1 mt-2 rounded-md hover:text-green-600 hover:bg-green-100 font-bold text-sm min-w-full bg-fuchsia-100">
                Complete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
