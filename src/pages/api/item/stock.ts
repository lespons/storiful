import prisma from '@/lib/prisma';

export const getStock = async () =>
  await prisma.itemStock.findMany({
    include: {
      ItemType: true
    },
    orderBy: {
      ItemType: {
        name: 'asc'
      }
    }
  });
export type StockReturnType = ReturnType<typeof getStock> extends Promise<infer T> ? T : never;
