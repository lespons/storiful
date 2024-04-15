'use client';

import React from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import { useFormState } from 'react-dom';

export interface ItemTypeFormProps {
  items: { id: string; value: number; versionLock: number }[];
  fieldsToChange: string[];
  fieldsToView?: string[];
  onSubmit: (
    prevValues: { items: ItemTypeFormProps['items'] },
    values: { items: ItemTypeFormProps['items'] }
  ) => Promise<{ items: ItemTypeFormProps['items']; error?: string; success?: boolean }>;
}

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({
  onSubmit,
  items,
  fieldsToChange,
  fieldsToView
}) => {
  // TODO fix types
  const [state, formAction, isPending] = useFormState<{
    items: { id: string; value: number; versionLock: number }[];
    error: undefined;
    success: undefined;
  }>(onSubmit as any, {
    items,
    error: undefined,
    success: undefined
  });
  return (
    <Formik initialValues={{ items: state.items }} enableReinitialize={true} onSubmit={formAction}>
      {({ values, setFieldValue, handleChange, handleBlur, handleSubmit, errors }) => (
        <form onSubmit={handleSubmit} className="flex flex-col">
          {values.items.map((item: unknown, index: number) => (
            <div
              className="flex flex-row justify-between gap-2"
              key={(item as { id: string })['id'] ?? index}>
              {fieldsToView?.map((fieldName) => {
                const val = (item as { [fieldName: string]: string })[fieldName];
                return (
                  <div key={val} className="text-nowrap pr-2 mt-2 font-bold">
                    {val}
                  </div>
                );
              })}
              <div>
                {fieldsToChange.map((fieldName) => (
                  <div className="mb-2" key={fieldName}>
                    <Field
                      type="number"
                      name={`items[${index}].${fieldName}`}
                      placeholder=""
                      className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                        (errors?.items?.[index] as unknown as { [fieldName: string]: string })?.[
                          fieldName
                        ]
                          ? 'border-red-500'
                          : ''
                      }`}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <ErrorMessage
                      name={`items[${index}].${fieldName}`}
                      component="div"
                      className="text-red-700 font-bold text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="px-3 py-2 my-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold">
            Update
          </button>

          {state?.success ? (
            <p className="text-green-700 font-bold bg-green-100 rounded-md m-auto mt-5 p-2">
              Success!
            </p>
          ) : undefined}
          {state?.error ? (
            <p className="text-red-700 font-bold bg-red-100 rounded-md m-auto mt-5 p-2">
              Fail! Try Again later
            </p>
          ) : undefined}
        </form>
      )}
    </Formik>
  );
};

export default ItemTypeForm;
