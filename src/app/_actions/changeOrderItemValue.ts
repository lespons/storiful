import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const changeOrderItemValue = async (orderItemId: string, value: number) => {
  'use server';
  await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findUniqueOrThrow({
      where: {
        id: orderItemId
      }
    });
    await tx.orderItem.update({
      where: {
        id: orderItemId
      },
      data: {
        newQuantity: value >= orderItem.quantity ? null : value
      }
    });
  });

  revalidateTag('order_find');
  revalidatePath('/', 'layout');
  revalidatePath('/order', 'page');
  revalidatePath('/order/create', 'page');
};
