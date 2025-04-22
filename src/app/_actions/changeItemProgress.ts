import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function changeItemProgress(value: number, orderItemId: string) {
  try {
    await prisma.$transaction(async ($tx) => {
      if (value === 0) {
        await $tx.orderItemProgress.deleteMany({
          where: {
            itemId: orderItemId
          }
        });
        return;
      }

      const orderItemProgress = await $tx.orderItemProgress.findFirst({
        where: {
          itemId: orderItemId
        }
      });
      if (!orderItemProgress) {
        await $tx.orderItemProgress.create({
          data: {
            itemId: orderItemId,
            progress: value
          }
        });
        return;
      }
      await $tx.orderItemProgress.update({
        where: {
          id: orderItemProgress.id,
          itemId: orderItemId
        },
        data: {
          progress: value
        }
      });
    });
  } finally {
    revalidatePath('/', 'page');
  }
}
