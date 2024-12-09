'use server';
import prisma from '@/lib/prisma';
import { TodoOrders } from '@/app/_components/TodoOrders';
import { CompletedOrders } from '@/app/_components/CompletedOrders';
import { ItemStockView } from '@/app/_components/ItemStockView';
import { getItemTypes } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/_lib/mappers';

async function getProps() {
  const itemTypes = await getItemTypes();
  const itemStock = await prisma.itemStock.findMany({
    include: {
      ItemType: {
        select: {
          id: true,
          type: true,
          name: true,
          unit: true,
          image: true
        }
      }
    },
    orderBy: {
      ItemType: {
        name: 'asc'
      }
    }
  });
  return {
    itemTypes,
    itemStock
  };
}

export default async function OrderHome() {
  const { itemTypes, itemStock } = await getProps();
  const clientItemTypes = itemTypes.map((it) => mapItemType(itemTypes, it));
  return (
    <div className="flex flex-row gap-4 mt-6">
      <div className="flex-[3]">
        <TodoOrders itemTypes={clientItemTypes} />
      </div>
      <div className="flex-[3]">
        <CompletedOrders itemTypes={clientItemTypes} />
      </div>
      <div className="flex-[4]">
        <ItemStockView itemStock={itemStock} />
      </div>
    </div>
  );
}
