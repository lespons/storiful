import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
          increment: lockVersion
        }
      }
    });
  } catch (e) {
    console.error(e);
  } finally {
    revalidatePath('/', 'page');
  }
}
