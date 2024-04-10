'use server';

import prisma from '@/lib/prisma';
import ItemTypeForm, { ItemType } from '@/components/ItemTypeForm';
import { revalidatePath } from 'next/cache';

export async function ItemTypeView({ itemsTypes }: { itemsTypes: ItemType[] }) {
  const submitData = async (values: ItemType) => {
    'use server';
    try {
      const result = await prisma.itemType.create({
        data: {
          name: values.name,
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
      revalidatePath('/order', 'page');
      revalidatePath('/', 'page');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <ItemTypeForm onSubmit={submitData} itemsList={itemsTypes} />
    </>
  );
}
