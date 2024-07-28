'use client';

import React, { startTransition, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';

export type OrderFormValue = {
  id?: string;
  name?: string;
  deadline?: string | null;
  details?: string | null;
  pending?: boolean; //TODO use to show pending state
  items: {
    id?: string;
    itemId: string;
    name: string;
    quantity: number;
    children: { name: string; quantity: number; itemTypeId: string }[];
  }[];
};

export interface OrderFormProps {
  itemTypes: {
    id: string;
    name: string;
    children: { name: string; quantity: number; itemTypeId: string }[];
    type: 'INVENTORY' | 'PRODUCT';
  }[];
  onSubmit: (
    prevstate: { order: OrderFormValue },
    state: { order: OrderFormValue }
  ) => Promise<{ order: OrderFormValue }>;
  onReset?: () => void;
  order?: OrderFormValue;
  action: 'CREATE' | 'UPDATE';
  itemStockById?: { [id: string]: number };
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
      className={`px-3 py-1 rounded-md ${pending || disabled ? 'bg-gray-900 bg-opacity-5' : 'bg-blue-600 text-white hover:bg-blue-700'} font-bold`}>
      {pending ? '...' : action.toLowerCase()}
    </button>
  );
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onReset,
  itemTypes,
  order,
  action,
  itemStockById
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{ order: OrderFormValue; error?: string; success?: boolean }>({
    defaultValues: {
      order
    }
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

  const [state, formAction] = useFormState(onSubmit, {
    order: {
      items: []
    }
  });

  const calcMaxToCreate = (orderItem: (typeof orderItems)[0] | (typeof itemTypes)[0]) => {
    let min = Number.MAX_SAFE_INTEGER;

    for (const children of orderItem.children) {
      min = Math.min(
        min,
        Math.floor((itemStockById?.[children.itemTypeId] ?? 0) / children.quantity)
      );
    }
    return min > 0 ? min : 0;
  };

  const error = errors.order?.items?.root?.message;
  return (
    <form
      action={handleSubmit(formAction) as unknown as (formData: FormData) => void}
      className="bg-fuchsia-900/10 flex flex-col px-5 py-4 rounded-b-md min-w-96">
      <div className="mb-2 flex flex-col">
        <div>
          <label htmlFor={'deadline'} className="block text-gray-700 text-sm font-bold mb-2">
            Deadline
          </label>
          <input
            id={'deadline'}
            {...register(`order.deadline`, {
              valueAsDate: false
            })}
            type={'date'}
            className={`w-full px-2 py-1 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
        </div>
        <div>
          <label htmlFor={'deadline'} className="block text-gray-700 text-sm font-bold mb-2">
            Details
          </label>
          <textarea
            id={'details'}
            {...register(`order.details`)}
            rows={2}
            className={`w-full px-2 py-1 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
        </div>
      </div>

      <div className="flex flex-col mb-2">
        <OrderItemSelector
          calcMaxToCreate={calcMaxToCreate}
          itemTypes={itemTypes
            .filter((item) => !orderItems.some(({ itemId }) => itemId === item.id))
            .sort((it1, it2) => it2.type.localeCompare(it1.type))}
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
        {orderItems.length ? (
          <div className="mt-2 overflow-auto max-h-60">
            {orderItems.map((orderItem, index) => (
              <div
                key={orderItem.itemId}
                data-testid={`orderitem_${orderItem.name}`}
                className="font-semibold not-first:mt-2 rounded-md py-2 px-4 text-sm bg-white bg-opacity-30">
                <div className={'text-base text-green-800'}>{orderItem.name}</div>

                <div className="flex flex-row gap-2 mt-1">
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
                    className={`w-full px-2 py-1 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(index);
                    }}>
                    🗑
                  </button>
                </div>
                <table className={'table-auto border-collapse text-xs w-full mt-2'}>
                  {orderItem.children?.length && itemStockById ? (
                    <caption className={'font-normal caption-top mb-1'}>
                      you may create <b>({calcMaxToCreate(orderItem)})</b> from:
                    </caption>
                  ) : null}
                  {orderItem.children?.length ? (
                    <tbody>
                      {orderItem.children.map((c) => (
                        <tr
                          key={c.name}
                          className={`table-row odd:bg-white/70 ${(itemStockById?.[c.itemTypeId] ?? 0) < orderItem.quantity * c.quantity ? 'text-red-700' : ''}`}>
                          <td className={'table-cell border-black/70 px-1'}>{c.name}</td>
                          <td className={'table-cell whitespace-nowrap px-1 border'}>
                            -{orderItem.quantity * c.quantity}
                          </td>
                          {itemStockById && (
                            <td className={'table-cell whitespace-nowrap px-1'}>
                              {itemStockById?.[c.itemTypeId] ?? 0}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  ) : null}
                </table>
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

const OrderItemSelector = ({
  itemTypes,
  onSelect,
  calcMaxToCreate
}: Pick<OrderFormProps, 'itemStockById' | 'itemTypes'> & {
  onSelect: (item: (typeof itemTypes)[0]) => void;
  calcMaxToCreate: (orderItem: (typeof itemTypes)[0]) => number;
}) => {
  const [search, setSearch] = useState<string | null>(null);
  return (
    <div>
      <div className={'flex gap-2 py-2'}>
        <label htmlFor="children" className="block text-gray-700 text-sm font-bold text-nowrap">
          Item selector
        </label>
        <input
          id={'children'}
          type={'text'}
          className={'rounded-md px-2 w-full'}
          placeholder={'search'}
          onChange={(element) => {
            startTransition(() => {
              setSearch(element.target.value);
            });
          }}
        />
      </div>
      <div id="orderItemType" className={'max-h-28 overflow-auto flex flex-col gap-1'}>
        {itemTypes
          .filter((it) =>
            search ? it.name.toLowerCase().indexOf(search.toLowerCase()) >= 0 : true
          )
          .map((it) => (
            <div
              key={it.id}
              data-testid={it.name}
              className={
                'group/children flex justify-between px-4 py-1 bg-white rounded-md hover:cursor-pointer hover:bg-green-100'
              }
              onClick={() => onSelect(it)}>
              <div>{it.name}</div>
              {it.type === 'PRODUCT' ? <div>{calcMaxToCreate(it)}</div> : null}
            </div>
          ))}
      </div>
    </div>
  );
};
