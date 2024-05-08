'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { SelectBox } from '@/components/SelectBox';
import { useFieldArray, useForm } from 'react-hook-form';

export type OrderFormValue = {
  id?: string;
  name?: string;
  items: {
    id?: string;
    itemId: string;
    name: string;
    quantity: number;
    children: { name: string; quantity: number }[];
  }[];
};

export interface OrderFormProps {
  itemTypes: { id: string; name: string; children: { name: string; quantity: number }[] }[];
  onSubmit: (
    prevstate: { order: OrderFormValue },
    state: { order: OrderFormValue }
  ) => Promise<{ order: OrderFormValue }>;
  onReset?: () => void;
  order?: OrderFormValue;
  action: 'CREATE' | 'UPDATE';
}

function OrderSubmit({
  action,
  disabled
}: {
  action: OrderFormProps['action'];
  disabled: boolean;
}) {
  const { pending, ...rest } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`px-3 py-2 rounded-md ${pending || disabled ? 'bg-gray-900 bg-opacity-5' : 'bg-indigo-500 text-white hover:bg-indigo-700'} font-bold`}>
      {pending ? '...' : action.toLowerCase()}
    </button>
  );
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onReset, itemTypes, order, action }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{ order: OrderFormValue; error?: string; success?: boolean }>({
    defaultValues: { order }
  });

  const {
    fields: orderItems,
    append,
    update,
    remove,
    replace
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

  const [state, formAction, isPending] = useFormState(onSubmit, {
    order: {
      items: []
    }
  });

  const error = errors.order?.items?.root?.message;
  return (
    <form
      action={handleSubmit(formAction) as unknown as (formData: FormData) => void}
      className="flex flex-col bg-fuchsia-700 bg-opacity-5 px-5 py-4 rounded-md min-w-64">
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
              itemId: item.id,
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
                key={orderItem.itemId}
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

      <OrderSubmit action={action} disabled={!orderItems.length} />

      {order || orderItems.length ? (
        <button
          className={`mt-2 px-3 py-0 rounded-md hover:text-red-900 font-light text-sm`}
          onClick={() => {
            reset();
            replace([]);
            onReset?.();
          }}>
          reset
        </button>
      ) : null}
      {error ? (
        <p className="text-red-700 bg-red-100 rounded-md m-auto mt-5 p-2 text-center text-sm font-bold">
          {error}
        </p>
      ) : undefined}
    </form>
  );
};

export default OrderForm;
