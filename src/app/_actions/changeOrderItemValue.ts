import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const changeOrderItemValue = async (orderItemId: string, value: number) => {
  'use server';

  let lastState = null;
  try {
    await prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findUniqueOrThrow({
        where: {
          id: orderItemId
        },
        include: {
          Order: {
            include: {
              lastState: true
            }
          }
        }
      });
      lastState = orderItem.Order?.lastState?.state;

      await tx.orderItem.update({
        where: {
          id: orderItemId
        },
        data: {
          newQuantity: value >= orderItem.quantity ? null : value
        }
      });
    });
  } finally {
    revalidateTag('item_stock');
    revalidateTag('order_find');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
    revalidatePath(`/order/${lastState}/${orderItemId}`, 'page');
  }
};
