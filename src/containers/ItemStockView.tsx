'use server';
import { ItemStock, ItemType } from '@prisma/client';
import { getTodoOrders } from '@/app/lib/actions/order/todo';

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
          className={`bg-violet-300 group-hover:bg-violet-800`}
          style={{
            width: `${useProgress > 100 ? existProgress : useProgress}%`
          }}></div>
        <div
          className={`${consumedItemsTotalsById[is.itemTypeId] > is.value ? 'bg-red-400' : 'bg-green-400 bg-opacity-50 group-hover:bg-green-800'}`}
          style={{
            width: `${useProgress > 100 ? 100 - existProgress : 100 - useProgress}%`
          }}></div>
      </div>
    );
  }

  const isItemsRequired = itemStock.some((is) => consumedItemsTotalsById[is.itemTypeId] > is.value);
  return (
    <div className="max-h-[80vh] flex flex-col">
      <label className="text-lg font-bold">Stock</label>
      <div
        className={`flex flex-col gap-0.5 overflow-y-auto  ${isItemsRequired ? 'bg-red-100' : 'bg-gray-700 bg-opacity-10'} px-6 py-4 rounded-md`}>
        {isItemsRequired ? (
          <div className={'text-red-800 rounded-md text-center pb-2'}>
            <label className="font-bold w-full">Items Required</label>
          </div>
        ) : null}
        {sortedItemsStock.map((is, index) => (
          <div
            key={is.id}
            className={`group flex flex-row relative gap-4 min-w-full justify-between px-4 py-1 rounded-md bg-white border-b-[1px] border-gray-400
            ${consumedItemsTotalsById[is.itemTypeId] ? 'bg-opacity-100' : index % 2 === 0 ? 'bg-gray-100' : ''}
             hover:bg-black hover:text-white transition-transform duration-300 hover:scale-105
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
