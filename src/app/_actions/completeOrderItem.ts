import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const completeOrderItem = async (orderItemId: string, completed: boolean) => {
  'use server';

  await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findFirstOrThrow({
      where: {
        id: orderItemId,
        completed: false
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
        completed
      }
    });

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
            value: {
              increment: oi.quantity
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
            value: {
              decrement: itc.quantity
            }
          }
        })
      )
    );
  });

  revalidateTag('order_find');
  revalidatePath('/', 'layout');
  revalidatePath('/', 'page');
};
