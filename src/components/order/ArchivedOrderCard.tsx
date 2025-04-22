import React from 'react';
import { format } from 'date-fns';
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import { OrderCardStatus, OrderClone, OrderOpen } from '@/components/order/OrderCardBase';
import { OrdersListProps } from '@/components/order/OrdersList';

export const ArchivedOrderCard = function ArchivedOrderCard({
  order,
  onClone,
  highlightItem
}: Pick<OrdersListProps, 'highlightItem' | 'onClone'> & {
  order: OrdersListProps['orders'][0];
  onClone: OrdersListProps['onClone'];
}) {
  return (
    <div
      data-testid={`archived_order_${order.details}`}
      className={`group mb-2 min-w-52 rounded-md bg-gray-700/10 px-6 py-4 font-light`}>
      <div className="relative mb-1 flex gap-2 text-xs">
        <div className="underline">#{order.num}</div>
        <div className="flex gap-0.5 font-light">
          <div>{format(order.lastState.date, 'dd MMM yyyy')}</div>
        </div>
        <OrderCardStatus stateDate={order.lastState.date} color={'gray'} price={order.price}>
          <ArchiveBoxIcon />
        </OrderCardStatus>

        <div className={'flex flex-1 justify-end gap-2'}>
          <OrderOpen orderId={order.id} state={order.lastState.state} />
          <OrderClone orderId={order.id} onClone={onClone} />
        </div>
      </div>
      <div className="text-xs text-gray-600">Archived by {order.lastState.userName}</div>
      <div className={`mt-2`}>
        {order.items.map((oi) => {
          return (
            <div key={oi.id}>
              <div
                className={`group flex flex-row gap-1 font-normal text-gray-800 hover:text-gray-950`}>
                <div
                  className={`text-sm font-bold group-hover:underline ${highlightItem === oi.itemId ? 'bg-yellow-300' : ''}`}>
                  {oi.name}
                </div>
                <div className="my-auto ml-auto min-w-5 rounded-xl bg-white/50 px-1 text-center text-xs group-hover:underline">
                  {oi.newQuantity ? (
                    <span>
                      <b>{oi.newQuantity}</b>/
                    </span>
                  ) : null}
                  {oi.quantity}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {order.details ? (
        <div
          className={`mt-2 line-clamp-3 border-l-4 border-gray-600 pl-2 font-medium text-gray-900`}>
          {order.details}
        </div>
      ) : null}
    </div>
  );
};
