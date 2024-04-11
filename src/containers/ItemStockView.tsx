'use server';
import { ItemStock, ItemType } from '@prisma/client';

export async function ItemStockView({
  itemStock
}: {
  itemStock: (ItemStock & { ItemType: ItemType })[];
}) {
  return (
    <div>
      <div className="text-lg font-bold">Stock:</div>
      <div className="flex flex-col gap-2 px-2 py-2 border-l-2 border-fuchsia-900">
        {itemStock.map((is) => (
          <div
            key={is.id}
            className={`flex flex-row gap-4 min-w-full justify-between rounded-full px-4 ${is.value > 0 ? 'bg-green-600 bg-opacity-20' : ''}`}>
            <div className="font-bold flex-3">{is.ItemType.name}</div>
            <div className="flex-2">{is.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
