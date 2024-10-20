import { OrderFormValue } from '@/components/order/OrderForm';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

export const createOrder = async (
  prevData: { order: OrderFormValue },
  values: { order: OrderFormValue }
) => {
  'use server';
  const session = await auth();
  try {
    if (!values.order.items.length) {
      throw Error('No items are selected');
    }
    await prisma.$transaction(async (tx) => {
      const userId = session?.user?.id;

      if (!userId) {
        throw Error('user is not provided');
      }
      const order = await tx.order.create({
        data: {
          deadlineAt: values.order.deadline ? new Date(values.order.deadline) : null,
          details: values.order.details,
          OrderItem: {
            createMany: {
              data: values.order.items.map(({ id, itemId, quantity, name }) => ({
                itemTypeId: itemId,
                quantity: Number(quantity)
              }))
            }
          },
          states: {
            create: {
              state: 'CREATED',
              userId
            }
          }
        },
        include: {
          states: true
        }
      });
      await tx.order.update({
        where: {
          id: order.id
        },
        data: {
          lastStateId: order.states[0].id
        }
      });
    });

    return {
      order: { items: [] },
      success: true
    };
  } catch (e) {
    console.error(e);
    return { error: (e as { message: string }).message };
  } finally {
    revalidateTag('item_stock');
    revalidateTag('order_find');
    revalidatePath('/', 'page');
    revalidatePath('/order', 'layout');
  }
};
