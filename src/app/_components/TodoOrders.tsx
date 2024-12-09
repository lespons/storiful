import { getTodoOrders } from '@/app/lib/actions/order';
import { TodoOrdersClient } from '@/app/_components/TodoOrdersClient';
import { SWRProvider } from '@/components/swr';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import { updateOrder } from '@/app/_actions/updateOrder';
import { OrderCreate } from '@/app/_components/OrderCreate';
import { completeOrder } from '@/app/_actions/completeOrder';
import { completeOrderItem } from '@/app/_actions/completeOrderItem';
import { ItemType } from '@/components/ItemTypeForm';

export async function TodoOrders({ itemTypes }: { itemTypes: ItemType[] }) {
  const orders = await getTodoOrders();
  return (
    <div className="relative max-h-[90vh] flex flex-col">
      <div className={'flex justify-center w-full mb-1'}>
        <WrenchScrewdriverIcon className={'size-6 text-fuchsia-900'} />
      </div>
      <OrderCreate itemTypes={itemTypes} />
      <SWRProvider
        fallback={{
          '/api/order/todo': { orders }
        }}>
        <TodoOrdersClient
          submitData={completeOrder}
          itemTypes={itemTypes}
          completedOrderItem={completeOrderItem}
          updateOrder={updateOrder}
        />
      </SWRProvider>
    </div>
  );
}
