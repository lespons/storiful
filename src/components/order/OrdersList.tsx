'use client';

import React, { startTransition, useOptimistic } from 'react';
import { Disclosure } from '@headlessui/react';

type OrdersListProps = {
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
    pending?: boolean;
  }[];
  onComplete?: (id: string) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean) => void;
};

export function OrdersList({ orders, onComplete, onCompleteOrderItem }: OrdersListProps) {
  const [optimisticOrders, setOptimisticOrder] = useOptimistic<
    OrdersListProps['orders'],
    {
      order: OrdersListProps['orders'][0];
      orderItem: { id: string; checked: boolean };
    }
  >(orders, (state, { order, orderItem }) => {
    const oldOrderIndex = state.findIndex(({ id }) => id === order.id);

    state[oldOrderIndex].items.find((oi) => oi.id === orderItem.id)!.completed = orderItem.checked;
    state[oldOrderIndex] = {
      ...order,
      pending: true
    };

    return [...state];
  });
  return (
    <div className="overflow-auto">
      {!orders.length ? <div>-</div> : null}
      {optimisticOrders.map((order) => {
        const disabled = order.pending || order.items.some((oi) => !oi.completed);
        return (
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
                              startTransition(() => {
                                setOptimisticOrder({
                                  order: { ...order, pending: true },
                                  orderItem: { id: oi.id, checked }
                                });
                                onCompleteOrderItem?.(oi.id, checked);
                              });
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
              ) : (
                <button
                  type="submit"
                  disabled={disabled}
                  onClick={async () => {
                    await onComplete?.(order.id);
                  }}
                  className={`px-2 py-1 mt-2 rounded-md ${disabled ? 'text-gray-500' : 'hover:text-green-600 hover:bg-green-100'} font-bold text-sm min-w-full bg-fuchsia-100`}>
                  {order.pending ? 'Updating' : 'Complete'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
