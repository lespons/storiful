import { useRouter } from 'next/navigation';
import React, { startTransition, useState } from 'react';
import LongPressButton from '@/components/LongPressButton';
import { OrdersListProps } from '@/components/order/OrdersList';

export function OrderOpen({ orderId, state }: { orderId: string; state: string }) {
  const router = useRouter();
  return (
    <div
      data-testid="order_open"
      className={
        'invisible group-hover:visible flex-1 text-right hover:underline hover:cursor-pointer font-bold'
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
