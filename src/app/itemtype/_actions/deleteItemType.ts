import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export const deleteItemType = async (
  itemid: string
): Promise<{ error?: string; success?: boolean }> => {
  'use server';
  try {
    await prisma.$transaction(async (tx) => {
      await tx.itemStock.deleteMany({
        where: {
          itemTypeId: itemid
        }
      });

      await tx.itemChild.deleteMany({
        where: {
          parentTypeId: itemid
        }
      });

      await tx.itemChild.deleteMany({
        where: {
          itemTypeId: itemid
        }
      });

      await tx.itemType.deleteMany({
        where: {
          id: itemid
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed' };
  } finally {
    revalidateTag('item_types_edit');
    revalidatePath('/itemtype', 'layout');
    redirect('/itemtype');
  }
};
