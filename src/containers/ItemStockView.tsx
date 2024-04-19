'use server';
import { ItemStock, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/pages/api/order/todo';

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

  function background(is: (typeof itemStock)[0]) {
    const useProgress = Math.max(
      Math.round((consumedItemsTotalsById[is.itemTypeId] / is.value) * 100),
      0
    );
    const existProgress = Math.round((is.value / consumedItemsTotalsById[is.itemTypeId]) * 100);
    return (
      <div className="h-full w-full flex flex-row absolute z-0 left-0 top-0 rounded-md overflow-hidden">
        <div
          className={`bg-blue-800 bg-opacity-40`}
          style={{
            width: `${useProgress > 100 ? existProgress : useProgress}%`
          }}></div>
        <div
          className={`${consumedItemsTotalsById[is.itemTypeId] > is.value ? 'bg-red-800' : 'bg-green-600'}
                   bg-opacity-40`}
          style={{
            width: `${useProgress > 100 ? 100 - existProgress : 100 - useProgress}%`
          }}></div>
      </div>
    );
  }

  const isItemsRequired = itemStock.some((is) => consumedItemsTotalsById[is.itemTypeId] > is.value);
  return (
    <div className="max-h-[80vh] flex flex-col">
      <label className="text-lg font-bold">Stock:</label>
      <div className="flex flex-col gap-1 px-6 py-4 bg-fuchsia-700 bg-opacity-5 rounded-md overflow-auto">
        {isItemsRequired ? (
          <div className={'text-red-800 rounded-md text-center mb-2'}>
            <label className="font-bold text-sm">Items Required❗</label>
          </div>
        ) : null}
        {sortedItemsStock.map((is, index) => (
          <div
            key={is.id}
            className={`flex flex-row relative shadow-md gap-4 min-w-full justify-between px-4 py-1 rounded-md bg-white
            ${consumedItemsTotalsById[is.itemTypeId] ? 'bg-opacity-100' : index % 2 === 0 ? 'bg-opacity-80' : 'bg-opacity-5'}
             hover:bg-black hover:text-white hover:scale-105 transition-transform duration-300
            `}>
            {consumedItemsTotalsById[is.itemTypeId] ? background(is) : null}
            <div className={`font-bold flex-3 z-10`}>{is.ItemType.name}</div>
            <div className="flex-2 z-10 flex gap-1">
              <span>{is.value}</span>
              {consumedItemsTotalsById[is.itemTypeId] > is.value ? (
                <span className="z-10 font-bold text-red-800">
                  ({consumedItemsTotalsById[is.itemTypeId] - is.value})
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
