'use client';

import React, { memo, startTransition, useOptimistic } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import ItemOrderForm, { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import { differenceInDays, format, formatDistance } from 'date-fns';
import { PencilIcon, SparklesIcon, TruckIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TodoOrderCard } from '@/components/order/TodoOrderCard';
import { OrderClone, OrderOpen } from '@/components/order/OrderCardBase';

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
    children: { typeId: string; name: string; quantity: number }[];
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
  onClone?: (id: string) => void;
  onCompleteOrderItem?: (orderItemId: string, completed: boolean) => void;
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
            <CompletedOrderListItem
              key={order.id}
              order={order}
              onChangeState={onChangeState}
              setOptimisticOrder={setOptimisticOrder}
              onClone={onClone}
              highlightItem={highlightItem}
            />
          );

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

const CompletedOrderListItem = memo(function CompletedOrder({
  order,
  highlightItem,
  onChangeState,
  setOptimisticOrder,
  onClone
}: Pick<OrdersListProps, 'highlightItem' | 'onChangeState' | 'onClone'> & {
  order: OrdersListProps['orders'][0];
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
        className={`flex gap-1 mt-2 text-xs py-0.5 rounded-md ${
          withDelay ? 'font-bold text-red-800' : 'font-normal'
        }`}>
        <ClockIcon className="size-4" />
        <span>{format(order.deadlineAt, 'dd MMM EE')}</span>
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
    <div
      data-testid={`completed_order_${order.details}`}
      className={`group bg-green-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline">#{order.num}</div>
        <div className="font-light">{format(order.lastState.date!, 'dd MMM yyyy')}</div>
        {differenceInDays(new Date(), order.lastState.date!) < 1 ? (
          <div
            className={
              'group-hover:invisible absolute right-0 flex gap-1 font-normal text-white bg-green-900 px-2 my-auto rounded-md'
            }>
            new
            <CheckIcon className={'size-3 my-auto '} />
          </div>
        ) : (
          <CheckCircleIcon
            className={'group-hover:invisible absolute right-0 size-4 text-green-900'}
          />
        )}

        <OrderOpen orderId={order.id} state={order.lastState.state} />
        <OrderClone orderId={order.id} onClone={onClone} />
      </div>
      <div className="text-xs text-gray-600">Completed by {order.lastState.userName}</div>
      <div
        className={`group bg-white mt-2 hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-50 pointer-events-auto`}>
        {order.items.map((oi) => {
          const childIsHighlight = oi.children.some((c) => c.typeId === highlightItem);
          return (
            <Disclosure key={oi.id} defaultOpen={false}>
              {({ open }) => (
                <>
                  <DisclosureButton as="div" className="py-0 text-blue-900">
                    <div
                      className={`flex flex-row gap-1 text-green-800 font-normal cursor-pointer hover:text-green-700`}>
                      <div
                        className={`transition-all ease-in duration-500 font-bold text-sm ${highlightItem === oi.itemId ? 'bg-yellow-300' : ''}`}>
                        {oi.name}
                      </div>
                      <div className="text-xs my-auto">(+{oi.quantity})</div>
                    </div>
                  </DisclosureButton>
                  {(open || childIsHighlight) && (
                    <DisclosurePanel static>
                      <div className={'pl-2 text-xs text-gray-600 max-w-60 font-bold'}>
                        {oi.children?.map((oic) => (
                          <div
                            key={oic.name}
                            className={`text-red-700 text-xs font-normal flex flex-row gap-1`}>
                            <div
                              className={`font-bold  ${highlightItem === oic.typeId ? 'bg-yellow-300' : ''}`}>
                              {oic.name}
                            </div>
                            <div className="text-xs">(-{oic.quantity * oi.quantity})</div>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  )}
                </>
              )}
            </Disclosure>
          );
        })}
        <div
          className={
            'overflow-hidden max-h-0 group-hover:max-h-10 group-hover:mt-2 transition-(max-height) ease-in-out duration-500 delay-1000 group-hover:delay-100'
          }>
          <button
            className={`group flex justify-center gap-2 w-full p-1 rounded-md font-bold ${order.pending ? 'bg-gray-300 hover:bg-gray-300' : 'bg-yellow-400 hover:bg-yellow-500'}`}
            disabled={order.pending}
            onClick={async () => {
              startTransition(() => {
                setOptimisticOrder({
                  order: { ...order, pending: true }
                });
                onChangeState?.(order.id, 'SENT');
              });
            }}>
            <div>send</div>
            <TruckIcon className="group-hover:animate-shake size-6 text-orange-900" />
          </button>
        </div>
      </div>
      {order.details ? (
        <div
          className={`mt-2 text-gray-950 font-medium border-l-4 border-green-600 pl-2 line-clamp-3`}>
          {order.details}
        </div>
      ) : null}
      {deadLine()}
    </div>
  );
});

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
        <OrderOpen orderId={order.id} state={order.lastState.state} />
        <OrderClone orderId={order.id} onClone={onClone} />
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
                <div className="text-xs my-auto">({oi.quantity})</div>
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
