import React, { startTransition, useRef, useState } from 'react';
import { differenceInDays, format, formatDistance, startOfDay } from 'date-fns';
import { CheckCircleIcon, CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { OrderClone, OrderOpen } from '@/components/order/OrderCardBase';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import {
  ArchiveBoxArrowDownIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TruckIcon
} from '@heroicons/react/24/solid';
import { OrdersListProps } from '@/components/order/OrdersList';
import LongPressButton from '@/components/LongPressButton';

function CompletedItem({
  childIsHighlight,
  orderItem,
  highlightItem,
  onChangeItemValue
}: {
  childIsHighlight: boolean;
  onChangeItemValue: OrdersListProps['onChangeItemValue'];
  orderItem: OrdersListProps['orders'][0]['items'][0];
  highlightItem: string | null | undefined;
}) {
  const [edit, setEdit] = useState(false);
  const inputref = useRef<HTMLInputElement>(null);
  const theValuesIsChanged = !(orderItem.newQuantity ?? 1);
  return (
    <Disclosure defaultOpen={false}>
      {({ open }) => (
        <>
          <DisclosureButton as="div" className="group py-0 text-blue-900">
            <div
              className={`relative flex ${edit ? 'flex-col' : 'flex-row'} gap-1 text-green-800 font-normal ${orderItem.children?.length ? 'cursor-pointer' : ''} hover:text-green-700`}>
              <div className={'flex gap-1'}>
                <div
                  data-testid={`completed-item-name-${orderItem.name}`}
                  className={`transition-all ease-in duration-500 font-bold text-sm my-auto ${highlightItem === orderItem.itemId ? 'bg-yellow-300' : ''}`}>
                  {orderItem.name}
                </div>
                <div className="flex gap-1 text-xs my-auto">
                  {theValuesIsChanged ? (
                    <span>
                      (<b>{orderItem.newQuantity}</b>/ {orderItem.quantity})
                    </span>
                  ) : (
                    <>({orderItem.quantity})</>
                  )}
                  {theValuesIsChanged ? (
                    <ExclamationTriangleIcon
                      className="size-4 text-orange-600"
                      title={`you have new value of items`}
                    />
                  ) : null}
                </div>
              </div>
              <div
                data-testid={`completed-item-edit-${orderItem.name}`}
                className={`flex gap-2 text-gray-800 font-semibold`}>
                {edit ? (
                  <>
                    <input
                      data-testid="newvalue"
                      ref={inputref}
                      type={'number'}
                      placeholder={'new value'}
                      max={orderItem.quantity}
                      className="flex-1 text-xs bg-green-100 rounded-md px-2 w-20 my-auto py-1"
                      defaultValue={orderItem.quantity}
                    />
                    <button
                      className={'rounded-md bg-pink-200 px-2 my-auto hover:bg-pink-300'}
                      onClick={async (e) => {
                        e.preventDefault();
                        await onChangeItemValue?.(orderItem.id, Number(inputref.current?.value));
                        setEdit(false);
                      }}>
                      set
                    </button>
                    <XMarkIcon
                      className={'size-4 my-auto hover:cursor-pointer hover:bg-pink-300 rounded-md'}
                      onClick={(e) => {
                        e.preventDefault();
                        setEdit(false);
                      }}
                    />
                  </>
                ) : (
                  <div
                    data-testid={orderItem.name + '_edit'}
                    className="absolute right-1 invisible group-hover:visible text-xs hover:underline hover:cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setEdit(true);
                    }}>
                    <PencilSquareIcon
                      className={'size-4 text-gray-700 hover:scale-125 hover:text-blue-600'}
                    />
                  </div>
                )}
              </div>
            </div>
          </DisclosureButton>
          {(open || childIsHighlight) && (
            <DisclosurePanel static>
              <div className={'pl-2 text-xs text-gray-600 max-w-60 font-bold'}>
                {orderItem.children?.map((oic) => (
                  <div
                    key={oic.name}
                    className={`text-red-700 text-xs font-normal flex flex-row gap-1`}>
                    <div
                      className={`font-bold  ${highlightItem === oic.itemTypeId ? 'bg-yellow-300' : ''}`}>
                      {oic.name}
                    </div>
                    <div className="text-xs">
                      (-{oic.quantity * orderItem.quantity}
                      {oic.unit})
                    </div>
                  </div>
                ))}
              </div>
            </DisclosurePanel>
          )}
        </>
      )}
    </Disclosure>
  );
}

export const CompletedOrderCard = function CompletedOrder({
  order,
  highlightItem,
  onChangeState,
  onChangeItemValue,
  setOptimisticOrder,
  onClone
}: Pick<OrdersListProps, 'highlightItem' | 'onChangeState' | 'onClone' | 'onChangeItemValue'> & {
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

  const sendDisabled = order.pending;
  const today = startOfDay(Date.now());
  return (
    <div
      data-testid={`completed_order_${order.details}`}
      className={`group bg-green-700 bg-opacity-10 font-light px-6 py-4 mb-2 rounded-md min-w-52`}>
      <div className="relative flex text-xs gap-2 mb-1">
        <div className="underline">#{order.num}</div>
        <div className="font-light">{format(order.lastState.date, 'dd MMM yyyy')}</div>
        {differenceInDays(today, order.lastState.date) < 1 ? (
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

        <div className={'flex flex-1 justify-end gap-2'}>
          <OrderOpen orderId={order.id} state={order.lastState.state} />
          <OrderClone orderId={order.id} onClone={onClone} />
        </div>
      </div>
      <div className="text-xs text-gray-600">Completed by {order.lastState.userName}</div>
      <div
        className={`group bg-white mt-2 hover:shadow-md hover:bg-opacity-80 px-4 py-2 rounded-md shadow-sm transition-colors duration-100 bg-opacity-50 pointer-events-auto`}>
        {order.items.map((oi) => {
          const childIsHighlight = oi.children.some((c) => c.itemTypeId === highlightItem);
          return (
            <CompletedItem
              key={oi.id}
              childIsHighlight={childIsHighlight}
              highlightItem={highlightItem}
              orderItem={oi}
              onChangeItemValue={onChangeItemValue}
            />
          );
        })}
        <div className={'flex w-full gap-1'}>
          <div
            className={
              'flex-1 overflow-hidden max-h-0 group-hover:max-h-10 group-hover:mt-2 transition-(max-height) ease-in-out duration-500 delay-1000 group-hover:delay-100'
            }>
            <LongPressButton
              className={`group w-full p-1 rounded-md font-bold ${sendDisabled ? 'bg-gray-300 hover:bg-gray-300' : 'bg-yellow-400 hover:bg-yellow-500'}`}
              disabled={sendDisabled}
              defaultHoldTime={1500}
              onLongPress={async () => {
                startTransition(() => {
                  setOptimisticOrder({
                    order: { ...order, pending: true }
                  });
                  onChangeState?.(order.id, 'SENT');
                });
              }}>
              <div className={'flex gap-2 justify-center px-2'}>
                <div>send</div>
                <TruckIcon
                  className={`size-6 my-auto ${sendDisabled ? 'text-gray-800' : 'text-orange-900 group-hover:animate-shake'}`}
                />
              </div>
            </LongPressButton>
          </div>
          <div
            className={
              'overflow-hidden max-h-0 group-hover:max-h-10 group-hover:mt-2 transition-(max-height) ease-in-out duration-500 delay-1000 group-hover:delay-100'
            }>
            <LongPressButton
              className={`group w-full rounded-md p-1 font-bold ${sendDisabled ? 'text-gray-300 hover:text-gray-300' : 'bg-gray-200 hover:bg-gray-300'}`}
              disabled={sendDisabled}
              bgColor={'bg-gray-400'}
              defaultHoldTime={1500}
              onLongPress={async () => {
                startTransition(() => {
                  setOptimisticOrder({
                    order: { ...order, pending: true }
                  });
                  onChangeState?.(order.id, 'ARCHIVE');
                });
              }}>
              <div className={'flex gap-2 justify-center px-2'}>
                <div>archive</div>
                <ArchiveBoxArrowDownIcon className={`size-5 my-auto`} />
              </div>
            </LongPressButton>
          </div>
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
};
