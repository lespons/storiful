'use server';
import React from 'react';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import ItemTypeForm, { ItemType } from '@/components/ItemTypeForm';

async function getProps() {
  const itemTypes = await unstable_cache(
    () =>
      prisma.itemType.findMany({
        include: {
          ItemChild: true
        }
      }),
    ['item_types_edit'],
    {
      tags: ['item_types_edit']
    }
  )();
  return {
    itemTypes
  };
}

export default async function ItemTypeCreatePage() {
  const { itemTypes } = await getProps();

  const submitData = async (values: ItemType) => {
    'use server';
    try {
      const result = await prisma.itemType.create({
        data: {
          name: values.name,
          type: values.type,
          ItemChild: {
            createMany: {
              data: values.children.map((c) => ({
                itemTypeId: c.itemTypeId,
                quantity: c.quantity
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
      revalidateTag('item_types_edit');
      revalidatePath('/', 'page');
      revalidatePath('/stock', 'page');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <ItemTypeForm
        action={'CREATE'}
        onSubmit={submitData}
        itemsList={itemTypes.map(({ name, ItemChild, id, type }) => ({
          id: id!,
          name,
          type: type,
          children: ItemChild.map((ch) => {
            const it = itemTypes.find((it) => it.id === ch.itemTypeId)!;

            return {
              id: it.id,
              name: it.name,
              itemTypeId: ch.itemTypeId,
              quantity: ch.quantity
            };
          })
        }))}
      />
    </>
  );
}
