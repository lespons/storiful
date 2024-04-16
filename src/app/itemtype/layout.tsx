'use server';

import prisma from '@/lib/prisma';
import React from 'react';
import { ItemTypeElement } from '@/components/ItemType';

async function getProps() {
  const itemTypes = await prisma.itemType.findMany({
    include: {
      ItemChild: true
    }
  });
  return {
    itemTypes
  };
}

export default async function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const { itemTypes } = await getProps();
  return (
    <div className="w-fit">
      <div className="flex flex-row gap-6 mt-4">
        <div className="bg-fuchsia-700 bg-opacity-5 px-6 py-4 rounded-md h-fit w-fit">
          {children}
        </div>
        <div className="flex-[2] bg-fuchsia-700 bg-opacity-5 px-6 py-4 rounded-md max-h-[calc(80vh)] overflow-auto  max-w-[45vw]">
          <div className="flex flex-row font-bold gap-5 border-b-0 mb-2">
            <label className="flex-1 text-sm">Name</label>
            <label className="flex-1 text-sm">Type</label>
            <label className="text-sm">ID</label>
          </div>
          <div className="flex flex-col gap-2">
            {itemTypes.map((it) => (
              <ItemTypeElement key={it.id} type={it.type} name={it.name} id={it.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
