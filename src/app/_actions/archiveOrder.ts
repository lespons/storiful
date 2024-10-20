import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const archiveOrder = async (id: string) => {
  'use server';

  const session = await auth();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: {
          id,
          lastState: {
            state: { in: ['COMPLETED'] }
          }
        },
        data: {
          lastState: {
            create: {
              state: 'ARCHIVE',
              User: {
                connect: {
                  id: session!.user!.id!
                }
              },
              Order: {
                connect: {
                  id
                }
              }
            }
          }
        }
      });
    });
  } finally {
    revalidateTag('order_find');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
  }
};
