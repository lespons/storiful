'use client';

import React, { Fragment } from 'react';
import { SelectBox } from '@/components/SelectBox';
import { RadioGroup } from '@headlessui/react';
import { useFormState, useFormStatus } from 'react-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import FileSelector from '@/components/FileSelector';
import { CheckBadgeIcon, ShoppingBagIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

export const ItemTypeUnits = {
  distance: {
    mm: [0, 'millimeter'],
    cm: [1, 'centimeter'],
    m: [2, 'meter'],
    km: [3, 'kilometer']
  },
  counts: {
    pcs: [4, 'pieces']
  },
  volume: {
    g: [8, 'gram'],
    ml: [5, 'milliliter'],
    l: [6, 'liter'],
    m_3: [7, 'm³']
  }
};

export const ItemTypeUnitsNames: { [key: string]: string } = Object.values(ItemTypeUnits)
  .map((unit) =>
    Object.entries(unit).map(([key, value]) => {
      return [key, value[0]];
    })
  )
  .flat()
  .reduce(
    (result, curr) => {
      result[String(curr[1])] = String(curr[0]);
      return result;
    },
    {} as { [key: string]: string }
  );
export interface ItemType {
  id: string;
  name: string;
  type: 'INVENTORY' | 'PRODUCT';
  image?: string | null;
  unit?: number | null;
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
      className={`mt-2 px-3 py-1 rounded-md ${pending ? 'bg-gray-900/5' : 'bg-amber-300 hover:bg-amber-400'} font-bold`}>
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

  const unitItems = Object.values(ItemTypeUnits)
    .map((value) => {
      return Object.entries(value).map(([key, value]) => ({
        id: String(value[0]),
        name: `${value[1]}  (${key})`
      }));
    })
    .flat();
  const [state, formAction] = useFormState(onSubmit, defaultValues as ItemTypeFormValuesType);
  return (
    <form
      action={handleSubmit(formAction) as unknown as (formData: FormData) => void}
      className="flex flex-col w-96">
      <div className={'flex gap-2'}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name:
          </label>
          <input
            type="text"
            {...register(`itemType.name`)}
            id="name"
            placeholder="item type name"
            className={`w-full px-3 py-1 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.itemType?.name ? 'border-red-500' : ''
            }`}
          />
          {/*<ErrorMessage name="name" component="div" className="text-red-700 font-bold text-xs" />*/}
        </div>
        <div className="mb-4">
          <label htmlFor="children" className="block text-gray-700 text-sm font-bold mb-2">
            Unit
          </label>
          <SelectBox
            id={'itemTypeUnit'}
            items={unitItems ?? []}
            showDisplayValue={true}
            initialItem={
              itemType?.unit
                ? {
                    id: String(itemType.unit),
                    name: unitItems.find(({ id }) => Number(id) === itemType.unit)!.name
                  }
                : null
            }
            onSelect={(unit) => {
              if (!unit) {
                return;
              }

              setValue('itemType.unit', Number(unit.id));
            }}
          />
        </div>
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
            {
              name: 'INVENTORY',
              desc: 'what you buy',
              icon: <ShoppingBagIcon className={'size-5'} />
            },
            {
              name: 'PRODUCT',
              desc: 'what you produce',
              icon: <WrenchScrewdriverIcon className={'size-5'} />
            }
          ].map(({ name, desc, icon }) => (
            <RadioGroup.Option
              key={name}
              value={name}
              className={({ active, checked }) =>
                `${active ? 'ring-2 ring-amber-900 ring-opacity-40' : ''}
                  ${checked ? 'bg-amber-200' : 'bg-white bg-opacity-0 hover:bg-opacity-50 shadow-md '}
                    relative flex cursor-pointer rounded-md px-4 py-2 focus:outline-none mb-2`
              }>
              {({ active, checked }) => (
                <div className={`flex w-full items-center justify-between`}>
                  <div className="flex flex-col">
                    <RadioGroup.Label
                      as="p"
                      className={`flex gap-2 font-semibold  ${checked ? '' : 'text-gray-900'}`}>
                      {name.toLowerCase()} {icon}
                    </RadioGroup.Label>
                    <RadioGroup.Description as="span" className={`font-light`}>
                      {desc}
                    </RadioGroup.Description>
                  </div>
                  {checked ? <CheckBadgeIcon className={'size-5 text-amber-950'} /> : null}
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
          id={'itemTypeChild'}
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
              <label htmlFor={v.itemTypeId}>- {v.name}</label>
              <div className="flex flex-row gap-2">
                <input
                  id={v.itemTypeId}
                  type="number"
                  {...register(`itemType.children.${index}.quantity`)}
                  className={`w-full px-3 py-2 rounded-md  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
      <FileSelector
        onChange={(url) => {
          setValue('itemType.image', url);
        }}
        initValue={defaultValues?.itemType?.image}
      />
      <ItemTypeSubmit action={action} />
    </form>
  );
};

export default ItemTypeForm;
