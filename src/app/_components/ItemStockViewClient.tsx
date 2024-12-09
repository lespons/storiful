'use client';
import { ItemStock, ItemType } from '@prisma/client';
import { ItemStockElement } from '@/components/ItemStockElement';
import React, { KeyboardEvent, startTransition, useCallback, useMemo, useState } from 'react';
import { eventBus, ItemTypeSelectEvent } from '@/lib/eventBus';
import { ItemTypeUnitsNames } from '@/components/ItemTypeForm';
import { Switch } from '@headlessui/react';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';

export function ItemStockViewClient({
  sortedItemsStock,
  consumedItemsTotalsById,
  onAddStock,
  onSetStock
}: {
  sortedItemsStock: (ItemStock & {
    ItemType: Pick<ItemType, 'id' | 'name' | 'type' | 'unit' | 'image'>;
  })[];
  consumedItemsTotalsById: { [itemTypeId: string]: number };
  onAddStock: (id: string, lockVersion: number, value: number) => Promise<void>;
  onSetStock: (id: string, lockVersion: number, value: number) => Promise<void>;
}) {
  const [itemTypeFilter, setItemTypeFilter] = useState<'INVENTORY' | null>(null);
  const [search, setSearch] = useState<string | null>();
  const filteredItemsStock = useMemo(
    () =>
      sortedItemsStock.filter(
        ({ ItemType: { name, type } }) =>
          name.toLowerCase().indexOf(search ?? '') >= 0 &&
          (!itemTypeFilter || itemTypeFilter === type)
      ),
    [sortedItemsStock, search, itemTypeFilter]
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
      <div className={'flex gap-2 sticky top-0 left-0 z-30'}>
        <input
          placeholder={'search'}
          onChange={(e) => {
            startTransition(() => {
              const searchValue = e.target.value.toLowerCase();
              setSearch(searchValue);
            });
          }}
          className={`flex-1 py-1 text-center rounded-md shadow-md`}
          type="text"
        />
        <Switch
          checked={itemTypeFilter === 'INVENTORY'}
          onChange={() => setItemTypeFilter(itemTypeFilter === null ? 'INVENTORY' : null)}
          className="group shadow-md inline-flex my-auto w-14 items-center rounded-full bg-gray-500/15 transition data-[checked]:bg-fuchsia-500/15 ">
          <div className="flex size-8 translate-x-0 rounded-full bg-white transition group-data-[checked]:translate-x-6 group-hover:shadow-lg">
            {itemTypeFilter === 'INVENTORY' ? (
              <ShoppingBagIcon className={'flex-1 my-auto size-5 text-blue-900'} />
            ) : (
              <div className={'flex-1 my-auto text-xs font-semibold'}>all</div>
            )}
          </div>
        </Switch>
      </div>
      <div className={`flex flex-col gap-0.5 scroll-mt-5`} data-testid="stock_view">
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
            onAddStock={async (value, action) => {
              if (action === 'CHANGE') {
                await onAddStock(is.id, is.lockVersion, value);
              }
              if (action === 'SET') {
                await onSetStock(is.id, is.lockVersion, value);
              }
            }}
            hoverCallback={hoverCallback}
            isSelected={is.itemTypeId === selectedItem}
          />
        ))}
      </div>
    </div>
  );
}
