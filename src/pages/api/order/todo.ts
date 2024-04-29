import type { NextApiRequest, NextApiResponse } from 'next';
import { getTodoOrders } from '@/app/lib/actions/order/todo';

export type TodoOrdersResponseData = {
  orders: ReturnType<typeof getTodoOrders> extends Promise<infer T> ? T : never;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoOrdersResponseData>
) {
  res.status(200).json({ orders: await getTodoOrders() });
}
