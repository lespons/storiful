import prisma from '@/lib/prisma';
import React from 'react';
import { ItemTypeElement } from '@/components/ItemType';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

async function getProps() {
  const itemTypes = await unstable_cache(
    async () =>
      prisma.itemType.findMany({
        include: {
          ItemChild: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
    ['item_types_edit'],
    {
      tags: ['item_types_edit']
    }
  )();
  return {
    itemTypes
  };
}

export default async function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const { itemTypes } = await getProps();
  return (
    <div className="w-fit">
      <div className="flex flex-row gap-6 mt-6">
        <div className="bg-gray-300/25 px-6 py-4 rounded-md w-fit h-[90vh] overflow-auto">
          {children}
        </div>
        <div className="flex-[2] bg-gray-300/25 px-6 py-4 rounded-md max-h-[calc(90vh)] overflow-auto w-full">
          <div data-testid="item-types-list" className="flex flex-col gap-1">
            {itemTypes.map((it, index) => (
              <ItemTypeElement
                key={it.id}
                type={it.type}
                name={it.name}
                id={it.id}
                childrenCount={it.ItemChild.length}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
