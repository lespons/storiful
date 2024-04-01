'use client';

import React from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import { useFormState } from 'react-dom';

interface ItemTypeFormProps {
  items: unknown[];
  fieldsToChange: string[];
  fieldsToView?: string[];
  onSubmit: (values: { items: unknown[] }) => void;
}

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({
  onSubmit,
  items,
  fieldsToChange,
  fieldsToView
}) => {
  const [state, formAction, isPending] = useFormState(onSubmit as any, {
    items,
    error: undefined,
    success: undefined
  });
  return (
    <Formik initialValues={{ items: state.items }} onSubmit={formAction}>
      {({ values, setFieldValue, handleChange, handleBlur, handleSubmit, errors }) => (
        <form onSubmit={handleSubmit} className="flex flex-col max-w-52">
          {values.items.map((item: unknown, index: number) => (
            <div className="flex flex-row" key={(item as { id: string })['id'] ?? index}>
              {fieldsToView?.map((fieldName) => {
                const val = (item as { [fieldName: string]: string })[fieldName];
                return (
                  <div key={val} className="text-nowrap pr-2 mt-2 font-bold min-w-16">
                    {val}
                  </div>
                );
              })}
              <div>
                {fieldsToChange.map((fieldName) => (
                  <div className="mb-4" key={fieldName}>
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
            className="px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold">
            Update
          </button>

          {state?.success ? (
            <p className="text-green-700 font-bold bg-green-100 rounded-2xl m-auto mt-5 p-2">
              Success!
            </p>
          ) : undefined}
          {state?.error ? (
            <p className="text-red-700 font-bold bg-red-100 rounded-2xl m-auto mt-5 p-2">
              Fail! Try Again later
            </p>
          ) : undefined}
        </form>
      )}
    </Formik>
  );
};

export default ItemTypeForm;
