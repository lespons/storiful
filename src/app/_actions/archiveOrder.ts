import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const archiveOrder = async (id: string) => {
  'use server';

  const session = await auth();

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

  revalidateTag('order_find');
  revalidatePath('/', 'layout');
  revalidatePath('/', 'page');
  revalidatePath('/order', 'page');
  revalidatePath('/order/create', 'page');
};
