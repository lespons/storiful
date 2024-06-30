'use client';

import React, { memo, startTransition, useOptimistic } from 'react';
import ItemOrderForm, { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import { differenceInDays, format } from 'date-fns';
import { PencilIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/solid';
import { TodoOrderCard } from '@/components/order/TodoOrderCard';
import { OrderClone, OrderOpen } from '@/components/order/OrderCardBase';
import { CompletedOrder } from '@/components/order/CompletedOrderCard';
import { ArchivedOrderCard } from '@/components/order/ArchivedOrderCard';

type OrderState = 'COMPLETED' | 'CREATED' | 'SENT' | 'INPROGRESS' | 'ARCHIVE';
type OrderListItem = {
  id: string;
  num: number;
  deadlineAt?: Date | null;
  details?: string | null;
  items: {
    id: string;
    itemId: string;
    quantity: number;
    newQuantity?: number | null;
    name: string;
    completed: boolean;
    fromStock?: boolean;
    children: { itemTypeId: string; name: string; quantity: number }[];
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
  highlightItem?: string | null;
  onComplete?: (id: string) => void;
  onChangeState?: (id: string, state: OrderState) => void;
  onChangeItemValue?: (orderItemId: string, newvalue: number) => void;
  onClone?: (id: string) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean, fromStock: boolean) => void;
  edit?: {
    itemTypes: OrderFormProps['itemTypes'];
    onEditOrder: OrdersListEditCallback;
  };
};

export function OrdersList({
  orders,
  highlightItem,
  onComplete,
  onCompleteOrderItem,
  onChangeItemValue,
  edit,
  onChangeState,
  onClone
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
    <div className="overflow-auto pr-0.5">
      {!orders.length ? (
        <div className={'flex justify-center gap-2 text-xl text-black/50 my-2'}>
          nothing found <SparklesIcon className={'size-7 my-auto'} />
        </div>
      ) : null}
      {optimisticOrders.map((order) => {
        if (order.lastState.state === 'COMPLETED')
          return (
            <CompletedOrder
              key={order.id}
              order={order}
              onChangeState={onChangeState}
              onChangeItemValue={onChangeItemValue}
              setOptimisticOrder={setOptimisticOrder}
              onClone={onClone}
              highlightItem={highlightItem}
            />
          );

        if (order.lastState.state === 'ARCHIVE') {
          return (
            <ArchivedOrderCard
              key={order.id}
              order={order}
              onClone={onClone}
              highlightItem={highlightItem}
            />
          );
        }
        if (order.lastState.state === 'SENT')
          return (
            <SentOrderListItem
              key={order.id}
              order={order}
              onClone={onClone}
              highlightItem={highlightItem}
            />
          );

        if (order.edit && edit) {
          return (
            <div key={order.id} className={'mb-2'}>
              <div
                className="flex gap-2 bg-black text-white rounded-t-md px-3 py-0.5 font-semibold
              ">
                <PencilIcon className={'size-5 my-auto'} />#{order.num}
              </div>
              <ItemOrderForm
                action={'UPDATE'}
                itemTypes={edit.itemTypes}
                onSubmit={edit.onEditOrder}
                order={{
                  id: order.id,
                  deadline: order.deadlineAt ? format(order.deadlineAt, 'yyyy-MM-dd') : null,
                  details: order.details,
                  items: order.items,
                  pending: order.pending
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
          <TodoOrderCard
            key={order.id}
            order={order}
            setOptimisticOrder={setOptimisticOrder}
            onCompleteOrderItem={onCompleteOrderItem}
            onComplete={onComplete}
            blurred={someInEdit}
            highlightItem={highlightItem}
          />
        );
      })}
    </div>
  );
}

const SentOrderListItem = memo(function SentOrder({
  order,
  onClone,
  highlightItem
}: Pick<OrdersListProps, 'highlightItem' | 'onClone'> & {
  order: OrdersListProps['orders'][0];
  onClone: OrdersListProps['onClone'];
}) {
  return (
    <div
      data-testid={`sent_order_${order.details}`}
      className={`group bg-yellow-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline">#{order.num}</div>
        <div className="flex gap-0.5 font-light">
          <div>{order.lastState.date.toDateString()}</div>
        </div>
        {differenceInDays(new Date(), order.lastState.date!) < 1 ? (
          <div
            className={
              'group-hover:invisible absolute right-0 flex gap-1 font-normal text-white bg-orange-900 px-2 my-auto rounded-md'
            }>
            new <TruckIcon className={'text-white size-3 my-auto'} />
          </div>
        ) : (
          <TruckIcon
            className={'group-hover:invisible absolute right-0 text-orange-900 size-4 my-auto'}
          />
        )}
        <div className={'flex flex-1 justify-end gap-2'}>
          <OrderOpen orderId={order.id} state={order.lastState.state} />
          <OrderClone orderId={order.id} onClone={onClone} />
        </div>
      </div>
      <div className="text-xs text-gray-600">Sent by {order.lastState.userName}</div>
      <div className={`mt-2`}>
        {order.items.map((oi) => {
          return (
            <div key={oi.id}>
              <div className={`flex flex-row gap-1 text-gray-800 font-normal hover:text-gray-950`}>
                <div
                  className={`font-bold text-sm ${highlightItem === oi.itemId ? 'bg-yellow-300' : ''}`}>
                  {oi.name}
                </div>
                <div className="text-xs my-auto">
                  (
                  {oi.newQuantity ? (
                    <span>
                      <b>{oi.newQuantity}</b>/
                    </span>
                  ) : null}
                  {oi.quantity})
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {order.details ? (
        <div
          className={`mt-2 text-gray-900 font-medium border-l-4 border-yellow-600 pl-2 line-clamp-3`}>
          {order.details}
        </div>
      ) : null}
    </div>
  );
});
