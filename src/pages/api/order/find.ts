import type { NextApiRequest, NextApiResponse } from 'next';
import { getOrders, getTodoOrders } from '@/app/lib/actions/order/todo';
import { unstable_cache } from 'next/cache';

export type FindOrdersResponseData = {
  orders: ReturnType<typeof getTodoOrders> extends Promise<infer T> ? T : never;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FindOrdersResponseData>
) {
  const orders = await unstable_cache(
    async () => await getOrders(JSON.parse(req.body)),
    [`order_find_${req.body}`],
    { tags: ['order_find'] }
  )();
  res.status(200).json({ orders });
}
