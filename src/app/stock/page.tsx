import prisma from '@/lib/prisma';
import { ItemStockEditView } from '@/container/ItemStockEditView';

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
  console.log(itemStock);

  return (
    <div className="flex flex-col items-center">
      <div className="mt-10">
        <ItemStockEditView itemStock={itemStock} />
      </div>
    </div>
  );
}
