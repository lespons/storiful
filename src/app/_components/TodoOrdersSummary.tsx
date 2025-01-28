import { TodoOrder } from '@/pages/api/order/todo';
import { ItemType as ClientItemType } from '@/components/ItemTypeForm';
import { CalculatorIcon } from '@heroicons/react/24/outline';

export function TodoOrdersSummary({
  itemTypes,
  orders
}: {
  itemTypes: ClientItemType[];
  orders: TodoOrder[];
}) {
  const itemTypesById = itemTypes.reduce(
    (result, itemType) => {
      result[itemType.id] = itemType;
      return result;
    },
    {} as { [itemid: string]: (typeof itemTypes)[0] }
  );

  const orderItemsCountById = orders.reduce(
    (result, order) => {
      order.OrderItem.forEach((orderItem) => {
        result[orderItem.itemTypeId] = result[orderItem.itemTypeId] ?? 0;
        if (orderItem.completed) return;
        result[orderItem.itemTypeId] += orderItem.quantity;
      });
      return result;
    },
    {} as { [orderItemId: string]: number }
  );

  return (
    <div className="my-2 max-h-[90vh] min-h-fit overflow-y-auto rounded-md border-2 border-dashed border-fuchsia-900/20">
      <input type="checkbox" id="toggle" className="peer hidden" />
      <label
        htmlFor="toggle"
        className="border-1 flex w-full cursor-pointer select-none justify-center gap-2 rounded-md border-fuchsia-600 p-1 font-bold hover:bg-fuchsia-800/10">
        <CalculatorIcon className="my-auto size-5" />
        <div>Summary</div>
      </label>
      <div className="relative hidden flex-col gap-1 px-4 py-2 text-sm peer-checked:flex">
        {Object.entries(orderItemsCountById).map(([orderItemId, count]) =>
          count ? (
            <div key={orderItemId} className={'flex w-full justify-between gap-2'}>
              <div className={'font-bold'}>{itemTypesById[orderItemId]?.name}</div>
              <div className={'rounded-full bg-fuchsia-800/10 px-1'}>{count}</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
