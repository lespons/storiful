import type { NextApiRequest, NextApiResponse } from 'next';
import { Order, OrderStatesHistory } from '@prisma/client';
import prisma from '@/lib/prisma';

export type FindOneResponseData = {
  order: Order & { lastState?: OrderStatesHistory | null };
  orderCountBefore: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FindOneResponseData>
) {
  const { orderId } = JSON.parse(req.body);
  const order = await prisma.order.findUniqueOrThrow({
    where: {
      id: orderId
    },
    include: {
      lastState: true
    }
  });

  const orderCountBefore = await prisma.order.count({
    where: {
      lastState: {
        state: order.lastState!.state
      },
      num: { gte: order.num }
    }
  });
  res.status(200).json({
    order,
    orderCountBefore: orderCountBefore > 0 ? orderCountBefore - 1 : orderCountBefore
  });
}
