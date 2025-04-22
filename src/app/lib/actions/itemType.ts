import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export const getCachedItemForOrders = async () => {
  const itemTypes = await unstable_cache(
    async () =>
      await prisma.itemType.findMany({
        include: {
          ItemChild: {
            include: {
              ItemType: true
            }
          },
          prices: {
            orderBy: {
              date: 'desc'
            },
            take: 1
          }
        }
      }),
    ['item_types_order']
  )();
  return itemTypes.map((itemType) => {
    return {
      ...itemType,
      cost: new Prisma.Decimal(itemType.cost ?? 0),
      prices: itemType.prices.map((price) => {
        return {
          ...price,
          price: new Prisma.Decimal(price.price)
        };
      })
    };
  });
};

export const getCachedItemTypesForEdit = async () => {
  const itemTypes = await unstable_cache(async () => getItemTypes(), ['item_types_edit'], {
    tags: ['item_types_edit']
  })();
  return itemTypes.map((itemType) => {
    return {
      ...itemType,
      prices: itemType.prices.map((price) => {
        return {
          ...price,
          price: new Prisma.Decimal(price.price)
        };
      })
    };
  });
};

export const getItemTypes = async () => {
  'use server';
  return prisma.itemType.findMany({
    include: {
      ItemChild: true,
      prices: {
        orderBy: {
          date: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

export type ItemTypesReturnType = UnwrapPromise<ReturnType<typeof getItemTypes>>;

export const getItemType = async (itemId: string) => {
  'use server';
  const result = await prisma.itemType.findUnique({
    where: {
      id: itemId
    },
    include: {
      ItemChild: true,
      ItemStock: true,
      prices: {
        orderBy: {
          date: 'asc'
        },
        take: 1
      }
    }
  });

  return result;
};

export type ItemTypeReturnType = UnwrapPromise<ReturnType<typeof getItemType>>;
