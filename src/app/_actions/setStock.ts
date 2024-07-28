import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function setStock(id: string, lockVersion: number, value: number): Promise<void> {
  'use server';

  try {
    await prisma.itemStock.update({
      where: { id, lockVersion },
      data: {
        value,
        lockVersion: {
          increment: 1
        }
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    revalidateTag('item_stock');
    revalidatePath('/order', 'page');
    revalidatePath('/', 'page');
  }
}
