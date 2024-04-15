'use client';

import React, { Fragment } from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import * as Yup from 'yup';
import { SelectBox } from '@/components/SelectBox';
import { RadioGroup } from '@headlessui/react';

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

interface ItemTypeFormProps {
  action: 'CREATE' | 'UPDATE';
  itemsList: ItemType[];
  onSubmit: (values: ItemType) => void;
  itemType?: ItemType;
}

const ItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required')
});

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({ action, onSubmit, itemsList, itemType }) => {
  return (
    <Formik
      initialValues={
        (itemType ?? { id: '', name: '', type: 'INVENTORY', children: [] }) as ItemType
      }
      validationSchema={ItemSchema}
      onSubmit={(values) => onSubmit(values)}>
      {({ values, setFieldValue, handleChange, handleBlur, handleSubmit, errors }) => (
        <form onSubmit={handleSubmit} className="flex flex-col max-w-52">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Name:
            </label>
            <Field
              type="text"
              name="name"
              id="name"
              placeholder="Enter item type name"
              className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : ''
              }`}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <ErrorMessage name="name" component="div" className="text-red-700 font-bold text-xs" />
          </div>
          <div className="mb-4">
            <RadioGroup
              value={values.type}
              onChange={(value) => {
                setFieldValue('type', value);
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
                  .filter(
                    (item) => !values.children.some(({ itemTypeId }) => itemTypeId === item.id)
                  )
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
                values.children.push({
                  name: item.name,
                  itemTypeId: item.id,
                  quantity: 0
                });

                setFieldValue('children', values.children);
              }}
            />

            <>
              <div className={'text-xs py-2'}>
                {values.children?.length > 0 ? 'Children of new item:' : 'No children to add'}
              </div>
              {values.children.map((v, index) => (
                <div key={v.itemTypeId} className="text-xs font-bold">
                  <div>- {v.name}</div>
                  <div className="flex flex-row gap-2">
                    <Field
                      type="number"
                      name={`children[${index}].quantity`}
                      className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        values.children = values.children.filter(
                          (children) => children.itemTypeId !== v.itemTypeId
                        );
                        setFieldValue('children', values.children);
                        // remove(index);
                      }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </>
          </div>

          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold">
            {action?.toLowerCase()}
          </button>
        </form>
      )}
    </Formik>
  );
};

export default ItemTypeForm;
