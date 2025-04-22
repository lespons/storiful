import { TodoOrder } from '@/pages/api/order/todo';
import { ItemType as ClientItemType } from '@/components/ItemTypeForm';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { TodoOrdersSummaryItem } from './TodoOrdersSummaryItem';
import prisma from '@/lib/prisma';
import { changeItemProgress } from '../_actions/changeItemProgress';

export async function TodoOrdersSummary({
  itemTypes,
  orders
}: {
  itemTypes: ClientItemType[];
  orders: TodoOrder[];
}) {
  const orderItemProgress = await prisma.orderItemProgress.findMany({
    where: {
      itemId: {
        in: orders.map((order) => order.OrderItem.map((orderItem) => orderItem.itemTypeId)).flat()
      }
    }
  });
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

  const countToComplete = Object.values(orderItemsCountById).reduce((sum, count) => sum + count, 0);
  const countCompleted = orderItemProgress
    .filter((itemProgress) => !!orderItemsCountById[itemProgress.itemId])
    .reduce((sum, progress) => sum + (progress.progress ?? 0), 0);

  return (
    <div className="my-2 min-h-fit rounded-t-md border-2 border-b-0">
      <input type="checkbox" id="toggle" className="peer hidden" />
      <label
        htmlFor="toggle"
        className="border-1 relative flex w-full cursor-pointer select-none justify-center gap-2 rounded-md border-fuchsia-600 p-1 pb-2 font-bold hover:bg-fuchsia-800/10">
        <CalculatorIcon className="z-5 my-auto size-5" />
        <div>Summary</div>
        <div className="absolute bottom-0 z-0 flex h-1 w-full">
          <div
            className={`left-0 h-full bg-green-400 transition-all duration-300`}
            style={{ width: `${(countCompleted / countToComplete) * 100}%` }}
          />
          <div
            className={`h-full bg-gray-200 transition-all duration-300`}
            style={{
              left: `${(countCompleted / countToComplete) * 100}%`,
              width: `${100 - (countCompleted / countToComplete) * 100}%`
            }}
          />
        </div>
      </label>
      <div className="relative hidden max-h-[60vh] flex-col gap-2 overflow-y-auto text-sm peer-checked:flex">
        {Object.entries(orderItemsCountById)
          .sort(([itemId1], [itemId2]) =>
            itemTypesById[itemId1]?.name.localeCompare(itemTypesById[itemId2]?.name)
          )
          .map(([orderItemId, count]) =>
            count ? (
              <TodoOrdersSummaryItem
                key={`${orderItemId}_${count}`}
                name={itemTypesById[orderItemId]?.name}
                quantity={count}
                progress={
                  orderItemProgress.find((progress) => progress.itemId === orderItemId)?.progress ??
                  0
                }
                onProgressChange={async (value) => {
                  'use server';
                  await changeItemProgress(value, orderItemId);
                }}
              />
            ) : null
          )}
      </div>
    </div>
  );
}
