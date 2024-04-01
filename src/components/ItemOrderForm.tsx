'use client';

import React, { useEffect } from 'react';
import { Field, Formik } from 'formik';
import { useFormState } from 'react-dom';
import { SelectBox } from '@/components/SelectBox';
import { mutate } from 'swr';

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

const OrderOrderForm: React.FC<OrderFormProps> = ({ onSubmit, itemTypes }) => {
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

  return (
    <Formik initialValues={{ order: state.order }} onSubmit={formAction}>
      {(
        { values, setFieldValue, handleChange, handleBlur, handleSubmit, errors },
        disabled = isPending || values.order.items?.length === 0
      ) => (
        <form onSubmit={handleSubmit} className="flex flex-col max-w-52">
          <div className="mb-2">
            <label htmlFor="children" className="block text-gray-700 text-sm font-bold mb-2">
              Item selector
            </label>
            <SelectBox
              name="children"
              items={
                itemTypes
                  .filter((item) => !values.order.items.some(({ id }) => id === item.id))
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
                values.order.items.push({
                  name: item.name,
                  id: item.id,
                  children: item.children as OrderFormProps['itemTypes'][0]['children'],
                  quantity: 0
                });
                // setItems(items.filter((item) => !values.children.some(({ id }) => id === item.id)));
                setFieldValue('order.items', values.order.items);
              }}
            />
            {values.order.items?.length ? (
              <div className="bg-fuchsia-700 bg-opacity-10 rounded-md mt-2 py-2 px-4">
                {values.order.items.map((v, index) => (
                  <div key={v.id} className="text-xs font-bold">
                    <div>{v.name}</div>
                    <Field
                      type="number"
                      name={`order.items[${index}].quantity`}
                      placeholder=""
                      className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {v.children?.length ? (
                      <div className="pt-2 font-normal">
                        <label>These items will be used:</label>
                        {v.children.map((c) => (
                          <div key={c.name} className="text-red-700">
                            - {c.quantity} pcs of {c.name}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className={`px-3 py-2 rounded-md ${disabled ? 'bg-gray-900 bg-opacity-5' : 'bg-indigo-500 text-white hover:bg-indigo-700'} font-bold`}>
            Create
          </button>

          {/*{state?.success ? (*/}
          {/*  <p className="text-green-700 font-bold bg-green-100 rounded-2xl m-auto mt-5 p-2">*/}
          {/*    Success!*/}
          {/*  </p>*/}
          {/*) : undefined}*/}
          {state?.error ? (
            <p className="text-red-700 font-bold bg-red-100 rounded-2xl m-auto mt-5 p-2">
              Fail! Try Again later (${state.error})
            </p>
          ) : undefined}
        </form>
      )}
    </Formik>
  );
};

export default OrderOrderForm;
