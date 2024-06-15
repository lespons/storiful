import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ItemChild, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/app/lib/actions/order';
import { TodoOrdersClient } from '@/app/_components/TodoOrdersClient';
import { SWRProvider } from '@/components/swr';
import { auth } from '@/lib/auth';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import { updateOrder } from '@/app/_actions/updateOrder';
import { OrderCreate } from '@/app/_components/OrderCreate';

export async function TodoOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await getTodoOrders();

  const completeOrder = async (id: string) => {
    'use server';

    const session = await auth();

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id,
          lastState: {
            state: { in: ['CREATED', 'INPROGRESS'] }
          }
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
          lastState: {
            create: {
              state: 'COMPLETED',
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

  return (
    <div className="relative max-h-[90vh] flex flex-col">
      <div className={'flex justify-center w-full mb-1'}>
        <WrenchScrewdriverIcon className={'size-6 text-fuchsia-900'} />
      </div>
      <OrderCreate itemTypes={itemTypes} />
      <SWRProvider
        fallback={{
          '/api/order/todo': { orders }
        }}>
        <TodoOrdersClient
          submitData={completeOrder}
          itemTypes={itemTypes}
          completedOrderItem={markAsCompletedType}
          updateOrder={updateOrder}
        />
      </SWRProvider>
    </div>
  );
}
