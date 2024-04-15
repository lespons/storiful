'use server';
import React from 'react';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import ItemTypeForm, { ItemType } from '@/components/ItemTypeForm';

async function getProps() {
  const itemTypes = await prisma.itemType.findMany({
    include: {
      ItemChild: true
    }
  });
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
      revalidatePath('/itemtype', 'page');
      revalidatePath('/stock', 'page');
      revalidatePath('/', 'page');
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
