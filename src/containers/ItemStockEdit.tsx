'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ItemStock, ItemType } from '@prisma/client';
import ItemChangeForm, { ItemTypeFormProps } from '@/components/ItemChangeForm';
import { getStock } from '@/pages/api/item/stock';

function mapItemsStock(itemStock: ItemStock[]) {
  return itemStock.map((item) => ({
    id: item.id,
    value: item.value,
    itemTypeName: (item as unknown as { ItemType: ItemType }).ItemType.name,
    versionLock: item.lockVersion
  }));
}
export async function ItemStockEdit({ itemStock }: { itemStock: ItemStock[] }) {
  const submitData = async (
    prevData: { items: ItemTypeFormProps['items'] },
    values: { items: ItemTypeFormProps['items'] }
  ) => {
    'use server';

    try {
      const oldDataById = prevData.items.reduce(
        (result, item) => {
          result[item.id] = item.value;
          return result;
        },
        {} as { [itemId: string]: number }
      );
      await Promise.all(
        values.items
          .filter((value) => oldDataById[value.id] !== value.value)
          .map((value) => {
            return prisma.itemStock.update({
              where: {
                id: value.id,
                lockVersion: value.versionLock
              },
              data: {
                value: value.value,
                lockVersion: { increment: 1 }
              }
            });
          })
      );
      return {
        items: mapItemsStock(await getStock()),
        success: true
      };
    } catch (e) {
      console.error(e);
      return { error: (e as { message: string }).message, items: mapItemsStock(await getStock()) };
    } finally {
      revalidatePath('/stock');
      revalidatePath('/order');
      revalidatePath('/');
    }
  };

  return (
    <>
      <ItemChangeForm
        items={mapItemsStock(itemStock)}
        fieldsToChange={['value']}
        fieldsToView={['itemTypeName']}
        onSubmit={submitData}
      />
    </>
  );
}
