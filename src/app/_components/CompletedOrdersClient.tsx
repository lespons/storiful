'use client';

import { OrdersList, OrdersListEditCallback, OrdersListProps } from '@/components/order/OrdersList';
import useSWR, { mutate, useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { fetcher } from '@/lib/rest_fecther';
import { TodoOrdersResponseData } from '@/pages/api/order/todo';
import { cloneOrder } from '@/app/_actions/cloneOrder';
import { CompletedOrdersReturnType } from '@/app/_actions/getCompleted';

export const mapOrderToListItem = (
  { num, id, deadlineAt, OrderItem, details, lastState }: CompletedOrdersReturnType[0],
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[]
): OrdersListProps['orders'][0] => ({
  id,
  num,
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
});

export function CompletedOrdersClient({
  onChangeState,
  cloneOrder,
  itemTypes,
  orders
}: {
  orders: CompletedOrdersReturnType;
  cloneOrder: (id: string) => Promise<void>;
  onChangeState: (id: string, state: string) => Promise<void>;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const { mutate } = useSWRConfig();
  return (
    <OrdersList
      orders={orders.map((order) => mapOrderToListItem(order, itemTypes))}
      onChangeState={onChangeState}
      onClone={async (id) => {
        await cloneOrder(id);
        await mutate('/api/order/todo');
      }}
    />
  );
}
