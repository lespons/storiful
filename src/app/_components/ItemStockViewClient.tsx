'use client';
import { ItemStock, ItemType } from '@prisma/client';
import { ItemStockElement } from '@/components/ItemStockElement';
import { startTransition, useState } from 'react';

export function ItemStockViewClient({
  sortedItemsStock,
  consumedItemsTotalsById,
  onAddStock
}: {
  sortedItemsStock: (ItemStock & { ItemType: ItemType })[];
  consumedItemsTotalsById: { [itemTypeId: string]: number };
  onAddStock: (id: string, lockVersion: number, value: number) => Promise<void>;
}) {
  const [filteredItemsStock, setFilteredItemsStock] = useState(sortedItemsStock);
  return (
    <div className={`flex flex-col gap-4`}>
      <input
        placeholder={'search'}
        onChange={(e) => {
          startTransition(() => {
            const searchValue = e.target.value.toLowerCase();
            setFilteredItemsStock(
              sortedItemsStock.filter(
                ({ ItemType: { name } }) => name.toLowerCase().indexOf(searchValue) >= 0
              )
            );
          });
        }}
        className={`w-full text-center rounded-md`}
        type="text"
      />
      <div className={`flex flex-col`}>
        {filteredItemsStock.map((is, index) => (
          <ItemStockElement
            key={is.id}
            name={is.ItemType.name}
            value={is.value}
            consumedItemsCount={consumedItemsTotalsById[is.itemTypeId]}
            index={index}
            image={is.ItemType.image}
            id={is.itemTypeId}
            onAddStock={async (value) => {
              await onAddStock(is.id, is.lockVersion, value);
            }}
          />
        ))}
      </div>
    </div>
  );
}
