import React from 'react';
import ItemTypeForm from '@/components/ItemTypeForm';
import { getCachedItemTypesForEdit } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';
import { createItemType } from '@/app/itemtype/_actions/createItemType';

async function getProps() {
  const itemTypes = await getCachedItemTypesForEdit();
  return {
    itemTypes
  };
}

export default async function ItemTypeCreatePage() {
  const { itemTypes } = await getProps();
  return (
    <ItemTypeForm
      action={'CREATE'}
      onSubmit={createItemType}
      itemsList={itemTypes.map((itemType) => mapItemType(itemTypes, itemType))}
    />
  );
}
