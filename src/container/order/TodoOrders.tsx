'use server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ItemChild, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/pages/api/order/todo';
import { TodoOrdersList } from '@/container/order/TodoOrdersList';
import { SWRProvider } from '@/components/swr';

export async function TodoOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await getTodoOrders();

  const submitData = async (id: string) => {
    'use server';

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id
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

      const itemTypes = await prisma.itemType.findMany({
        include: {
          ItemChild: {
            include: {
              ItemType: true
            }
          }
        }
      });

      const itemsToConsumed = itemTypes
        .filter((it) => {
          if (!it.ItemChild.length) {
            return false;
          }
          if (!order.OrderItem.some((oi) => oi.itemTypeId === it.id)) {
            return false;
          }
          return true;
        })
        .map(({ ItemChild }) => ItemChild)
        .flat();

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
          completedAt: new Date()
        }
      });
    });

    revalidatePath('/order');
  };
  return (
    <>
      <div className="text-lg font-bold">Orders to do:</div>
      <SWRProvider
        fallback={{
          '/api/order/todo': { orders }
        }}>
        <TodoOrdersList submitData={submitData} itemTypes={itemTypes} />
      </SWRProvider>
    </>
  );
}
