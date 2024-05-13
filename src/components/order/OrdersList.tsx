'use client';

import React, { memo, startTransition, useOptimistic } from 'react';
import { Disclosure } from '@headlessui/react';
import ItemOrderForm, { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import { compareAsc, differenceInDays, format, formatDistanceToNow } from 'date-fns';

type OrderListItem = {
  id: string;
  completed: boolean;
  num: number;
  createdAt: Date;
  completedAt?: Date | null;
  deadlineAt?: Date | null;
  createdBy: string | null;
  completedBy?: string | null;
  details?: string | null;
  items: {
    id: string;
    itemId: string;
    quantity: number;
    name: string;
    completed: boolean;
    children: { name: string; quantity: number }[];
  }[];
  pending?: boolean;
  edit?: boolean;
};

export type OrdersListEditCallback = (
  prevState: { order: OrderFormValue },
  state: { order: OrderFormValue }
) => Promise<{ order: OrderFormValue }>;

export type OrdersListProps = {
  orders: OrderListItem[];
  onComplete?: (id: string) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean) => void;
  edit?: {
    itemTypes: OrderFormProps['itemTypes'];
    onEditOrder: OrdersListEditCallback;
  };
};

export function OrdersList({ orders, onComplete, onCompleteOrderItem, edit }: OrdersListProps) {
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

    if (order.edit) {
      state.forEach((o) => {
        if (order.id !== o.id) {
          o.edit = false;
        }
      });
    }

    state[oldOrderIndex] = {
      ...order
    };

    return [...state];
  });

  const someInEdit = orders.some(({ edit }) => edit);
  return (
    <div className="overflow-auto">
      {!orders.length ? <div>-</div> : null}
      {optimisticOrders.map((order) => {
        if (order.completed) return <CompletedOrder key={order.id} order={order} />;

        if (order.edit && edit) {
          return (
            <div key={order.id} className={'mb-2'}>
              <div className="font-light">Edit of the order #{order.num}</div>
              <ItemOrderForm
                action={'UPDATE'}
                itemTypes={edit.itemTypes}
                onSubmit={edit.onEditOrder}
                order={{
                  id: order.id,
                  deadline: order.deadlineAt ? format(order.deadlineAt, 'yyyy-MM-dd') : null,
                  details: order.details,
                  items: order.items
                }}
                onReset={() => {
                  startTransition(() => {
                    setOptimisticOrder({
                      order: { ...order, edit: false }
                    });
                  });
                }}
              />
            </div>
          );
        }
        return (
          <TodoOrder
            key={order.id}
            order={order}
            setOptimisticOrder={setOptimisticOrder}
            onCompleteOrderItem={onCompleteOrderItem}
            onComplete={onComplete}
            blurred={someInEdit}
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
  onCompleteOrderItem,
  blurred
}: {
  order: OrdersListProps['orders'][0];
  setOptimisticOrder: (action: {
    order: OrdersListProps['orders'][0];
    orderItem?: { id: string; checked: boolean } | undefined;
  }) => void;
  onCompleteOrderItem: OrdersListProps['onCompleteOrderItem'];
  onComplete: OrdersListProps['onComplete'];
  blurred?: boolean;
}) {
  const disabled = order.pending || order.items.some((oi) => !oi.completed);
  return (
    <div
      className={`relative ${order.completed ? 'bg-green-700' : 'bg-blue-700'} group bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52 group ${blurred ? '[&:not(:hover)]:opacity-40' : ''}`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>
        <div className={'flex gap-1'}>
          <div className="font-light">{format(order.createdAt, 'dd MMM yyyy')}</div>
        </div>
        <div
          className={
            'invisible group-hover:visible flex-1 text-right hover:underline hover:cursor-pointer font-bold text-gray-700'
          }
          onClick={(e) => {
            e.preventDefault();
            startTransition(() => {
              setOptimisticOrder({
                order: { ...order, edit: true }
              });
            });
          }}>
          Edit
        </div>
      </div>
      <div className="text-xs mb-2 text-gray-600">Created by {order.createdBy}</div>
      <div
        className={`bg-white hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-30`}>
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
              <div className={`font-bold pl-2`}>{oi.name}</div>
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

      {order.details ? (
        <div
          className={`mt-2 text-gray-900 font-medium border-l-4 border-fuchsia-300 pl-2 hover:border-fuchsia-400 hover:text-gray-950`}>
          {order.details}
        </div>
      ) : null}
      {order.deadlineAt ? (
        <div
          className={`mt-2 flex gap-2 text-xs px-2 py-0.5 rounded-md ${
            compareAsc(new Date(), order.deadlineAt) > 0
              ? 'font-bold text-red-800 bg-red-100'
              : differenceInDays(order.deadlineAt, new Date()) <= 3
                ? 'text-orange-600 font-bold bg-orange-100'
                : 'font-normal'
          }`}>
          🕙 <span>{format(order.deadlineAt, 'dd MMM EE')}</span>
          <span className={'font-light'}>
            ({formatDistanceToNow(order.deadlineAt, { addSuffix: true })})
          </span>
        </div>
      ) : null}
      <div className="flex text-gray-600">
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
      <div
        className={`bg-white hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-20 pointer-events-auto`}>
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
                    className={`text-red-700 text-xs font-normal flex flex-row gap-1`}>
                    <div className="font-bold">{oic.name}</div>
                    <div className="text-xs">(-{oic.quantity * oi.quantity})</div>
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </Disclosure>
        ))}
      </div>
      {order.details ? (
        <div
          className={`mt-2 text-gray-900 font-medium border-l-4 border-green-600 pl-2 hover:border-green-800 hover:text-gray-950`}>
          {order.details}
        </div>
      ) : null}
      <div className="flex mt-2 text-gray-600">
        <div className="flex flex-col text-xs font-extralight mt-2">
          <div className="">✅&nbsp;{order.completedAt?.toDateString()}</div>
          <div className="text-right">Completed by {order.completedBy}</div>
        </div>
      </div>
    </div>
  );
});
