'use client';

import React, { memo, startTransition, useOptimistic } from 'react';
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
        if (order.completed) return <CompletedOrder key={order.id} order={order} />;

        return (
          <TodoOrder
            key={order.id}
            order={order}
            setOptimisticOrder={setOptimisticOrder}
            onCompleteOrderItem={onCompleteOrderItem}
            onComplete={onComplete}
          />
        );
      })}
    </div>
  );
}

const TodoOrder = memo(function TodoOrder({
  order,
  setOptimisticOrder,
  onComplete,
  onCompleteOrderItem
}: {
  order: OrdersListProps['orders'][0];
  setOptimisticOrder: (action: {
    order: OrdersListProps['orders'][0];
    orderItem?: { id: string; checked: boolean } | undefined;
  }) => void;
  onCompleteOrderItem: OrdersListProps['onCompleteOrderItem'];
  onComplete: OrdersListProps['onComplete'];
}) {
  const disabled = order.pending || order.items.some((oi) => !oi.completed);
  return (
    <div
      className={`${order.completed ? 'bg-green-700' : 'bg-blue-700'} bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>

        <div className="font-light">{order.createdAt.toDateString()}</div>
      </div>
      <div className="text-xs mb-2 text-gray-600">Created by {order.createdBy}</div>
      {/*<Disclosure.Button className="py-0 text-blue-900">Details</Disclosure.Button>*/}
      <div
        className={`bg-white hover:shadow-lg hover:bg-opacity-80 p-2 rounded-md shadow-md transition-colors duration-100 bg-opacity-30`}>
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
              <div className={`font-bold`}>{oi.name}</div>
              <div className="text-xs my-auto">(+{oi.quantity})</div>
            </div>
            <div>
              {oi.children?.map((oic) => (
                <div
                  key={oic.name}
                  className={`text-red-700 text-xs font-normal flex flex-row gap-1 pl-6`}>
                  <div className="font-bold">{oic.name}</div>
                  <div className="text-xs">(-{oic.quantity * oi.quantity})</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-2 text-gray-600">
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
      </div>
    </div>
  );
});

const CompletedOrder = memo(function CompletedOrder({
  order
}: {
  order: OrdersListProps['orders'][0];
}) {
  return (
    <div className={`bg-green-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>

        <div className="font-light">{order.createdAt.toDateString()}</div>
      </div>
      <div className="text-xs mb-2 text-gray-600">Created by {order.createdBy}</div>
      <div className="bg-white hover:shadow-lg hover:bg-opacity-80 p-2 rounded-md shadow-md transition-colors duration-100 bg-opacity-20">
        {order.items.map((oi) => (
          <Disclosure key={oi.id} defaultOpen={false}>
            <Disclosure.Button as="div" className="py-0 text-blue-900">
              <div
                className={`flex flex-row gap-1 text-green-800 font-normal cursor-pointer hover:text-green-700`}>
                <div className={`font-bold ${order.completed ? 'text-sm' : ''}`}>{oi.name}</div>
                <div className="text-xs my-auto">(+{oi.quantity})</div>
              </div>
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className={'pl-2 text-xs text-gray-600 max-w-60 font-bold'}>
                {oi.children?.map((oic) => (
                  <div
                    key={oic.name}
                    className={`text-red-700 text-xs font-normal flex flex-row gap-1 pl-2`}>
                    <div className="font-bold">{oic.name}</div>
                    <div className="text-xs">(-{oic.quantity * oi.quantity})</div>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </Disclosure>
        ))}
      </div>
      <div className="flex mt-2 text-gray-600">
        <div className="flex flex-col text-xs font-extralight mt-2">
          <div className="">✅&nbsp;{order.completedAt?.toDateString()}</div>
          <div className="text-right">Completed by {order.completedBy}</div>
        </div>
      </div>
    </div>
  );
});
