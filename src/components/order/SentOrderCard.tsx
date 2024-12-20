import React from 'react';
import { format } from 'date-fns';
import { TruckIcon } from '@heroicons/react/24/solid';
import { OrderCardStatus, OrderClone, OrderOpen } from '@/components/order/OrderCardBase';
import { OrdersListProps } from '@/components/order/OrdersList';

export const SentOrderCard = function SentOrder({
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
      className={`group bg-yellow-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52 [view-transition-name:order-card-${order.id}]`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline">#{order.num}</div>
        <div className="flex gap-0.5 font-light">
          <div>{format(order.lastState.date, 'dd MMM yyyy')}</div>
        </div>
        <OrderCardStatus price={order.price} color={'orange'} stateDate={order.lastState.date}>
          <TruckIcon />
        </OrderCardStatus>
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
              <div
                className={`group flex flex-row gap-1  text-gray-800 font-normal hover:text-gray-950`}>
                <div
                  className={`group-hover:underline font-bold text-sm ${highlightItem === oi.itemId ? 'bg-yellow-300' : ''}`}>
                  {oi.name}
                </div>
                <div className="group-hover:underline text-xs my-auto ml-auto text-center rounded-xl bg-white/50 px-1 min-w-5">
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
          className={`mt-2 text-gray-900 font-medium border-l-4 border-yellow-600 pl-2 line-clamp-3`}>
          {order.details}
        </div>
      ) : null}
    </div>
  );
};
