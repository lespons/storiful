import prisma from '@/lib/prisma';
import { ItemStockEdit } from '@/containers/ItemStockEdit';

async function getProps() {
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
    itemStock
  };
}

export default async function StockHome() {
  const { itemStock } = await getProps();

  return (
    <div className="flex flex-col items-center">
      <div className="mt-10">
        <ItemStockEdit itemStock={itemStock} />
      </div>
    </div>
  );
}
