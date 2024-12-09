import { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getItemType } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';
import { revalidatePath, revalidateTag } from 'next/cache';

export const updateItemType = async (
  _: ItemTypeFormValuesType,
  { itemType }: ItemTypeFormValuesType,
  itemTypes: { id: string; name: string; type: ItemTypeFormValuesType['itemType']['type'] }[]
): Promise<ItemTypeFormValuesType> => {
  'use server';
  try {
    await prisma.$transaction(async (tx) => {
      const childrenQuantity = itemType.children.reduce(
        (result, curr) => {
          result[curr.itemTypeId] = curr.quantity;
          return result;
        },
        {} as { [itemTypeId: string]: number }
      );
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
      const prevItemType = await tx.itemType.findUniqueOrThrow({
        where: {
          id: itemType.id
        },
        include: {
          ItemChild: true
        }
      });

      const childrenToDelete = prevItemType.ItemChild.filter((prevItemChild) => {
        return !itemType.children.some(
          ({ id: actualChildId }) => prevItemChild.id === actualChildId
        );
      });
      const childrenToUpdate = itemType.children.filter((actualChild) => {
        return prevItemType.ItemChild.some(({ id: prevChildId }) => actualChild.id === prevChildId);
      });

      const childrenToAdd = itemType.children.filter((actualChild) => !actualChild.id);
      await tx.itemType.update({
        where: {
          id: itemType.id
        },
        data: {
          name: itemType.name,
          type: itemType.type,
          image: itemType.image,
          unit: itemType.unit,
          cost: childCosts.reduce(
            (acc, curr) =>
              curr.prices?.[0]?.price
                ? acc.add(curr.prices[0].price.mul(childrenQuantity[curr.id]))
                : acc.add(curr.cost ?? 0),
            new Prisma.Decimal(0)
          ),
          ItemChild: {
            deleteMany: {
              id: { in: childrenToDelete.map(({ id }) => id) }
            },
            createMany: {
              data: childrenToAdd.map((c) => ({
                itemTypeId: c.itemTypeId,
                quantity: Number(c.quantity)
              }))
            }
          },
          ...(itemType.newPrice && itemType.newPrice > 0
            ? {
                prices: {
                  create: {
                    price: new Prisma.Decimal(itemType.newPrice),
                    type: itemType.type === 'PRODUCT' ? 'SELL' : 'BUY'
                  }
                }
              }
            : {})
        }
      });

      for (const cu of childrenToUpdate) {
        await tx.itemChild.update({
          where: {
            id: cu.id
          },
          data: {
            quantity: Number(cu.quantity)
          }
        });
      }
    });

    const newItemType = await getItemType(itemType.id);

    if (!newItemType) {
      throw Error('Item is not found');
    }

    return {
      success: true,
      itemType: mapItemType(itemTypes, {
        id: newItemType.id,
        type: newItemType.type,
        name: newItemType.name,
        image: newItemType.image,
        ItemChild: newItemType.ItemChild,
        unit: newItemType.unit,
        prices: newItemType.prices,
        cost: newItemType.cost
      })
    };
  } catch (error) {
    console.error(error);

    return {
      error:
        'message' in (error as { message: string })
          ? ((error as { message: string }).message as string)
          : 'unknown error',
      itemType
    };
  } finally {
    revalidateTag('item_types_edit');
    revalidatePath('/', 'layout');
  }
};
