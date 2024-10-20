import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function addStock(id: string, lockVersion: number, value: number): Promise<void> {
  'use server';

  try {
    await prisma.itemStock.update({
      where: { id, lockVersion },
      data: {
        value: {
          increment: value
        },
        lockVersion: {
          increment: 1
        }
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    revalidateTag('item_stock');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
  }
}
