import React, { startTransition, useState } from 'react';
import { compareAsc, differenceInDays, format, formatDistance, startOfDay } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  HomeModernIcon as HomeModernOutlineIcon
} from '@heroicons/react/24/outline';
import { OrdersListProps } from '@/components/order/OrdersList';
import { OrderCardStatus, OrderOpen } from '@/components/order/OrderCardBase';
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

export type TodoOrderCardProps = Pick<
  OrdersListProps,
  'onCompleteOrderItem' | 'onComplete' | 'highlightItem'
> & {
  order: OrdersListProps['orders'][0];
  setOptimisticOrder: (action: {
    order: OrdersListProps['orders'][0];
    orderItem?: { id: string; checked: boolean } | undefined;
  }) => void;
  blurred?: boolean;
  key?: string;
};
export const TodoOrderCard = function TodoOrder({
  order,
  setOptimisticOrder,
  onComplete,
  onCompleteOrderItem,
  blurred,
  highlightItem
}: TodoOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const disabled = order.pending || order.items.some((oi) => !oi.completed);
  const deadlineFailed = order.deadlineAt ? compareAsc(new Date(), order.deadlineAt) > 0 : false;

  const deadlineSoon =
    !order.deadlineAt || deadlineFailed
      ? false
      : differenceInDays(order.deadlineAt, new Date()) <= 3;
  return (
    <div
      data-testid={`todo_order_${order.details}`}
      style={{
        viewTransitionName: `order-card-${order.id}`
      }}
      className={`relative group ${order.pending ? 'bg-[size:200%] bg-fuchsia-gradient bg-opacity-10 animate-shift' : 'bg-fuchsia-900/10'} [view-transition-name:order-card-${order.id}] font-light px-6 py-4 mb-2 rounded-md min-w-52 ${blurred ? '[&:not(:hover)]:opacity-40' : ''}`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline" aria-description={'order number'} data-testid="order_number">
          #{order.num}
        </div>
        <div className="font-light" data-testid="order_date">
          {format(order.lastState.date!, 'dd MMM yyyy')}
        </div>
        <OrderCardStatus price={order.price} color={'fuchsia'} stateDate={order.lastState.date!}>
          {null}
        </OrderCardStatus>

        <div className={'flex flex-1 justify-end gap-2'}>
          <OrderOpen orderId={order.id} state={order.lastState.state} />
        </div>

        <div
          data-testid="order_edit"
          className={
            'invisible group-hover:visible text-right hover:underline hover:cursor-pointer font-bold text-gray-700'
          }
          onClick={(e) => {
            e.preventDefault();
            startTransition(() => {
              setOptimisticOrder({
                order: { ...order, edit: true }
              });
            });
          }}>
          EDIT
        </div>
        <div
          data-testid="order_expand"
          className={
            'invisible group-hover:visible text-right hover:underline hover:cursor-pointer font-bold text-gray-700'
          }
          onClick={() => setExpanded((ex) => !ex)}>
          {expanded ? (
            <ArrowsPointingInIcon className={'size-4 hover:scale-125 hover:text-fuchsia-950'} />
          ) : (
            <ArrowsPointingOutIcon className={'size-4 hover:scale-125 hover:text-fuchsia-950'} />
          )}
        </div>
      </div>
      <div className="text-xs mb-2 text-gray-600" data-testid="order_created_by">
        Created by {order.lastState.userName}
      </div>

      <div
        className={`relative bg-white hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-30`}>
        {order.items.map((oi) => (
          <div
            className={'group/rootitem'}
            key={oi.id}
            data-testid={`order_item_${oi.name}`}
            role={'listitem'}>
            <div
              className={`group/item hover:cursor-pointer flex flex-row gap-1 font-normal text-green-800`}
              onClick={(e) => {
                e.preventDefault();
                startTransition(() => {
                  setOptimisticOrder({
                    order: { ...order, pending: true },
                    orderItem: { id: oi.id, checked: !oi.completed }
                  });
                  onCompleteOrderItem?.(oi.id, !oi.completed, false);
                });
              }}>
              <div className={'flex'}>
                {oi.completed && oi.fromStock ? (
                  <HomeModernOutlineIcon
                    className={'size-4 my-auto text-blue-600 group-hover/item:text-red-500'}
                  />
                ) : (
                  <input
                    className={!disabled ? 'hover:cursor-pointer' : ''}
                    type="checkbox"
                    checked={oi.completed ?? false}
                    disabled={order.pending}
                    onChange={(e) => e.preventDefault()}
                  />
                )}
              </div>
              <div
                className={`flex font-bold ${oi.completed ? 'group-hover/item:text-red-500' : 'group-hover/item:text-green-500'} pl-2 ${highlightItem === oi.itemId ? 'bg-yellow-300' : ''}`}>
                {oi.name}
              </div>
              <div
                className={`${oi.completed ? 'group-hover/item:text-red-500' : 'group-hover/item:text-green-500'} text-xs my-auto ml-auto text-center rounded-xl bg-white/50 px-1 min-w-5`}
                date-testid="order_item_quantity">
                {oi.quantity}
              </div>
              {oi.completed ? null : (
                <div
                  className={
                    'absolute flex gap-2 invisible group-hover/item:visible text-sm bg-amber-100 text-amber-900 ' +
                    'shadow-md z-[20] right-2 px-2 py-1 rounded-md hover:underline hover:bg-amber-300 font-semibold'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startTransition(() => {
                      setOptimisticOrder({
                        order: { ...order, pending: true },
                        orderItem: { id: oi.id, checked: !oi.completed }
                      });
                      onCompleteOrderItem?.(oi.id, !oi.completed, true);
                    });
                  }}>
                  use stock
                  <HomeModernOutlineIcon className={'size-4 my-auto'} />
                </div>
              )}
            </div>
            {expanded || highlightItem ? (
              <div data-testid={`order_item_${oi.name}_children`}>
                {oi.children?.map((oic) => (
                  <div
                    key={oic.name}
                    className={`flex flex-row gap-1 pl-6 text-red-900 text-xs font-normal  ${!oi.completed || highlightItem === oic.itemTypeId ? ' visible' : ' group/rootitem-hover:hidden'}`}
                    role={'listitem'}
                    data-testid={`order_item_${oi.name}_children_${oic.name}`}>
                    <div
                      className={`w-fit font-bold ${highlightItem === oic.itemTypeId ? 'bg-yellow-300' : ''}`}>
                      {oic.name}
                    </div>
                    <div
                      className="text-xs h-fit text-center rounded-xl bg-white px-1 min-w-5 ml-auto"
                      data-testid={`order_item_${oi.name}_children_quantity`}>
                      {oic.quantity * oi.quantity}
                      {oic.unit}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {order.details ? (
        <div
          data-testid={`order_details`}
          className={`mt-2 text-gray-950 font-medium border-l-4 border-fuchsia-300 pl-2 line-clamp-3`}>
          {order.details}
        </div>
      ) : null}
      <TodoDeadline deadlineFailed={deadlineFailed} deadlineSoon={deadlineSoon} order={order} />
      <TodoActions
        disabled={disabled}
        setOptimisticOrder={setOptimisticOrder}
        order={order}
        onComplete={onComplete}
      />
    </div>
  );
};

const TodoDeadline = ({
  order,
  deadlineFailed,
  deadlineSoon
}: Pick<TodoOrderCardProps, 'order'> & { deadlineFailed: boolean; deadlineSoon: boolean }) => {
  return order.deadlineAt ? (
    <div
      data-testid={`order_deadline`}
      className={`flex gap-2 mt-2 text-sm px-2 py-1 rounded-md ${
        deadlineFailed
          ? 'text-white font-bold bg-red-700 bg-opacity-90'
          : deadlineSoon
            ? 'text-white font-bold bg-orange-700 bg-opacity-90'
            : 'font-normal'
      }`}>
      <ClockIcon className="size-4 my-auto" />
      <span>{format(order.deadlineAt, 'dd MMM EE')}</span>
      <span className={'font-light ml-1'}>
        ({formatDistance(order.deadlineAt, startOfDay(Date.now()), { addSuffix: true })})
      </span>
    </div>
  ) : null;
};

const TodoActions = ({
  disabled,
  setOptimisticOrder,
  onComplete,
  order
}: Pick<TodoOrderCardProps, 'setOptimisticOrder' | 'onComplete' | 'order'> & {
  disabled: boolean;
}) => {
  return (
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
        className={`group flex justify-center gap-2 text-white w-full p-1 rounded-md font-semibold ${disabled ? 'bg-gray-300 hover:bg-gray-300' : 'bg-green-600/80 hover:bg-green-600/90'}`}>
        {order.pending ? (
          'updating'
        ) : (
          <div className={'flex gap-2'}>
            complete
            <CheckCircleIcon className={'size-5 my-auto'} />
          </div>
        )}
      </button>
    </div>
  );
};
