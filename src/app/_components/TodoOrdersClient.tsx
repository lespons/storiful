'use client';

import { OrdersList, OrdersListEditCallback, OrdersListProps } from '@/components/order/OrdersList';
import useSWR, { useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { fetcher } from '@/lib/rest_fecther';
import { TodoOrdersResponseData } from '@/pages/api/order/todo';
import { useEffect, useRef, useState } from 'react';
import { eventBus, ItemTypeSelectEvent } from '@/lib/eventBus';
import { ItemTypeUnitsNames } from '@/components/ItemTypeForm';

export const mapOrderToListItem = (
  { num, id, deadlineAt, OrderItem, details, lastState }: TodoOrdersResponseData['orders'][0],
  itemTypes: { [itemId: string]: ItemType & { ItemChild: ItemChild[] } }
): OrdersListProps['orders'][0] => ({
  id,
  num,
  deadlineAt,
  details,
  items: OrderItem.map((oi) => ({
    id: oi.id,
    itemId: oi.ItemType.id,
    name: oi.ItemType.name,
    quantity: oi.quantity,
    completed: oi.completed,
    fromStock: oi.fromStock,
    children: oi.ItemType.ItemChild.map((ic) => ({
      itemTypeId: ic.itemTypeId,
      name: itemTypes[ic.itemTypeId]?.name,
      quantity: ic.quantity,
      unit: itemTypes[ic.itemTypeId]?.unit ? ItemTypeUnitsNames[itemTypes[ic.itemTypeId].unit!] : ''
    }))
  })),
  lastState: {
    userName: lastState!.User.name,
    state: lastState!.state,
    date: lastState!.date
  }
});

export function TodoOrdersClient({
  submitData,
  itemTypes,
  completedOrderItem,
  updateOrder
}: {
  submitData: (id: string) => Promise<void>;
  completedOrderItem: (
    orderItemId: string,
    completed: boolean,
    fromStock: boolean
  ) => Promise<void>;
  updateOrder: OrdersListEditCallback;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const { mutate } = useSWRConfig();
  const highlightItem = useRef<string | null>(null);
  const { data: todoOrdersData, isLoading } = useSWR<TodoOrdersResponseData>(
    '/api/order/todo',
    fetcher,
    {
      onSuccess: (data) => {
        filterOutOrders(data, highlightItem.current);
      }
    }
  );

  const [filteredOrders, setFilteredOrders] = useState(todoOrdersData!.orders);

  function filterOutOrders(data: typeof todoOrdersData, itemTypeFilterId: string | null) {
    setFilteredOrders(
      itemTypeFilterId
        ? data!.orders.filter((order) => {
            return order.OrderItem.some(
              (oi) =>
                oi.itemTypeId === itemTypeFilterId ||
                oi.ItemType.ItemChild.some((oich) => oich.itemTypeId === itemTypeFilterId)
            );
          })
        : data!.orders
    );
  }

  useEffect(() => {
    const eventHandler = (event: Event) => {
      const itemTypeFilterId = (event as unknown as { detail: ItemTypeSelectEvent }).detail
        .itemTypeId;
      highlightItem.current = itemTypeFilterId;
      filterOutOrders(todoOrdersData, itemTypeFilterId);
    };
    eventBus.addEventListener('ItemTypeHoverEvent', eventHandler);
    return () => {
      eventBus.removeEventListener('ItemTypeHoverEvent', eventHandler);
    };
  }, [todoOrdersData]);

  const itemTypesById = itemTypes.reduce(
    (result, itemType) => {
      result[itemType.id] = itemType;
      return result;
    },
    {} as { [itemid: string]: (typeof itemTypes)[0] }
  );

  return (
    <OrdersList
      onComplete={async (id) => {
        await submitData(id);
        await mutate('/api/order/todo');
      }}
      highlightItem={highlightItem.current}
      onCompleteOrderItem={async (id, completed, fromStock) => {
        if (!todoOrdersData?.orders?.length) {
          console.error(`No orders to complete`);
          return;
        }
        await completedOrderItem(id, completed, fromStock);
        todoOrdersData.orders
          .find((order) => order.OrderItem.some((orderItem) => orderItem.id === id))!
          .OrderItem.find((orderItem) => orderItem.id === id)!.completed = completed;
        await mutate('/api/order/todo', { ...todoOrdersData });
      }}
      orders={filteredOrders.map((order) => mapOrderToListItem(order, itemTypesById))}
      edit={{
        itemTypes: itemTypes.map(({ name, id, ItemChild, type }) => ({
          id,
          name,
          type,
          children: ItemChild.map((ic) => ({
            itemTypeId: ic.itemTypeId,
            quantity: ic.quantity,
            name: itemTypesById[ic.id]?.name,
            unit: itemTypesById[ic.itemTypeId]?.unit
              ? ItemTypeUnitsNames[itemTypesById[ic.itemTypeId].unit!]
              : ''
          }))
        })),
        onEditOrder: async (prev, next) => {
          const result = await updateOrder(prev, next);

          const oldOrderData = todoOrdersData!.orders.find((order) => order.id === next.order.id);

          if (oldOrderData) {
            oldOrderData.OrderItem.forEach((orderItem) => {
              orderItem.quantity = Number(
                next.order.items.find(({ id }) => id === orderItem.id)?.quantity
              );
            });
            oldOrderData.details = next.order.details!;
            oldOrderData.deadlineAt = next.order.deadline ? new Date(next.order.deadline) : null;
          }

          await mutate('/api/order/todo', { ...todoOrdersData });

          return result;
        }
      }}
    />
  );
}
