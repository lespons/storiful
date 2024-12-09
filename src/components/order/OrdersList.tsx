'use client';

import React, { startTransition, useOptimistic } from 'react';
import ItemOrderForm, { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import { format } from 'date-fns';
import { PencilIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { TodoOrderCard } from '@/components/order/TodoOrderCard';
import { ArchivedOrderCard } from '@/components/order/ArchivedOrderCard';
import { SentOrderCard } from '@/components/order/SentOrderCard';
import { CompletedOrderCard } from '@/components/order/CompletedOrderCard';

type OrderState = 'COMPLETED' | 'CREATED' | 'SENT' | 'INPROGRESS' | 'ARCHIVE';
type OrderListItem = {
  id: string;
  num: number;
  deadlineAt?: Date | null;
  details?: string | null;
  price?: string;
  items: {
    id: string;
    itemId: string;
    quantity: number;
    newQuantity?: number | null;
    name: string;
    completed: boolean;
    fromStock?: boolean;
    children: { itemTypeId: string; name: string; quantity: number; unit: string }[];
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
            <CompletedOrderCard
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
            <SentOrderCard
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
