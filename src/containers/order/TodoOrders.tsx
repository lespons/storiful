'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ItemChild, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/pages/api/order/todo';
import { TodoOrdersList } from '@/containers/order/TodoOrdersList';
import { SWRProvider } from '@/components/swr';
import { auth } from '@/lib/auth';

export async function TodoOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await getTodoOrders();

  const submitData = async (id: string) => {
    'use server';

    const session = await auth();

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id,
          completed: false
        },
        include: {
          OrderItem: {
            include: {
              ItemType: {
                include: {
                  ItemChild: true
                }
              }
            },
            orderBy: {
              ItemType: {
                name: 'asc'
              }
            }
          }
        }
      });

      if (!order) {
        throw Error(`Order is not found with id ${id}`);
      }

      const itemsToConsumed = order.OrderItem.map((orderItem) => {
        const children = orderItem.ItemType.ItemChild.map((child) => {
          return {
            itemTypeId: child.itemTypeId,
            quantity: child.quantity * orderItem.quantity
          };
        });

        return children;
      }).flat();

      await Promise.all(
        order.OrderItem.map((oi) =>
          tx.itemStock.update({
            where: {
              itemTypeId: oi.itemTypeId
            },
            data: {
              value: {
                increment: oi.quantity
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
      await tx.order.update({
        where: {
          id
        },
        data: {
          completed: true,
          completedAt: new Date(),
          completedById: session!.user!.id!
        }
      });
    });

    revalidatePath('/order');
    revalidatePath('/');
  };

  const markAsCompletedType = async (orderItemId: string, completed: boolean) => {
    'use server';

    await prisma.orderItem.update({
      where: {
        id: orderItemId
      },
      data: {
        completed
      }
    });
    revalidatePath('/order');
    revalidatePath('/');
  };

  return (
    <div className="max-h-[75vh] flex flex-col">
      <div className="text-lg font-bold">Orders to do:</div>
      <SWRProvider
        fallback={{
          '/api/order/todo': { orders }
        }}>
        <TodoOrdersList
          submitData={submitData}
          itemTypes={itemTypes}
          completedOrderItem={markAsCompletedType}
        />
      </SWRProvider>
    </div>
  );
}
