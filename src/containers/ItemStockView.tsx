'use server';
import { ItemStock, ItemType } from '@prisma/client';

export async function ItemStockView({
  itemStock
}: {
  itemStock: (ItemStock & { ItemType: ItemType })[];
}) {
  return (
    <div className="max-h-[80vh] flex flex-col">
      <div className="text-lg font-bold">Stock:</div>
      <div className="flex flex-col gap-0 px-2 py-4 bg-fuchsia-700 bg-opacity-5 rounded-md overflow-auto">
        {itemStock.map((is, index) => (
          <div
            key={is.id}
            className={`flex flex-row gap-4 min-w-full justify-between px-4 py-1 rounded-sm bg-white ${is.value > 0 ? 'text-green-800' : ''} 
            ${index % 2 === 0 ? 'bg-opacity-30' : 'bg-opacity-5'}  hover:bg-opacity-50`}>
            <div className="font-bold flex-3">{is.ItemType.name}</div>
            <div className="flex-2">{is.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
