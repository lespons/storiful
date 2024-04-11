'use client';

import React, { Fragment } from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import * as Yup from 'yup';
import { SelectBox } from '@/components/SelectBox';

export interface ItemType {
  id: string;
  name: string;
  children: {
    id?: string;
    name: string;
    itemTypeId: string;
    quantity: number;
  }[];
}

interface ItemTypeFormProps {
  itemsList: ItemType[];
  onSubmit: (values: ItemType) => void;
}

const ItemSchema = Yup.object().shape({
  name: Yup.string().required('Name is required')
});

const ItemTypeForm: React.FC<ItemTypeFormProps> = ({ onSubmit, itemsList }) => {
  return (
    <Formik
      initialValues={{ id: '', name: '', children: [] } as ItemType}
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
                // setItems(items.filter((item) => !values.children.some(({ id }) => id === item.id)));
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
                  <Field
                    type="number"
                    name={`children[${index}].quantity`}
                    className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                </div>
              ))}
            </>
          </div>

          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold">
            Create
          </button>
        </form>
      )}
    </Formik>
  );
};

export default ItemTypeForm;
