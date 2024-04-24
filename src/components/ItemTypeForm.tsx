'use client';

import React, { Fragment, useEffect } from 'react';
import { SelectBox } from '@/components/SelectBox';
import { RadioGroup } from '@headlessui/react';
import { useFormState, useFormStatus } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';

export interface ItemType {
  id: string;
  name: string;
  type: 'INVENTORY' | 'PRODUCT';
  children: {
    id?: string;
    name: string;
    itemTypeId: string;
    quantity: number;
  }[];
}

export type ItemTypeFormValuesType = {
  itemType: ItemType;
  error?: string;
  success?: boolean;
};
interface ItemTypeFormProps {
  action: 'CREATE' | 'UPDATE';
  itemsList: ItemType[];
  onSubmit: (
    pvalues: ItemTypeFormValuesType,
    values: ItemTypeFormValuesType
  ) => Promise<ItemTypeFormValuesType>;
  itemType?: ItemType;
}

function ItemTypeSubmit({ action }: { action: string }) {
  const { pending, ...rest } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-3 py-2 rounded-md ${pending ? 'bg-gray-900 bg-opacity-5' : 'bg-indigo-500 text-white hover:bg-indigo-700'} font-bold`}>
      {pending ? '...' : action.toLowerCase()}
    </button>
  );
}

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({ action, onSubmit, itemsList, itemType }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, defaultValues }
  } = useForm<ItemTypeFormValuesType>({
    defaultValues: {
      itemType: itemType ?? {
        children: [],
        id: '',
        name: '',
        type: 'INVENTORY'
      },
      success: false
    },
    values: {
      itemType: itemType ?? {
        children: [],
        id: '',
        name: '',
        type: 'INVENTORY'
      }
    }
  });

  const {
    fields: children,
    append,
    remove
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormProvider)
    name: 'itemType.children',
    keyName: 'k',
    rules: {
      required: false,
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
  const [state, formAction] = useFormState(onSubmit, defaultValues as ItemTypeFormValuesType);
  useEffect(() => {
    if (state.success) {
      reset({
        itemType: state.itemType
      });
    }
  }, [state.success]);

  return (
    <form
      action={handleSubmit(formAction) as unknown as (formData: FormData) => void}
      className="flex flex-col max-w-52">
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          Name:
        </label>
        <input
          type="text"
          {...register(`itemType.name`)}
          id="name"
          placeholder="Enter item type name"
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.itemType?.name ? 'border-red-500' : ''
          }`}
        />
        {/*<ErrorMessage name="name" component="div" className="text-red-700 font-bold text-xs" />*/}
      </div>
      <div className="mb-4">
        <RadioGroup
          defaultValue={state.itemType.type}
          onChange={(value) => {
            setValue('itemType.type', value as 'PRODUCT' | 'INVENTORY');
          }}>
          <RadioGroup.Label className={'block text-gray-700 text-sm font-bold mb-2'}>
            Type
          </RadioGroup.Label>
          {[
            { name: 'INVENTORY', desc: 'what you buy' },
            { name: 'PRODUCT', desc: 'what you produce' }
          ].map(({ name, desc }) => (
            <RadioGroup.Option
              key={name}
              value={name}
              className={({ active, checked }) =>
                `${active ? 'ring-2 ring-fuchsia-100 ring-opacity-40' : ''}
                  ${checked ? 'bg-fuchsia-700 bg-opacity-20 shadow-sm ' : 'bg-white bg-opacity-0 hover:bg-opacity-50 shadow-md '}
                    relative flex cursor-pointer rounded-md px-4 py-2 drop-shadow-md focus:outline-none mb-2`
              }>
              {({ active, checked }) => (
                <div className={`flex w-full items-center justify-between`}>
                  <div className="flex flex-col">
                    <RadioGroup.Label
                      as="p"
                      className={`font-medium  ${checked ? '' : 'text-gray-900'}`}>
                      {name.toLowerCase()}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className={`inline ${checked ? 'text-sky-100' : 'text-gray-500'}`}>
                      {desc}
                    </RadioGroup.Description>
                  </div>
                  {checked ? <div>✔️</div> : null}
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
      {/* Add child item form fields here (nested or separate components) */}
      <div className="mb-4">
        <label htmlFor="children" className="block text-gray-700 text-sm font-bold mb-2">
          Children selector
        </label>
        <SelectBox
          items={
            itemsList
              .filter((item) => !children.some(({ itemTypeId }) => itemTypeId === item.id))
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
              itemTypeId: item.id,
              quantity: 0
            });
          }}
        />

        <>
          <div className={'text-xs py-2'}>
            {children?.length > 0 ? 'Children of new item:' : 'No children to add'}
          </div>
          {children.map((v, index) => (
            <div key={v.itemTypeId} className="text-xs font-bold">
              <div>- {v.name}</div>
              <div className="flex flex-row gap-2">
                <input
                  type="number"
                  {...register(`itemType.children.${index}.quantity`)}
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
            </div>
          ))}
        </>
      </div>

      <ItemTypeSubmit action={action} />
    </form>
  );
};

export default ItemTypeForm;
