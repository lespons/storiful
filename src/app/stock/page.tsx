import { ItemStockEdit } from '@/containers/ItemStockEdit';
import { getStock } from '@/pages/api/item/stock';

async function getProps() {
  const itemStock = await getStock();
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
