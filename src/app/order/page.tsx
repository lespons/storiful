'use server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { $Enums } from '@prisma/client';

export async function generateStaticParams() {
  return Object.keys($Enums.OrderStates).map((state) => ({
    state: state.toLowerCase()
  }));
}

export default async function _() {
  const order = await prisma.order.findFirst({
    where: {
      lastState: {
        state: 'CREATED'
      }
    },
    orderBy: {
      num: 'desc'
    },
    select: {
      id: true
    }
  });
  return redirect(`/order/created/${order?.id}`);
}
