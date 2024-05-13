'use client';
import OrderForm, { OrderFormProps } from '@/components/order/OrderForm';
import { mutate } from 'swr';

export function OrderCreateClient({
  itemTypes,
  onSubmit
}: Pick<OrderFormProps, 'onSubmit' | 'itemTypes'>) {
  return (
    <OrderForm
      action={'CREATE'}
      itemTypes={itemTypes}
      onSubmit={async (prev, next) => {
        const result = await onSubmit(prev, next);
        await mutate('/api/order/todo');

        return result;
      }}
    />
  );
}
