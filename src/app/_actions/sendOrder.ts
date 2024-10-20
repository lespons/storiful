import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const sendOrder = async (id: string) => {
  'use server';

  const session = await auth();

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id,
          lastState: {
            state: { in: ['COMPLETED'] }
          }
        },
        include: {
          OrderItem: {
            include: {
              ItemType: true
            }
          }
        }
      });

      if (!order) {
        throw Error(`Order is not found with id ${id}`);
      }

      await Promise.all(
        order.OrderItem.map((oi) =>
          tx.itemStock.update({
            where: {
              itemTypeId: oi.itemTypeId
            },
            data: {
              value: {
                decrement: oi.newQuantity ?? oi.quantity
              },
              lockVersion: {
                increment: 1
              }
            }
          })
        )
      );

      await tx.order.update({
        where: {
          id
        },
        data: {
          lastState: {
            create: {
              state: 'SENT',
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
    revalidateTag('item_stock');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
  }
};
