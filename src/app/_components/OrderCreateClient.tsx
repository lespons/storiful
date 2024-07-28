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
          'ease duration-[150ms] overflow-hidden transition-[width, transform] font-bold  min-w-10 ' +
          (showCreate
            ? 'w-full rounded-t-md right-0 text-center bg-black text-white'
            : 'w-full rounded-md')
        }
        onClick={openCreateOrder}>
        <div
          className={
            'flex gap-1 w-full justify-end bg-fuchsia-900/10 hover:bg-fuchsia-900/20 px-2 transition-[width, transform] ease-in-out duration-[250ms]'
          }>
          create
          <PlusIcon className={'size-5 text-fuchsia-800 my-auto'} />
        </div>
      </button>
      <div
        className={`shadow-md overflow-auto bg-white will-change-transform transition-[max-width] rounded-b-md ease duration-[150ms] ${showCreate ? 'max-w-96 max-h-[80vh]' : 'max-w-0 max-h-0'}
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
