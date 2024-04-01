'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ItemStock, ItemType } from '@prisma/client';
import ItemChangeForm from '@/components/ItemChangeForm';

export async function ItemStockEditView({ itemStock }: { itemStock: ItemStock[] }) {
  const submitData = async (prevData: any, values: { items: { id: string; value: number }[] }) => {
    'use server';
    try {
      return {
        items: [
          await Promise.all(
            values.items.map((value) => {
              return prisma.itemStock.update({
                where: {
                  id: value.id
                },
                data: {
                  value: value.value
                }
              });
            })
          )
        ],
        success: true
      };
    } catch (e) {
      console.error(e);
      return { error: (e as { message: string }).message };
    } finally {
      revalidatePath('/stock');
      revalidatePath('/order');
    }
  };

  return (
    <>
      <ItemChangeForm
        items={itemStock.map((item) => ({
          id: item.id,
          value: item.value,
          itemTypeName: (item as unknown as { ItemType: ItemType }).ItemType.name
        }))}
        fieldsToChange={['value']}
        fieldsToView={['itemTypeName']}
        onSubmit={submitData as unknown as (values: unknown) => void}
      />
    </>
  );
}
