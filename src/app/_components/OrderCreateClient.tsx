'use client';
import OrderForm, { OrderFormProps } from '@/components/order/OrderForm';
import { mutate } from 'swr';
import { useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

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
    <div className={'absolute right-0 z-20 rounded-md will-change-transform'}>
      <button
        className={
          'ease transition-[width, transform] min-w-10 overflow-hidden font-bold duration-[150ms]' +
          (showCreate
            ? 'right-0 w-full rounded-t-md bg-black text-center text-white'
            : 'w-full rounded-md')
        }
        onClick={openCreateOrder}>
        <div
          className={
            'transition-[width, transform] flex w-full justify-end gap-1 bg-fuchsia-900/10 px-4 py-1 duration-[250ms] ease-in-out hover:bg-fuchsia-900/20'
          }>
          create
          <PlusIcon className={'my-auto size-5 text-fuchsia-800'} />
        </div>
      </button>
      <div
        className={`ease overflow-auto rounded-b-md bg-white shadow-md transition-[max-width] duration-[150ms] will-change-transform ${showCreate ? 'max-h-[80vh] max-w-96' : 'max-h-0 max-w-0'} ${overflowHidden ? 'overflow-hidden' : 'overflow-initial'}`}>
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
