import type { NextApiRequest, NextApiResponse } from 'next';
import { Order } from '@prisma/client';
import prisma from '@/lib/prisma';

type ResponseData = {
  orders: Order[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const orders = await prisma.order.findMany({});
  res.status(200).json({ orders });
}
