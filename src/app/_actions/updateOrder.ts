import { OrdersListEditCallback } from '@/components/order/OrdersList';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { calcOrderPrice } from '@/app/_actions/orders';

export const updateOrder: OrdersListEditCallback = async (prevData, values) => {
  'use server';
  const session = await auth();
  try {
    if (!values.order.items.length) {
      throw Error('No items are selected');
    }
    if (!session?.user?.id) {
      throw Error('Access is denied');
    }
    await prisma.$transaction(async (tx) => {
      const oldOrder = await tx.order.findUniqueOrThrow({
        where: {
          id: values.order.id
        },
        include: {
          OrderItem: true
        }
      });
      const orderItemsToUpdate = values.order.items.filter((item) => item.id);
      const orderItemsToCreate = values.order.items.filter((item) => !item.id);
      const orderItemsToDelete = oldOrder.OrderItem.filter(
        (oi) => !values.order.items.some(({ id }) => id === oi.id)
      );
      await tx.order.update({
        where: {
          id: values.order.id
        },
        data: {
          deadlineAt: values.order.deadline ? new Date(values.order.deadline) : null,
          details: values.order.details
        }
      });

      await tx.orderItem.deleteMany({
        where: {
          id: { in: orderItemsToDelete.map(({ id }) => id) }
        }
      });
      for (const orderItems of orderItemsToUpdate) {
        await tx.orderItem.update({
          where: {
            id: orderItems.id
          },
          data: {
            quantity: Number(orderItems.quantity)
          }
        });
      }

      await tx.orderItem.createMany({
        data: orderItemsToCreate.map((orderItemToCreate) => ({
          orderId: values.order.id!,
          quantity: Number(orderItemToCreate.quantity),
          itemTypeId: orderItemToCreate.itemId
        }))
      });

      const order = await tx.order.findUniqueOrThrow({
        where: {
          id: values.order.id
        },
        include: {
          OrderItem: {
            include: {
              ItemType: {
                include: {
                  prices: {
                    orderBy: {
                      date: 'desc'
                    },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });
      await tx.order.update({
        where: {
          id: values.order.id
        },
        data: {
          price: calcOrderPrice(order)
        }
      });
    });

    return {
      order: { items: [] },
      success: true
    };
  } catch (e) {
    console.error(e);
    return { error: (e as { message: string }).message, order: { items: [] } };
  } finally {
    revalidateTag('order_find');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
  }
};
