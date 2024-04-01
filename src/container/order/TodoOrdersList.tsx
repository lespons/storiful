'use client';

import { OrdersList } from '@/components/OrdersList';
import useSWR, { useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { fetcher } from '@/lib/rest_fecther';
import type { TodoOrdersResponseData } from '@/pages/api/order/todo';

export function TodoOrdersList({
  submitData,
  itemTypes
}: {
  submitData: (id: string) => Promise<void>;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const { mutate } = useSWRConfig();
  const { data, isLoading } = useSWR<TodoOrdersResponseData>('/api/order/todo', fetcher);

  return (
    <OrdersList
      onComplete={async (id) => {
        await submitData(id);
        await mutate('/api/order/todo');
      }}
      orders={data!.orders.map(({ num, id, completed, createdAt, completedAt, OrderItem }) => ({
        completed,
        createdAt: new Date(createdAt),
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
  );
}
