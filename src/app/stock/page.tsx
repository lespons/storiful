import { ItemStockEdit } from '@/app/stock/_components/ItemStockEdit';
import { getStock } from '@/app/lib/actions/stock';

async function getProps() {
  const itemStock = await getStock();
  return {
    itemStock
  };
}

export default async function StockHome() {
  const { itemStock } = await getProps();

  return (
    <div className="w-full max-h-[80vh]">
      <div className="text-lg font-bold mt-6">Edit of your stock for inventory | product</div>
      <div className="bg-fuchsia-700 bg-opacity-5 flex flex-col items-center rounded-md px-4 py-2">
        <ItemStockEdit itemStock={itemStock} />
      </div>
    </div>
  );
}
