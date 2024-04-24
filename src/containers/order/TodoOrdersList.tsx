'use client';

import { OrdersList } from '@/components/order/OrdersList';
import useSWR, { useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { fetcher } from '@/lib/rest_fecther';
import type { TodoOrdersResponseData } from '@/app/lib/actions/order/todo';

export function TodoOrdersList({
  submitData,
  itemTypes,
  completedOrderItem
}: {
  submitData: (id: string) => Promise<void>;
  completedOrderItem: (orderItemId: string, completed: boolean) => Promise<void>;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const { mutate } = useSWRConfig();
  const { data, isLoading } = useSWR<TodoOrdersResponseData>('/api/order/todo', fetcher, {
    focusThrottleInterval: 2000
  });

  return (
    <OrdersList
      onComplete={async (id) => {
        await submitData(id);
        await mutate('/api/order/todo');
      }}
      onCompleteOrderItem={async (id, completed) => {
        await completedOrderItem(id, completed);
        data!.orders
          .find((order) => order.OrderItem.some((orderItem) => orderItem.id === id))!
          .OrderItem.find((orderItem) => orderItem.id === id)!.completed = completed;
        await mutate('/api/order/todo', { ...data });
      }}
      orders={data!.orders.map(
        ({ num, id, completed, createdAt, completedAt, CreatedBy, OrderItem }) => ({
          completed,
          createdAt: new Date(createdAt),
          id,
          num,
          completedAt,
          createdBy: CreatedBy.name,
          items: OrderItem.map((oi) => ({
            id: oi.id,
            name: oi.ItemType.name,
            quantity: oi.quantity,
            completed: oi.completed,
            children: oi.ItemType.ItemChild.map((ic) => ({
              name: itemTypes.find(({ id }) => id === ic.itemTypeId)!.name,
              quantity: ic.quantity
            }))
          }))
        })
      )}
    />
  );
}
