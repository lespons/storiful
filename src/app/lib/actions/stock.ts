import prisma from '@/lib/prisma';

export const getStock = async () => {
  'use server';
  return prisma.itemStock.findMany({
    include: {
      ItemType: true
    },
    orderBy: {
      ItemType: {
        name: 'asc'
      }
    }
  });
};

export type StockReturnType = UnwrapPromise<ReturnType<typeof getStock>>;
