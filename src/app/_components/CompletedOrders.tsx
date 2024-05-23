'use server';
import prisma from '@/lib/prisma';
import { OrdersList } from '@/components/order/OrdersList';
import { ItemChild, ItemType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function CompletedOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await prisma.order.findMany({
    where: {
      states: {
        some: {
          state: {
            in: ['COMPLETED', 'SENT']
          }
        }
      }
    },

    include: {
      states: {
        where: {
          state: 'COMPLETED'
        },
        take: 1
      },
      OrderItem: {
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
          }
        }
      },
      lastState: {
        include: {
          User: true
        }
      }
    }
  });

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

    revalidatePath('/', 'layout');
    revalidateTag('order_find');
  };

  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="text-lg font-bold">Completed orders</div>
      <OrdersList
        orders={orders.map(({ num, id, details, deadlineAt, OrderItem, lastState }) => ({
          id,
          num,
          completedAt: lastState!.date,
          completedBy: lastState!.User.name ? lastState!.User.name : null,
          deadlineAt: deadlineAt,
          details,
          items: OrderItem.map((oi) => ({
            id: oi.id,
            itemId: oi.ItemType.id,
            name: oi.ItemType.name,
            quantity: oi.quantity,
            completed: oi.completed,
            children: oi.ItemType.ItemChild.map((ic) => ({
              name: itemTypes.find(({ id }) => id === ic.itemTypeId)!.name,
              quantity: ic.quantity
            }))
          })),
          lastState: {
            userName: lastState!.User.name,
            state: lastState!.state,
            date: lastState!.date
          }
        }))}
        onChangeState={async (orderId, state) => {
          'use server';
          console.log('onChangeState', orderId, state);
          if (state === 'SENT') {
            await sendOrder(orderId);
          }
        }}
      />
    </div>
  );
}
