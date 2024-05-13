'use client';

import { OrdersList, OrdersListEditCallback, OrdersListProps } from '@/components/order/OrdersList';
import useSWR, { useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { fetcher } from '@/lib/rest_fecther';
import { TodoOrdersResponseData } from '@/pages/api/order/todo';

export const mapOrderToListItem = (
  {
    num,
    id,
    completed,
    createdAt,
    completedAt,
    CreatedBy,
    deadlineAt,
    OrderItem,
    details
  }: TodoOrdersResponseData['orders'][0],
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[]
): OrdersListProps['orders'][0] => ({
  completed,
  createdAt: new Date(createdAt),
  id,
  num,
  completedAt,
  createdBy: CreatedBy.name,
  deadlineAt,
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
});

export function TodoOrdersClient({
  submitData,
  itemTypes,
  completedOrderItem,
  updateOrder
}: {
  submitData: (id: string) => Promise<void>;
  completedOrderItem: (orderItemId: string, completed: boolean) => Promise<void>;
  updateOrder: OrdersListEditCallback;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const { mutate } = useSWRConfig();
  const { data: todoOrdersData, isLoading } = useSWR<TodoOrdersResponseData>(
    '/api/order/todo',
    fetcher
  );
  return (
    <OrdersList
      onComplete={async (id) => {
        await submitData(id);
        await mutate('/api/order/todo');
      }}
      onCompleteOrderItem={async (id, completed) => {
        if (!todoOrdersData?.orders?.length) {
          console.error(`No orders to complete`);
          return;
        }
        await completedOrderItem(id, completed);
        todoOrdersData.orders
          .find((order) => order.OrderItem.some((orderItem) => orderItem.id === id))!
          .OrderItem.find((orderItem) => orderItem.id === id)!.completed = completed;
        await mutate('/api/order/todo', { ...todoOrdersData });
      }}
      orders={(todoOrdersData ?? { orders: [] }).orders.map((order) =>
        mapOrderToListItem(order, itemTypes)
      )}
      edit={{
        itemTypes: itemTypes.map(({ name, id, ItemChild }) => ({
          id,
          name,
          children: ItemChild.map((ic) => ({
            quantity: ic.quantity,
            name: itemTypes.find((it) => it.id === ic.itemTypeId)!.name
          }))
        })),
        onEditOrder: async (prev, next) => {
          const oldOrderData = todoOrdersData!.orders.find((order) => order.id === next.order.id);
          const result = await updateOrder(prev, next);
          if (oldOrderData) {
            oldOrderData.OrderItem.forEach((orderItem) => {
              orderItem.quantity = Number(
                next.order.items.find(({ id }) => id === orderItem.id)?.quantity
              );
            });
            oldOrderData.details = next.order.details!;
          }

          await mutate('/api/order/todo', { ...todoOrdersData });

          return result;
        }
      }}
    />
  );
}
