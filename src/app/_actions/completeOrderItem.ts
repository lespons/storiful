import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const completeOrderItem = async (
  orderItemId: string,
  completed: boolean,
  fromStock: boolean
) => {
  'use server';

  try {
    await prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findFirstOrThrow({
        where: {
          id: orderItemId,
          completed: !completed
        },
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
          }
        }
      });

      await tx.orderItem.update({
        where: {
          id: orderItemId
        },
        data: {
          completed,
          fromStock,
          completedAt: completed ? new Date() : null
        }
      });

      // update progress
      const orderItemProgress = await tx.orderItemProgress.findFirst({
        where: {
          itemId: orderItem.ItemType.id
        }
      });

      if (orderItemProgress) {
        const newProgress =
          (orderItemProgress?.progress ?? 0) -
          (orderItem.newQuantity ?? orderItem.quantity) * (completed ? 1 : -1);

        await tx.orderItemProgress.upsert({
          where: {
            id: orderItemProgress?.id
          },
          create: {
            progress: 0,
            itemId: orderItem.ItemType.id
          },
          update: {
            progress: completed ? (newProgress >= 0 ? newProgress : 0) : newProgress
          }
        });
      }

      //

      const keepStock = completed ? fromStock : orderItem.fromStock;

      if (keepStock) {
        console.log('Dont change the stock');
        return;
      }
      const itemsToConsumed = orderItem.ItemType.ItemChild.map((child) => {
        return {
          itemTypeId: child.itemTypeId,
          quantity: child.quantity * orderItem.quantity
        };
      });

      await Promise.all(
        [orderItem].map((oi) =>
          tx.itemStock.update({
            where: {
              itemTypeId: oi.itemTypeId
            },
            data: {
              value: completed
                ? {
                    increment: oi.quantity
                  }
                : {
                    decrement: oi.quantity
                  },
              lockVersion: {
                increment: 1
              }
            }
          })
        )
      );

      await Promise.all(
        itemsToConsumed.map((itc) =>
          tx.itemStock.update({
            where: {
              itemTypeId: itc.itemTypeId
            },
            data: {
              value: completed
                ? {
                    decrement: itc.quantity
                  }
                : {
                    increment: itc.quantity
                  }
            }
          })
        )
      );
    });
  } catch (e) {
    console.error(e);
  } finally {
    revalidateTag('order_find');
    revalidatePath('/', 'page');
    // revalidatePath('/order', 'page');
    // revalidatePath('/order/created', 'page'); TODO update only by orderId
  }
};
