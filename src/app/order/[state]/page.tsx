'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { $Enums } from '@prisma/client';

export default async function _({ params: { state } }: { params: { state: string } }) {
  const order = await prisma.order.findFirst({
    where: {
      lastState: {
        state: state.toUpperCase() as $Enums.OrderStates
      }
    },
    orderBy: {
      num: 'desc'
    },
    select: {
      id: true
    }
  });
  return redirect(`/order/${state}/${order?.id}`);
}
