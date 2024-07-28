'use client';
import { OrdersList, OrdersListProps } from '@/components/order/OrdersList';
import { useSWRConfig } from 'swr';
import { ItemChild, ItemType } from '@prisma/client';
import { CompletedOrdersReturnType } from '@/app/_actions/getCompleted';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { eventBus, ItemTypeSelectEvent } from '@/lib/eventBus';
import { ItemTypeUnitsNames } from '@/components/ItemTypeForm';

export const mapOrderToListItem = (
  { num, id, deadlineAt, OrderItem, details, lastState }: CompletedOrdersReturnType[0],
  itemTypes: { [itemId: string]: ItemType & { ItemChild: ItemChild[] } }
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
    newQuantity: oi.newQuantity,
    completed: oi.completed,
    children: oi.ItemType.ItemChild.map((ic) => ({
      name: itemTypes[ic.itemTypeId]?.name,
      quantity: ic.quantity,
      itemTypeId: ic.itemTypeId,
      unit: itemTypes[ic.itemTypeId]?.unit ? ItemTypeUnitsNames[itemTypes[ic.itemTypeId].unit!] : ''
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
  onChangeItemValue,
  itemTypes,
  orders,
  expiredOrdersCount
}: {
  orders: CompletedOrdersReturnType;
  cloneOrder: (id: string) => Promise<void>;
  onChangeState: (id: string, state: string) => Promise<void>;
  onChangeItemValue: (orderItemId: string, newvalue: number) => Promise<void>;
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
  expiredOrdersCount: number;
}) {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const highlightItem = useRef<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState(orders);

  const filterOutOrders = useCallback(function (
    data: typeof orders,
    itemTypeFilterId: string | null
  ) {
    setFilteredOrders(
      itemTypeFilterId
        ? data.filter((order) => {
            return order.OrderItem.some(
              (oi) =>
                oi.itemTypeId === itemTypeFilterId ||
                oi.ItemType.ItemChild.some((oich) => oich.itemTypeId === itemTypeFilterId)
            );
          })
        : data
    );
  }, []);

  useEffect(() => {
    filterOutOrders(orders, highlightItem.current);
  }, [filterOutOrders, orders]);

  useEffect(() => {
    const eventHandler = (event: Event) => {
      const itemTypeFilterId = (event as unknown as { detail: ItemTypeSelectEvent }).detail
        .itemTypeId;
      highlightItem.current = itemTypeFilterId;
      filterOutOrders(orders, highlightItem.current);
    };
    eventBus.addEventListener('ItemTypeHoverEvent', eventHandler);
    return () => {
      eventBus.removeEventListener('ItemTypeHoverEvent', eventHandler);
    };
  }, [orders, filterOutOrders]);

  const itemTypesById = itemTypes.reduce(
    (result, itemType) => {
      result[itemType.id] = itemType;
      return result;
    },
    {} as { [itemid: string]: (typeof itemTypes)[0] }
  );
  return (
    <div className={'overflow-auto '}>
      <OrdersList
        orders={filteredOrders.map((order) => mapOrderToListItem(order, itemTypesById))}
        highlightItem={highlightItem.current}
        onChangeState={onChangeState}
        onChangeItemValue={onChangeItemValue}
        onClone={async (id) => {
          await cloneOrder(id);
          await mutate('/api/order/todo');
        }}
      />
      {expiredOrdersCount ? (
        <div>
          <div className={'flex gap-2 font-sm text-black/70 justify-center w-full'}>
            {expiredOrdersCount} {expiredOrdersCount === 1 ? 'order is ' : 'orders are '}hidden from
            the board
          </div>
          <button
            className={'w-full text-blue-900 rounded-md hover:underline'}
            onClick={() => {
              router.push(`/order/sent`);
            }}>
            see all
          </button>
        </div>
      ) : null}
    </div>
  );
}
