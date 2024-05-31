'use client';
import { ItemStock, ItemType } from '@prisma/client';
import { ItemStockElement } from '@/components/ItemStockElement';
import { KeyboardEvent, startTransition, useCallback, useEffect, useState } from 'react';
import { eventBus, ItemTypeSelectEvent } from '@/lib/eventBus';
import { ItemTypeUnitsNames } from '@/components/ItemTypeForm';

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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    setFilteredItemsStock(sortedItemsStock);
  }, [sortedItemsStock]);
  function sendSelectEvent(itemTypeId: string | null) {
    setSelectedItem((sitem) => {
      const toSelect = itemTypeId === sitem ? null : itemTypeId;

      setTimeout(() => {
        // use timeout to render listeners after
        eventBus.dispatchEvent(
          new CustomEvent('ItemTypeHoverEvent', {
            detail: {
              itemTypeId: toSelect
            } as ItemTypeSelectEvent
          })
        );
      });

      return toSelect;
    });
  }

  const hoverCallback = useCallback(sendSelectEvent, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent default scrolling behavior
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        const prevItemTypeId =
          filteredItemsStock[
            filteredItemsStock.findIndex((is) => is.itemTypeId === selectedItem) - 1
          ]?.itemTypeId;
        if (prevItemTypeId) {
          sendSelectEvent(prevItemTypeId);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextItemTypeId =
          filteredItemsStock[
            filteredItemsStock.findIndex((is) => is.itemTypeId === selectedItem) + 1
          ]?.itemTypeId;
        if (nextItemTypeId) {
          sendSelectEvent(nextItemTypeId);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={`flex flex-col gap-4 outline-0`} tabIndex={0} onKeyDown={handleKeyDown}>
      <div className={'sticky top-0 left-0 z-30'}>
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
          className={`w-full py-1 text-center rounded-md shadow-md`}
          type="text"
        />
      </div>
      <div className={`flex flex-col gap-0.5 scroll-mt-5`}>
        {filteredItemsStock.map((is, index) => (
          <ItemStockElement
            key={is.id + is.lockVersion}
            item={{
              id: is.itemTypeId,
              name: is.ItemType.name,
              value: is.value,
              image: is.ItemType.image,
              consumedItemsCount: consumedItemsTotalsById[is.itemTypeId],
              unit: ItemTypeUnitsNames[String(is.ItemType.unit)]
            }}
            index={index}
            onAddStock={async (value) => {
              await onAddStock(is.id, is.lockVersion, value);
            }}
            hoverCallback={hoverCallback}
            isSelected={is.itemTypeId === selectedItem}
          />
        ))}
      </div>
    </div>
  );
}
