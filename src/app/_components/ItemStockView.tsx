'use server';
import { ItemStock, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/app/lib/actions/order';
import { ItemStockViewClient } from '@/app/_components/ItemStockViewClient';
import { addStock } from '@/app/_actions/addStock';
import { Battery0Icon, Battery50Icon } from '@heroicons/react/24/solid';
import { setStock } from '@/app/_actions/setStock';

export async function ItemStockView({
  itemStock
}: {
  itemStock: (ItemStock & {
    ItemType: Pick<ItemType, 'id' | 'name' | 'type' | 'unit' | 'image'>;
  })[];
}) {
  const orders = await getTodoOrders();

  //TODO use db aggregation when prisma is support
  const consumedItemsTotalsById = orders.reduce(
    (result, order) => {
      order.OrderItem.filter((orderItem) => !orderItem.completed).forEach((orderItem) => {
        orderItem.ItemType.ItemChild.forEach((itemChild) => {
          result[itemChild.itemTypeId] =
            (result[itemChild.itemTypeId] ?? 0) + itemChild.quantity * orderItem.quantity;
        });
      });

      return result;
    },
    {} as { [itemTypeId: string]: number }
  );

  const sortedItemsStock = [...itemStock].sort((itm1, itm2) => {
    if (consumedItemsTotalsById[itm1.itemTypeId] && consumedItemsTotalsById[itm2.itemTypeId]) {
      return (
        itm1.value / consumedItemsTotalsById[itm1.itemTypeId] -
        itm2.value / consumedItemsTotalsById[itm2.itemTypeId]
      );
    }
    if (consumedItemsTotalsById[itm1.itemTypeId]) {
      return -1;
    }
    if (consumedItemsTotalsById[itm2.itemTypeId]) {
      return 1;
    }
    return itm1.ItemType.name.localeCompare(itm2.ItemType.name);
  });

  const isItemsRequired = itemStock.some((is) => consumedItemsTotalsById[is.itemTypeId] > is.value);
  return (
    <div className="flex max-h-[90vh] flex-col overflow-x-hidden">
      <div className={'mb-3 flex w-full justify-center gap-1'}>
        {isItemsRequired ? (
          <Battery0Icon className={'my-auto size-8 text-red-800'} />
        ) : (
          <Battery50Icon className={'text-black-900 size-8'} />
        )}
      </div>
      <div
        className={`flex flex-col gap-0.5 ${isItemsRequired ? 'bg-red-100/30' : 'bg-black/5'} overflow-y-auto overflow-x-hidden rounded-md px-6 py-4`}>
        <ItemStockViewClient
          consumedItemsTotalsById={consumedItemsTotalsById}
          sortedItemsStock={sortedItemsStock}
          onAddStock={addStock}
          onSetStock={setStock}
        />
      </div>
    </div>
  );
}
