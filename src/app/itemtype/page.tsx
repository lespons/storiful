import React from 'react';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import ItemTypeForm, { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import { getItemTypes, ItemTypesReturnType } from '@/app/lib/actions/itemType';

async function getProps() {
  const itemTypes = await unstable_cache(() => getItemTypes(), ['item_types_edit'], {
    tags: ['item_types_edit']
  })();
  return {
    itemTypes
  };
}

export function mapItemType(
  itemTypes: ItemTypesReturnType,
  { id, name, type, ItemChild }: ItemTypesReturnType[0]
) {
  return {
    id: id!,
    name,
    type: type,
    children: ItemChild.map((ch) => {
      const it = itemTypes.find((it) => it.id === ch.itemTypeId)!;

      return {
        id: ch.id,
        name: it.name,
        itemTypeId: ch.itemTypeId,
        quantity: ch.quantity
      };
    })
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
