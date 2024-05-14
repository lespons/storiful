import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ItemChild, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/app/lib/actions/order/todo';
import { TodoOrdersClient } from '@/containers/order/TodoOrdersClient';
import { SWRProvider } from '@/components/swr';
import { auth } from '@/lib/auth';
import { OrdersListEditCallback } from '@/components/order/OrdersList';

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

    revalidatePath('/', 'layout');
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
    revalidatePath('/', 'layout');
  };

  const updateOrder: OrdersListEditCallback = async (prevData, values) => {
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
            deadlineAt: values.order.deadline && new Date(values.order.deadline),
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
      });

      return {
        order: { items: [] },
        success: true
      };
    } catch (e) {
      console.error(e);
      return { error: (e as { message: string }).message, order: { items: [] } };
    } finally {
      // redisClient.publish('orders', 'new order!');
      revalidatePath('/', 'page');
    }
  };

  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="text-lg font-bold">Orders to do</div>
      <SWRProvider
        fallback={{
          '/api/order/todo': { orders }
        }}>
        <TodoOrdersClient
          submitData={submitData}
          itemTypes={itemTypes}
          completedOrderItem={markAsCompletedType}
          updateOrder={updateOrder}
        />
      </SWRProvider>
    </div>
  );
}
