import prisma from '@/lib/prisma';

export const getItemTypes = async () =>
  prisma.itemType.findMany({
    include: {
      ItemChild: true
    }
  });
export type ItemTypesReturnType = UnwrapPromise<ReturnType<typeof getItemTypes>>;

export const getItemType = async (itemId: string) =>
  prisma.itemType.findUnique({
    where: {
      id: itemId
    },
    include: {
      ItemChild: true,
      ItemStock: true
    }
  });
export type ItemTypeReturnType = UnwrapPromise<ReturnType<typeof getItemType>>;
