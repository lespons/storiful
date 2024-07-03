import React, { memo } from 'react';
import { differenceInDays, format, startOfDay } from 'date-fns';
import { ArchiveBoxIcon } from '@heroicons/react/24/solid';
import { OrderClone, OrderOpen } from '@/components/order/OrderCardBase';
import { OrdersListProps } from '@/components/order/OrdersList';

export const ArchivedOrderCard = memo(function ArchivedOrderCard({
  order,
  onClone,
  highlightItem
}: Pick<OrdersListProps, 'highlightItem' | 'onClone'> & {
  order: OrdersListProps['orders'][0];
  onClone: OrdersListProps['onClone'];
}) {
  const today = startOfDay(Date.now());
  return (
    <div
      data-testid={`archived_order_${order.details}`}
      className={`group bg-gray-700/10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline">#{order.num}</div>
        <div className="flex gap-0.5 font-light">
          <div>{format(order.lastState.date, 'dd MMM yyyy')}</div>
        </div>
        {differenceInDays(today, order.lastState.date) < 1 ? (
          <div
            className={
              'group-hover:invisible absolute right-0 flex gap-1 font-normal text-white bg-gray-900 px-2 my-auto rounded-md'
            }>
            new <ArchiveBoxIcon className={'text-white size-3 my-auto'} />
          </div>
        ) : (
          <ArchiveBoxIcon
            className={'group-hover:invisible absolute right-0 text-gray-900 size-4 my-auto'}
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
          className={`mt-2 text-gray-900 font-medium border-l-4 border-gray-600 pl-2 line-clamp-3`}>
          {order.details}
        </div>
      ) : null}
    </div>
  );
});
