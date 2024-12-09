import { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

export const createItemType = async (
  prevvalues: ItemTypeFormValuesType,
  { itemType }: ItemTypeFormValuesType
): Promise<ItemTypeFormValuesType> => {
  'use server';
  try {
    await prisma.$transaction(async (tx) => {
      const childCosts = await tx.itemType.findMany({
        where: {
          id: {
            in: itemType.children.map((c) => c.itemTypeId)
          }
        },
        select: {
          id: true,
          cost: true,
          prices: {
            where: {
              type: 'BUY'
            },
            orderBy: {
              date: 'desc'
            },
            take: 1
          }
        }
      });

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
          cost: childCosts.reduce(
            (acc, curr) => (curr.cost ? acc.add(curr.cost) : acc.add(curr.prices[0].price ?? 0)),
            new Prisma.Decimal(0)
          ),
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
