'use server';
import prisma from '@/lib/prisma';
import { OrderCreate } from '@/app/_components/OrderCreate';
import { TodoOrders } from '@/app/_components/TodoOrders';
import { CompletedOrders } from '@/app/_components/CompletedOrders';
import { ItemStockView } from '@/app/_components/ItemStockView';

async function getProps() {
  const itemTypes = await prisma.itemType.findMany({
    include: {
      ItemChild: {
        include: {
          ItemType: true
        }
      }
    }
  });
  const itemStock = await prisma.itemStock.findMany({
    include: {
      ItemType: true
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
  return (
    <div className="flex flex-row gap-4 mt-6">
      <div className="">
        <OrderCreate itemTypes={itemTypes} />
      </div>
      <div className="flex-[3]">
        <TodoOrders itemTypes={itemTypes} />
      </div>
      <div className="flex-[3]">
        <CompletedOrders itemTypes={itemTypes} />
      </div>
      <div className="flex-[4]">
        <ItemStockView itemStock={itemStock} />
      </div>
    </div>
  );
}
