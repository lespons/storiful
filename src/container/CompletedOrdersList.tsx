'use server';
import prisma from '@/lib/prisma';
import { OrdersList } from '@/components/OrdersList';
import { ItemChild, ItemType } from '@prisma/client';

export async function CompletedOrdersList({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await prisma.order.findMany({
    where: {
      completed: true
    },
    orderBy: {
      completedAt: 'asc'
    },
    include: {
      OrderItem: {
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
          }
        }
      }
    }
  });

  return (
    <>
      <div className="text-lg font-bold">Completed orders:</div>
      <OrdersList
        orders={orders.map(({ num, id, completed, createdAt, completedAt, OrderItem }) => ({
          completed,
          createdAt,
          id,
          num,
          completedAt,
          items: OrderItem.map((oi) => ({
            id: oi.id,
            name: oi.ItemType.name,
            quantity: oi.quantity,
            children: oi.ItemType.ItemChild.map((ic) => ({
              name: itemTypes.find(({ id }) => id === ic.itemTypeId)!.name,
              quantity: ic.quantity
            }))
          }))
        }))}
      />
    </>
  );
}
