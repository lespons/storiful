'use server';
import prisma from '@/lib/prisma';
import { ItemChild, ItemType } from '@prisma/client';
import { auth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cloneOrder } from '@/app/_actions/cloneOrder';
import { getActualCompleted, getExpiredCount } from '@/app/_actions/getCompleted';
import { CompletedOrdersClient } from '@/app/_components/CompletedOrdersClient';
import { CheckCircleIcon, TruckIcon } from '@heroicons/react/24/solid';
import { sendOrder } from '@/app/_actions/sendOrder';

export async function CompletedOrders({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const orders = await getActualCompleted();

  orders.sort(({ states: [completedState1] }, { states: [completedState2] }) => {
    return completedState2.date.getTime() - completedState1.date.getTime();
  });

  const changeOrderItemValue = async (orderItemId: string, value: number) => {
    'use server';
    const session = await auth();

    await prisma.$transaction(async (tx) => {
      const orderItem = await tx.orderItem.findUniqueOrThrow({
        where: {
          id: orderItemId
        }
      });
      await tx.orderItem.update({
        where: {
          id: orderItemId
        },
        data: {
          newQuantity: value
        }
      });
      await tx.itemStock.update({
        where: {
          itemTypeId: orderItem.itemTypeId
        },
        data: {
          value: {
            increment: value - (orderItem.newQuantity ?? orderItem.quantity)
          }
        }
      });
    });

    revalidateTag('order_find');
    revalidatePath('/', 'layout');
    revalidatePath('/order', 'page');
    revalidatePath('/order/create', 'page');
  };

  const expiredOrdersCount = await getExpiredCount();
  return (
    <div className="max-h-[90vh] flex flex-col">
      <div className={'flex gap-1 justify-center w-full mb-1'}>
        <CheckCircleIcon className={'size-6 text-green-900'} />
        <TruckIcon className={'size-6 text-orange-900'} />
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
        }}
      />
    </div>
  );
}
