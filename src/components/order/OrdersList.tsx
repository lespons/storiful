'use client';

import React, { memo, startTransition, useOptimistic } from 'react';
import { Disclosure } from '@headlessui/react';
import ItemOrderForm, { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import {
  compareAsc,
  differenceInDays,
  format,
  formatDistance,
  formatDistanceToNow
} from 'date-fns';

type OrderState = 'COMPLETED' | 'CREATED' | 'SENT' | 'INPROGRESS';
type OrderListItem = {
  id: string;
  num: number;
  deadlineAt?: Date | null;
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
  lastState: {
    userName: string | null;
    state: OrderState;
    date: Date;
  };
};

export type OrdersListEditCallback = (
  prevState: { order: OrderFormValue },
  state: { order: OrderFormValue }
) => Promise<{ order: OrderFormValue }>;

export type OrdersListProps = {
  orders: OrderListItem[];
  onComplete?: (id: string) => void;
  onChangeState?: (id: string, state: OrderState) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean) => void;
  edit?: {
    itemTypes: OrderFormProps['itemTypes'];
    onEditOrder: OrdersListEditCallback;
  };
};

export function OrdersList({
  orders,
  onComplete,
  onCompleteOrderItem,
  edit,
  onChangeState
}: OrdersListProps) {
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
        if (order.lastState.state === 'COMPLETED')
          return (
            <CompletedOrderListItem
              key={order.id}
              order={order}
              onChangeState={onChangeState}
              setOptimisticOrder={setOptimisticOrder}
            />
          );

        if (order.lastState.state === 'SENT')
          return <SentOrderListItem key={order.id} order={order} onChangeState={onChangeState} />;

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
          <TodoOrderListItem
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

export const TodoOrderListItem = memo(function TodoOrder({
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

  const deadlineFailed = order.deadlineAt ? compareAsc(new Date(), order.deadlineAt) > 0 : false;

  const deadlineSoon =
    !order.deadlineAt || deadlineFailed
      ? false
      : differenceInDays(order.deadlineAt, new Date()) <= 3;
  return (
    <div
      className={`relative group ${order.pending ? 'bg-[size:200%] bg-fuchsia-gradient bg-opacity-10 animate-shift' : 'bg-fuchsia-900 bg-opacity-10'} font-light px-6 py-4 mb-2 rounded-md min-w-52 ${blurred ? '[&:not(:hover)]:opacity-40' : ''}
       ${deadlineSoon ? '' : ''}`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>
        <div className={'flex gap-1'}>
          <div className="font-light">{format(order.lastState.date!, 'dd MMM yyyy')}</div>
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
      <div className="text-xs mb-2 text-gray-600">Created by {order.lastState.userName}</div>
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
        <div className={`mt-2 text-gray-950 font-medium border-l-4 border-fuchsia-300 pl-2`}>
          {order.details}
        </div>
      ) : null}
      {order.deadlineAt ? (
        <div
          className={`mt-2 text-sm px-2 py-1 rounded-md ${
            deadlineFailed
              ? 'text-white font-bold bg-red-700 bg-opacity-90'
              : deadlineSoon
                ? 'text-white font-bold bg-orange-700 bg-opacity-90'
                : 'font-normal'
          }`}>
          🕙 <span>{format(order.deadlineAt, 'dd MMM EE')}</span>
          <span className={'font-light ml-1'}>
            ({formatDistanceToNow(order.deadlineAt, { addSuffix: true })})
          </span>
        </div>
      ) : null}
      <div
        className={`overflow-hidden max-h-0 ${disabled ? '' : 'group-hover:max-h-10 group-hover:mt-2'}  transition-(max-height) ease-in-out duration-500 delay-1000 group-hover:delay-100`}>
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
          className={`px-2 py-1 mt-2 rounded-md ${disabled ? 'text-gray-400 bg-gray-100' : 'bg-green-100 hover:text-green-600 hover:bg-green-100 shadow-md'} font-bold text-sm min-w-full`}>
          {order.pending ? 'Updating' : 'Complete'}
        </button>
      </div>
    </div>
  );
});

const CompletedOrderListItem = memo(function CompletedOrder({
  order,
  onChangeState,
  setOptimisticOrder
}: {
  order: OrdersListProps['orders'][0];
  onChangeState: OrdersListProps['onChangeState'];
  setOptimisticOrder: (action: {
    order: OrdersListProps['orders'][0];
    orderItem?: { id: string; checked: boolean } | undefined;
  }) => void;
}) {
  const deadLine = () => {
    if (!order.deadlineAt) {
      return null;
    }

    const withDelay = differenceInDays(order.lastState.date, order.deadlineAt) > 0;
    return (
      <div
        className={`mt-2 text-xs py-0.5 rounded-md ${
          withDelay ? 'font-bold text-red-800' : 'font-normal'
        }`}>
        🕙 <span>{format(order.deadlineAt, 'dd MMM EE')}</span>
        <span className={'font-light ml-1'}>
          {withDelay ? (
            <>
              ({formatDistance(order.lastState.date, order.deadlineAt, { addSuffix: false })}
              &nbsp;{withDelay ? 'delay' : ''})
            </>
          ) : null}
        </span>
      </div>
    );
  };
  return (
    <div className={`bg-green-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>
        <div className="font-light">✅&nbsp;{order.lastState.date.toDateString()}</div>
      </div>
      <div className="text-xs text-gray-600">Completed by {order.lastState.userName}</div>
      <div
        className={`group bg-white mt-2 hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-50 pointer-events-auto`}>
        {order.items.map((oi) => (
          <Disclosure key={oi.id} defaultOpen={false}>
            <Disclosure.Button as="div" className="py-0 text-blue-900">
              <div
                className={`flex flex-row gap-1 text-green-800 font-normal cursor-pointer hover:text-green-700`}>
                <div className={`font-bold text-sm`}>{oi.name}</div>
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
        <div
          className={
            'overflow-hidden max-h-0 group-hover:max-h-10 group-hover:mt-2 transition-(max-height) ease-in-out duration-500 delay-1000 group-hover:delay-100'
          }>
          <button
            className={`group flex justify-center gap-2 w-full p-1 rounded-md font-bold ${order.pending ? 'bg-gray-300 hover:bg-gray-300' : 'bg-yellow-400 hover:bg-yellow-300'}`}
            disabled={order.pending}
            onClick={async () => {
              startTransition(() => {
                setOptimisticOrder({
                  order: { ...order, pending: true }
                });
                onChangeState?.(order.id, 'SENT');
              });
            }}>
            <div>Send</div> <div className={'group-hover:animate-shake'}>📦</div>
          </button>
        </div>
      </div>
      {order.details ? (
        <div className={`mt-2 text-gray-950 font-medium border-l-4 border-green-600 pl-2`}>
          {order.details}
        </div>
      ) : null}
      {deadLine()}
    </div>
  );
});

const SentOrderListItem = memo(function SentOrder({
  order,
  onChangeState
}: {
  order: OrdersListProps['orders'][0];
  onChangeState: OrdersListProps['onChangeState'];
}) {
  return (
    <div className={`bg-yellow-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="flex text-xs gap-2 mb-1 leading-none">
        <div className="underline">#{order.num}</div>
        <div className="font-light">📦&nbsp;{order.lastState.date.toDateString()}</div>
      </div>
      <div className="text-xs text-gray-600">Sent by {order.lastState.userName}</div>
      <div className={`mt-2`}>
        {order.items.map((oi) => (
          <div key={oi.id}>
            <div className={`flex flex-row gap-1 text-gray-800 font-normal hover:text-gray-950`}>
              <div className={`font-bold text-sm`}>{oi.name}</div>
              <div className="text-xs my-auto">({oi.quantity})</div>
            </div>
          </div>
        ))}
      </div>
      {order.details ? (
        <div className={`mt-2 text-gray-900 font-medium border-l-4 border-yellow-600 pl-2`}>
          {order.details}
        </div>
      ) : null}
    </div>
  );
});
