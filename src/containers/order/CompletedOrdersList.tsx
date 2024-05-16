'use server';
import prisma from '@/lib/prisma';
import { OrdersList } from '@/components/order/OrdersList';
import { ItemChild, ItemType } from '@prisma/client';

export async function CompletedOrdersList({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await prisma.order.findMany({
    where: {
      lastState: {
        state: { in: ['COMPLETED', 'SENT'] }
      }
    },
    orderBy: {
      lastState: {
        date: 'desc'
      }
    },
    include: {
      CreatedBy: true,
      CompletedBy: true,
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

  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="text-lg font-bold">Completed orders</div>
      <OrdersList
        orders={orders.map(({ num, id, details, deadlineAt, OrderItem, lastState }) => ({
          completed: true,
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
          }))
        }))}
      />
    </div>
  );
}
