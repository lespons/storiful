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
          fromStock
        }
      });

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
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
  }
};
