import { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { getItemType, ItemTypesReturnType } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';
import { revalidatePath, revalidateTag } from 'next/cache';

export const updateItemType = async (
  { itemType: prevItemType2 }: ItemTypeFormValuesType,
  { itemType }: ItemTypeFormValuesType,
  itemTypes: ItemTypesReturnType
): Promise<ItemTypeFormValuesType> => {
  'use server';
  try {
    await prisma.$transaction(async (tx) => {
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
          }
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
        unit: newItemType.unit
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
