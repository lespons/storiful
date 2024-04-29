'use client';

import React, { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { SelectBox } from '@/components/SelectBox';
import { mutate } from 'swr';
import { useFieldArray, useForm } from 'react-hook-form';

export type OrderFormValue = {
  name?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    children: { name: string; quantity: number }[];
  }[];
};

export interface OrderFormProps {
  itemTypes: { id: string; name: string; children: { name: string; quantity: number }[] }[];
  onSubmit: (state: { order: OrderFormValue }) => Promise<{ order: OrderFormValue }>;
}

function OrderSubmit() {
  const { pending, ...rest } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-3 py-2 rounded-md ${pending ? 'bg-gray-900 bg-opacity-5' : 'bg-indigo-500 text-white hover:bg-indigo-700'} font-bold`}>
      {pending ? 'Creating' : 'Create'}
    </button>
  );
}

const OrderOrderForm: React.FC<OrderFormProps> = ({ onSubmit, itemTypes }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<{ order: OrderFormValue; error?: string; success?: boolean }>();

  const {
    fields: orderItems,
    append,
    update,
    remove
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'order.items',
    keyName: 'k',
    rules: {
      required: true,
      validate: {
        itemsCount: (items) => {
          const itemWithZero = items.find((v) => v.quantity <= 0);
          return itemWithZero
            ? `Error: ${itemWithZero.name} count must be > 0. Please adjust and try again.`
            : true;
        }
      }
    }
  });

  const [state, formAction, isPending] = useFormState<{
    order: OrderFormValue;
    error?: string;
    success?: boolean;
  }>(onSubmit, {
    order: {
      items: []
    }
  });

  useEffect(() => {
    if (state.success) {
      mutate('/api/order/todo');
    }
  }, [state]);

  const error = state.error || errors.order?.items?.root?.message;
  return (
    <form
      action={handleSubmit(formAction) as typeof formAction}
      className="flex flex-col bg-fuchsia-700 bg-opacity-5 px-5 py-4 rounded-md min-w-64 max-w-80">
      <div className="mb-2">
        <label htmlFor="children" className="block text-gray-700 text-sm font-bold mb-2">
          Item selector
        </label>
        <SelectBox
          items={
            itemTypes
              .filter((item) => !orderItems.some(({ id }) => id === item.id))
              .map(({ name, id, children }) => ({
                name,
                id,
                children
              })) ?? []
          }
          onSelect={(item) => {
            if (!item) {
              return;
            }
            append({
              name: item.name,
              id: item.id,
              children: item.children as OrderFormProps['itemTypes'][0]['children'],
              quantity: 0
            });
          }}
        />
        {orderItems.length ? <div className="text-sm mt-2">Items to complete:</div> : null}
        {orderItems.length ? (
          <div className="mt-2">
            {orderItems.map((orderItem, index) => (
              <div
                key={orderItem.id}
                className="text-xs font-bold not-first:pt-2 hover:drop-shadow-lg rounded-md px-4 py-2">
                <div>{orderItem.name}</div>

                <div className="flex flex-row gap-2">
                  <input
                    type="number"
                    placeholder=""
                    {...register(`order.items.${index}.quantity`)}
                    onChange={({ target: { value } }) => {
                      update(index, {
                        ...orderItem,
                        quantity: Number(value)
                      });
                    }}
                    className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(index);
                    }}>
                    🗑
                  </button>
                </div>
                {orderItem.children?.length ? (
                  <div className="pt-2 font-normal">
                    <label>These items will be used:</label>
                    {orderItem.children.map((c) => (
                      <div key={c.name} className="text-red-700">
                        - {orderItem.quantity * c.quantity} pcs of {c.name}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <OrderSubmit />

      {error ? (
        <p className="text-red-700 bg-red-100 rounded-md m-auto mt-5 p-2 text-center text-sm font-bold">
          {error}
        </p>
      ) : undefined}
    </form>
  );
};

export default OrderOrderForm;
