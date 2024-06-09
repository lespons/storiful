'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { $Enums } from '@prisma/client';

export async function generateStaticParams() {
  return Object.keys($Enums.OrderStates).map((state) => ({
    state: state.toLowerCase()
  }));
}

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
  if (!order) {
    return redirect(`/order/${state}`);
  }
  return redirect(`/order/${state}/${order?.id}`);
}
