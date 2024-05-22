'use server';
import { ItemStock, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/app/lib/actions/order/todo';
import { ItemStockElement } from '@/components/ItemStockElement';

export async function ItemStockView({
  itemStock
}: {
  itemStock: (ItemStock & { ItemType: ItemType })[];
}) {
  const orders = await getTodoOrders();

  //TODO use db aggregation when prisma is support
  const consumedItemsTotalsById = orders.reduce(
    (result, order) => {
      order.OrderItem.forEach((orderItem) => {
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
    <div className="max-h-[80vh] flex flex-col">
      <label className="text-lg font-bold">Stock</label>
      <div
        className={`flex flex-col gap-0.5 overflow-y-auto  ${isItemsRequired ? 'bg-red-100/50' : 'bg-gray-700 bg-opacity-10'} px-6 py-4 rounded-md`}>
        {isItemsRequired ? (
          <div className={'text-red-800 rounded-md text-center pb-2'}>
            <label className="font-bold w-full">Items Required</label>
          </div>
        ) : null}
        {sortedItemsStock.map((is, index) => (
          <ItemStockElement
            key={is.id}
            name={is.ItemType.name}
            value={is.value}
            consumedItemsCount={consumedItemsTotalsById[is.itemTypeId]}
            index={index}
            image={is.ItemType.image}
          />
        ))}
      </div>
    </div>
  );
}
//(is, consumedItemsTotalsById[is.itemTypeId], index, background)
