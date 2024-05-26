'use server';
import prisma from '@/lib/prisma';
import { ItemChild, ItemType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cloneOrder } from '@/app/_actions/cloneOrder';
import { getActualCompleted, getExpiredCount } from '@/app/_actions/getCompleted';
import { CompletedOrdersClient } from '@/app/_components/CompletedOrdersClient';

export async function CompletedOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await getActualCompleted();

  orders.sort(({ states: [completedState1] }, { states: [completedState2] }) => {
    return completedState2.date.getTime() - completedState1.date.getTime();
  });

  const sendOrder = async (id: string) => {
    'use server';

    const session = await auth();

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
                decrement: oi.quantity
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

    revalidateTag('order_find');
    revalidatePath('/', 'layout');
    revalidatePath('/order', 'page');
    revalidatePath('/order/create', 'page');
  };

  const expiredOrdersCount = await getExpiredCount();
  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="text-lg font-bold">Orders to complete</div>
      <CompletedOrdersClient
        orders={orders}
        itemTypes={itemTypes}
        cloneOrder={cloneOrder}
        expiredOrdersCount={expiredOrdersCount}
        onChangeState={async (orderId, state) => {
          'use server';
          if (state === 'SENT') {
            await sendOrder(orderId);
          }
        }}
      />
    </div>
  );
}
