import { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { calcItemTypeCost } from '@/app/itemtype/_actions/itemTypes';

export const createItemType = async (
  prevvalues: ItemTypeFormValuesType,
  { itemType }: ItemTypeFormValuesType
): Promise<ItemTypeFormValuesType> => {
  'use server';
  try {
    await prisma.$transaction(async (tx) => {
      const result = await tx.itemType.create({
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
          },
          cost: await calcItemTypeCost(tx, itemType),
          ...(itemType.price && itemType.price > 0
            ? {
                prices: {
                  create: {
                    price: itemType.price,
                    type: itemType.type === 'PRODUCT' ? 'SELL' : 'BUY'
                  }
                }
              }
            : {})
        }
      });

      await tx.itemStock.create({
        data: {
          value: 0,
          itemTypeId: result.id
        }
      });
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
