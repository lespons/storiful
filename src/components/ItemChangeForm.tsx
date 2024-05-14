'use client';

import React from 'react';
import { useFormState } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';

export interface ItemTypeFormProps {
  items: {
    id: string;
    value: number;
    versionLock: number;
    itemTypeName: string;
    itemType: string;
  }[];
  fieldsToChange: string[];
  fieldsToView?: string[];
  onSubmit: (
    prevValues: { items: ItemTypeFormProps['items'] },
    values: { items: ItemTypeFormProps['items'] }
  ) => Promise<{ items: ItemTypeFormProps['items']; error?: string; success?: boolean }>;
}

type ItemTypeFormFormState = {
  items: {
    id: string;
    value: number;
    versionLock: number;
    itemTypeName: string;
    itemType: string;
  }[];
  error: undefined;
  success: undefined;
};

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({
  onSubmit,
  items,
  fieldsToChange,
  fieldsToView
}) => {
  // TODO fix types
  const [state, formAction] = useFormState(onSubmit, {
    items,
    error: undefined,
    success: undefined
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ItemTypeFormFormState>({
    values: state as ItemTypeFormFormState
  });
  const { fields } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'items',
    keyName: 'k',
    rules: {
      required: true
    }
  });

  const rowsMap = { INVENTORY: 1, PRODUCT: 1 } as {
    [key: 'INVENTORY' | 'PRODUCT' | string]: number;
  };
  return (
    <form
      onSubmit={handleSubmit(formAction)}
      className="grid grid-cols-2 gap-x-6 gap-y-1 max-h-[75vh] overflow-auto p-2">
      {fields.map((item, index: number) => (
        <div
          className={`flex flex-row justify-between gap-2  pl-6 group hover:bg-black max-w-[45vw] 
                rounded-md ${rowsMap[item.itemType] % 2 === 0 ? 'bg-fuchsia-700 bg-opacity-0' : 'shadow-md bg-white bg-opacity-30'}`}
          style={{
            gridColumn: item.itemType === 'INVENTORY' ? 1 : 2,
            gridRow: String(rowsMap[item.itemType]++)
          }}
          key={(item as { id: string })['id'] ?? index}>
          <div
            key={item.id}
            className="group-hover:text-white whitespace-nowrap overflow-hidden min-w-0 max-w-fit pr-2 mt-2 font-bold overflow-ellipsis">
            {item.itemTypeName}
          </div>
          <div>
            {fieldsToChange.map((fieldName) => (
              <div key={fieldName}>
                <input
                  type="number"
                  {...register(`items.${index}.value`, {
                    valueAsNumber: true
                  })}
                  placeholder=""
                  className={`focus:font-bold w-32 px-3 py-2 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    (errors?.items?.[index] as unknown as { [fieldName: string]: string })?.[
                      fieldName
                    ]
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                {/*<ErrorMessage*/}
                {/*  name={`items[${index}].${fieldName}`}*/}
                {/*  component="div"*/}
                {/*  className="text-red-700 font-bold text-xs"*/}
                {/*/>*/}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="absolute bottom-0 left-0 flex justify-center gap-4 w-full bg-white py-2 bg-opacity-50">
        <div className="w-fit flex">
          <button
            type="submit"
            className="ml-auto px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold">
            update
          </button>

          {state?.success ? (
            <p className="text-green-700 font-bold rounded-md m-auto p-2">Success!</p>
          ) : undefined}
          {state?.error ? (
            <p className="text-red-700 font-bold bg-red-100 rounded-md m-auto mt-5 p-2">
              Fail! Try Again later
            </p>
          ) : undefined}
        </div>
      </div>
    </form>
  );
};

export default ItemTypeForm;
