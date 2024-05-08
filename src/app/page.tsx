'use server';
import prisma from '@/lib/prisma';
import { OrderCreate } from '@/containers/order/OrderCreate';
import { TodoOrders } from '@/containers/order/TodoOrders';
import { CompletedOrdersList } from '@/containers/order/CompletedOrdersList';
import { ItemStockView } from '@/containers/ItemStockView';

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
      <div className="flex-[1]">
        {' '}
        <OrderCreate itemTypes={itemTypes} />
      </div>
      <div className="flex-[2]">
        <TodoOrders itemTypes={itemTypes} />
      </div>
      <div className="flex-[2]">
        <CompletedOrdersList itemTypes={itemTypes} />
      </div>
      <div className="flex-[3]">
        <ItemStockView itemStock={itemStock} />
      </div>
    </div>
  );
}
