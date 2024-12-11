import React, { ReactNode, startTransition, useState } from 'react';
import LongPressButton from '@/components/LongPressButton';
import { OrdersListProps } from '@/components/order/OrdersList';
import { differenceInDays, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';

export function OrderCardStatus({
  price,
  stateDate,
  color,
  children
}: {
  price?: string;
  stateDate: Date;
  color: string;
  children: ReactNode;
}) {
  const today = startOfDay(Date.now());

  const icon = children ? (
    <span className={`group-hover:invisible size-4 my-auto opacity-60`}>{children}</span>
  ) : null;
  const priceElement = (
    <div
      className={`flex gap-2 absolute right-0 group-hover:hidden text-xs font-semibold text-${color}-900 rounded-md`}
      data-testid="order_price">
      {price ? <span>{formatCurrency(price)}</span> : null}
      {icon}
    </div>
  );
  return (
    <>
      {priceElement}
      {differenceInDays(today, stateDate) < 1 ? (
        <div
          data-testid="order_new_label"
          className={`group-hover:invisible left-0 flex gap-1 font-normal text-white bg-${color}-900 px-2 my-auto rounded-md`}>
          new
        </div>
      ) : null}
    </>
  );
}

export function OrderOpen({ orderId, state }: { orderId: string; state: string }) {
  const router = useRouter();
  return (
    <div
      data-testid="order_open"
      className={
        'invisible group-hover:visible text-right hover:underline hover:cursor-pointer font-bold'
      }
      onClick={(e) => {
        e.preventDefault();
        router.push(`/order/${state.toLowerCase()}/${orderId}`);
      }}>
      OPEN
    </div>
  );
}

export function OrderClone({
  orderId,
  onClone
}: {
  orderId: string;
  onClone: OrdersListProps['onClone'];
}) {
  const [actionApplied, setActionApplied] = useState(false);
  return (
    <div
      className={'invisible group-hover:visible text-right hover:cursor-pointer font-bold'}
      title={'the same order will be created for TODO column'}>
      {actionApplied ? (
        <div className={'bg-green-100 rounded-md cursor-default'}>COPIED</div>
      ) : (
        <LongPressButton
          onLongPress={() => {
            startTransition(() => {
              setActionApplied(true);
              setTimeout(() => {
                onClone?.(orderId);
              });
              setTimeout(() => {
                setActionApplied(false);
              }, 3000);
            });
          }}
          title={'CLONE'}
          className={'hover:bg-blue-100 rounded-md text-blue-900'}
          defaultHoldTime={750}
          bgColor={'bg-blue-300'}
        />
      )}
    </div>
  );
}
