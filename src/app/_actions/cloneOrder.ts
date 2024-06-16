'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { add, differenceInDays } from 'date-fns';

export async function cloneOrder(id: string) {
  const session = await auth();

  await prisma.$transaction(async (tx) => {
    const userId = session?.user?.id;

    if (!userId) {
      throw Error('user is not provided');
    }

    const order = await tx.order.findFirst({
      where: {
        id
      },
      include: {
        OrderItem: {
          include: {
            ItemType: true
          }
        },
        states: true
      }
    });

    if (!order) {
      throw Error(`Order is not found with id ${id}`);
    }

    const newOrder = await tx.order.create({
      data: {
        deadlineAt: order.deadlineAt
          ? add(new Date(), {
              days:
                differenceInDays(
                  order.deadlineAt,
                  order.states.find((order) => order.state === 'CREATED')!.date
                ) || 1
            })
          : null,
        details: `CLONED from #${order.num}`,
        OrderItem: {
          createMany: {
            data: order.OrderItem.map(({ id, itemTypeId, quantity }) => ({
              itemTypeId,
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
        id: newOrder.id
      },
      data: {
        lastStateId: newOrder.states[0].id
      }
    });
  });

  revalidateTag('order_find');
  revalidatePath('/', 'page');
}
