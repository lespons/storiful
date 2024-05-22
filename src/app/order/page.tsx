'use server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

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
