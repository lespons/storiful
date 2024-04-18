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
    createdBy: string | null;
    completedBy?: string | null;
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
      orderItem?: { id: string; checked: boolean };
    }
  >(orders, (state, { order, orderItem }) => {
    const oldOrderIndex = state.findIndex(({ id }) => id === order.id);

    if (orderItem) {
      state[oldOrderIndex].items.find((oi) => oi.id === orderItem.id)!.completed =
        orderItem.checked;
    }

    state[oldOrderIndex] = {
      ...order
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
            className={`${order.completed ? 'bg-green-700' : 'bg-blue-700'} bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
            <div className="flex text-xs gap-2 mb-1 leading-none">
              <div className="underline">#{order.num}</div>

              <div className="font-light">{order.createdAt.toDateString()}</div>
            </div>
            <div className="text-xs mb-2 text-gray-600">Created by {order.createdBy}</div>
            <Disclosure defaultOpen={true}>
              <Disclosure.Button className="py-0 text-blue-900">Details</Disclosure.Button>
              <Disclosure.Panel
                className={`bg-white hover:scale-105 hover:bg-opacity-80 p-2 rounded-md shadow-md  transition-transform duration-100 ${order.completed ? 'bg-opacity-20' : ' bg-opacity-30'}`}>
                {order.items.map((oi) => (
                  <div key={oi.id} className="">
                    <div
                      className={`flex flex-row gap-1 text-green-800 font-normal cursor-pointer hover:text-green-700`}
                      onClick={(e) => {
                        e.preventDefault();
                        startTransition(() => {
                          setOptimisticOrder({
                            order: { ...order, pending: true },
                            orderItem: { id: oi.id, checked: !oi.completed }
                          });
                          onCompleteOrderItem?.(oi.id, !oi.completed);
                        });
                      }}>
                      {order.completed ? null : (
                        <div className={'flex'}>
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
                      <div className={`font-bold ${order.completed ? 'text-sm' : ''}`}>
                        {oi.name}
                      </div>
                      <div className="text-xs my-auto">(+{oi.quantity})</div>
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
            <div className="flex mt-2 text-gray-600">
              {order.completed ? (
                <div className="flex flex-col text-xs font-extralight mt-2">
                  <div className="">✅&nbsp;{order.completedAt?.toDateString()}</div>
                  <div className="text-right">Completed by {order.completedBy}</div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={disabled}
                  onClick={async () => {
                    startTransition(() => {
                      setOptimisticOrder({
                        order: { ...order, pending: true }
                      });
                      onComplete?.(order.id);
                    });
                  }}
                  className={`px-2 py-1 mt-2 rounded-md ${disabled ? 'text-gray-400' : 'hover:text-green-600 hover:bg-green-100 shadow-md'} font-bold text-sm min-w-full bg-fuchsia-100`}>
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
