import React from 'react';
import { unstable_cache } from 'next/cache';
import ItemTypeForm from '@/components/ItemTypeForm';
import { getItemTypes } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';
import { createItemType } from '@/app/itemtype/_actions/createItemType';

async function getProps() {
  const itemTypes = await unstable_cache(() => getItemTypes(), ['item_types_edit'], {
    tags: ['item_types_edit']
  })();
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
