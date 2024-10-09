import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const completeOrder = async (id: string) => {
  'use server';

  const session = await auth();

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id,
          lastState: {
            state: { in: ['CREATED', 'INPROGRESS'] }
          }
        },
        include: {
          OrderItem: {
            include: {
              ItemType: {
                include: {
                  ItemChild: true
                }
              }
            },
            orderBy: {
              ItemType: {
                name: 'asc'
              }
            }
          }
        }
      });

      if (!order) {
        throw Error(`Order is not found with id ${id}`);
      }

      await tx.order.update({
        where: {
          id
        },
        data: {
          lastState: {
            create: {
              state: 'COMPLETED',
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
