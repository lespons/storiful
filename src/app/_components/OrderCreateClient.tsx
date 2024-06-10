'use client';
import OrderForm, { OrderFormProps } from '@/components/order/OrderForm';
import { mutate } from 'swr';
import { useRef, useState } from 'react';

export function OrderCreateClient({
  itemTypes,
  onSubmit,
  itemStockById
}: Pick<OrderFormProps, 'onSubmit' | 'itemTypes' | 'itemStockById'>) {
  const animationTime = 450;
  const timer = useRef<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [overflowHidden, setOverflow] = useState(true);

  const openCreateOrder = () => {
    clearTimeout(timer.current as number);
    timer.current = setTimeout(
      () => {
        setShowCreate((sc) => {
          setOverflow(!sc);
          return sc;
        });
      },
      overflowHidden ? animationTime : 0
    ) as unknown as number;
    setShowCreate((sc) => !sc);
  };

  return (
    <div className={'relative'}>
      <button
        className={
          'ease duration-[350ms] overflow-hidden transition-[width, opacity, transform] px-1 text-white  font-bold  min-w-10 ' +
          (showCreate
            ? 'bg-gray-950 bg-opacity-100 hover:bg-opacity-90 w-full rounded-t-md'
            : 'bg-fuchsia-900 bg-opacity-40 hover:bg-opacity-100 w-10 rounded-md')
        }
        onClick={openCreateOrder}>
        <div
          className={
            'transition-[width, opacity, transform] ease-in-out duration-[1450ms] text-xl ' +
            (showCreate ? 'rotate-45' : 'rotate-0')
          }>
          +
        </div>
      </button>
      <div
        className={`will-change-transform transition-[max-width] ease duration-[350ms] ${showCreate ? 'max-w-80' : 'max-w-0'}
         ${overflowHidden ? 'overflow-hidden' : 'overflow-initial'}`}>
        <OrderForm
          action={'CREATE'}
          itemTypes={itemTypes}
          itemStockById={itemStockById}
          onSubmit={async (prev, next) => {
            const result = await onSubmit(prev, next);
            await mutate('/api/order/todo');

            return result;
          }}
        />
      </div>
    </div>
  );
}
