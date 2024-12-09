import type { NextApiRequest, NextApiResponse } from 'next';
import { getTodoOrders } from '@/app/lib/actions/order';

type TodoOrder = Awaited<ReturnType<typeof getTodoOrders>>[number];

export type TodoOrdersResponseData = {
  orders: (Omit<TodoOrder, 'price'> & { price: string })[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ orders: TodoOrder[] }>
) {
  res.status(200).json({ orders: await getTodoOrders() });
}
