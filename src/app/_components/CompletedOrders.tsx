import { cloneOrder } from '@/app/_actions/cloneOrder';
import { getActualCompleted, getExpiredCount } from '@/app/_actions/getCompleted';
import { CompletedOrdersClient } from '@/app/_components/CompletedOrdersClient';
import { ArchiveBoxIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/solid';
import { sendOrder } from '@/app/_actions/sendOrder';
import { changeOrderItemValue } from '@/app/_actions/changeOrderItemValue';
import { archiveOrder } from '@/app/_actions/archiveOrder';
import { ItemType } from '@/components/ItemTypeForm';

export async function CompletedOrders({ itemTypes }: { itemTypes: ItemType[] }) {
  const orders = await getActualCompleted();

  orders.sort(({ states: [completedState1] }, { states: [completedState2] }) => {
    return completedState2.date.getTime() - completedState1.date.getTime();
  });

  const expiredOrdersCount = await getExpiredCount();

  const completedCount = orders.filter((order) => order.lastState?.state === 'COMPLETED').length;
  const sentCount = orders.filter((order) => order.lastState?.state === 'SENT').length;
  const archiveCount = orders.filter((order) => order.lastState?.state === 'ARCHIVE').length;

  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className={'mb-3 flex w-full justify-center gap-2'}>
        <div className="flex gap-2 rounded-md bg-green-100 px-2 py-1">
          <span className="font-bold">{completedCount}</span>
          <CheckCircleIcon className={'size-6 text-green-900'} />
        </div>
        <div className="flex gap-2 rounded-md bg-orange-100 px-2 py-1">
          <span className="font-bold">{sentCount}</span>
          <TruckIcon className={'size-6 text-orange-900'} />
        </div>
        <div className="flex gap-2 rounded-md bg-gray-200 px-2 py-1">
          <span className="font-bold">{archiveCount}</span>
          <ArchiveBoxIcon className={'size-6 text-gray-900'} />
        </div>
      </div>
      <CompletedOrdersClient
        orders={orders}
        itemTypes={itemTypes}
        cloneOrder={cloneOrder}
        expiredOrdersCount={expiredOrdersCount}
        onChangeItemValue={changeOrderItemValue}
        onChangeState={async (orderId, state) => {
          'use server';
          if (state === 'SENT') {
            await sendOrder(orderId);
          }
          if (state === 'ARCHIVE') {
            await archiveOrder(orderId);
          }
        }}
      />
    </div>
  );
}
