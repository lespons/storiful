import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export const getTodoOrders = async () => {
  return prisma.order.findMany({
    where: {
      completed: false
    },
    orderBy: {
      num: 'asc'
    },
    include: {
      OrderItem: {
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
          }
        }
      }
    }
  });
};

export type TodoOrdersResponseData = {
  orders: ReturnType<typeof getTodoOrders> extends Promise<infer T> ? T : never;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoOrdersResponseData>
) {
  res.status(200).json({ orders: await getTodoOrders() });
}
