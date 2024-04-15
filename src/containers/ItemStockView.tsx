'use server';
import { ItemStock, ItemType } from '@prisma/client';

export async function ItemStockView({
  itemStock
}: {
  itemStock: (ItemStock & { ItemType: ItemType })[];
}) {
  return (
    <div className="max-h-[80vh] overflow-auto">
      <div className="text-lg font-bold">Stock:</div>
      <div className="flex flex-col gap-0 px-2 py-2 bg-fuchsia-700 bg-opacity-5 rounded-md">
        {itemStock.map((is) => (
          <div
            key={is.id}
            className={`flex flex-row gap-4 min-w-full justify-between rounded-md px-4 ${is.value > 0 ? 'text-green-800' : ''}`}>
            <div className="font-bold flex-3">{is.ItemType.name}</div>
            <div className="flex-2">{is.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
