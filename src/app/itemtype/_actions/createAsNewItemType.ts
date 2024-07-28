import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';

export const createAsNewItemType = async (id: string): Promise<void> => {
  'use server';

  let newId: string | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      const itemType = await tx.itemType.findUniqueOrThrow({
        where: {
          id
        },
        include: {
          ItemChild: {
            select: {
              itemTypeId: true,
              quantity: true
            }
          }
        }
      });

      const result = await prisma.itemType.create({
        data: {
          name: `CLONED FROM ${itemType.name}`,
          type: itemType.type,
          image: itemType.image,
          unit: itemType.unit,
          ItemChild: {
            createMany: {
              data: itemType.ItemChild.map((c) => ({
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

      newId = result.id;
    });
  } catch (e) {
    console.error(e);
  } finally {
    revalidateTag('item_types_edit');
    revalidatePath('/', 'page');
    revalidatePath('/stock', 'page');
    redirect(`/itemtype/${newId ?? id}`);
  }
};
