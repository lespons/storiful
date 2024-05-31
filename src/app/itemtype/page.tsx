import React from 'react';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import ItemTypeForm, { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import { getItemTypes } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';

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

  const submitData = async (
    prevvalues: ItemTypeFormValuesType,
    { itemType }: ItemTypeFormValuesType
  ): Promise<ItemTypeFormValuesType> => {
    'use server';
    try {
      const result = await prisma.itemType.create({
        data: {
          name: itemType.name,
          type: itemType.type,
          image: itemType.image,
          unit: itemType.unit,
          ItemChild: {
            createMany: {
              data: itemType.children.map((c) => ({
                itemTypeId: c.itemTypeId,
                quantity: Number(c.quantity)
              }))
            }
          }
        }
      });

      await prisma.itemStock.create({
        data: {
          value: 0,
          itemTypeId: result.id
        }
      });

      return {
        itemType: {
          id: '',
          children: [],
          name: '',
          type: 'INVENTORY'
        },
        success: true
      };
    } catch (error) {
      console.error(error);
      return {
        itemType,
        error:
          'message' in (error as { message: string })
            ? ((error as { message: string }).message as string)
            : 'unknown error'
      };
    } finally {
      revalidateTag('item_types_edit');
      revalidatePath('/', 'page');
      revalidatePath('/stock', 'page');
    }
  };

  return (
    <ItemTypeForm
      action={'CREATE'}
      onSubmit={submitData}
      itemsList={itemTypes.map((itemType) => mapItemType(itemTypes, itemType))}
    />
  );
}
