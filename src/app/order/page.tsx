'use server';
import prisma from '@/lib/prisma';
import { OrderCreateView } from '@/container/OrderCreateView';
import { TodoOrders } from '@/container/order/TodoOrders';
import { CompletedOrdersList } from '@/container/CompletedOrdersList';
import { ItemStockView } from '@/container/ItemStockView';

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
    <div className="flex flex-row gap-4">
      <div className="mt-10 p-2">
        <OrderCreateView itemTypes={itemTypes} />
      </div>
      <div className="mt-10 p-2">
        <TodoOrders itemTypes={itemTypes} />
      </div>
      <div className="mt-10 p-2">
        <CompletedOrdersList itemTypes={itemTypes} />
      </div>
      <div className="mt-10 p-2">
        <ItemStockView itemStock={itemStock} />
      </div>
    </div>
  );
}
