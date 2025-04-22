import prisma from '@/lib/prisma';
import { $Enums } from '@prisma/client';

export const getTodoOrders = async (args?: Paging) => {
  'use server';
  return (
    await prisma.order.findMany({
      where: {
        lastState: {
          state: { in: ['CREATED', 'INPROGRESS'] }
        }
      },
      skip: args?.skip,
      take: args?.limit,
      orderBy: [
        {
          deadlineAt: 'asc'
        },
        {
          num: 'asc'
        }
      ],
      include: {
        OrderItem: {
          include: {
            ItemType: {
              select: {
                id: true,
                name: true,
                ItemChild: true,
                cost: false
              }
            }
          },
          orderBy: {
            ItemType: {
              name: 'asc'
            }
          }
        },
        lastState: {
          include: {
            User: true
          }
        }
      }
    })
  ).map((order) => ({
    ...order,
    price: order.price ? order.price.toString() : undefined
  }));
};

export const getOrders = async (args?: Paging & { states: $Enums.OrderStates[] }) => {
  'use server';
  return (
    await prisma.order.findMany({
      where: args
        ? {
            ...(args?.states ? { lastState: { state: { in: args.states } } } : {})
          }
        : undefined,
      skip: args?.skip,
      take: args?.limit,
      orderBy: {
        num: 'desc'
      },
      include: {
        OrderItem: {
          orderBy: {
            ItemType: {
              name: 'asc'
            }
          }
        },
        lastState: {
          include: {
            User: true
          }
        }
      }
    })
  ).map((order) => ({
    ...order,
    price: order.price ? order.price.toString() : undefined
  }));
};

export const getOrdersCount = async (args?: { states: $Enums.OrderStates[] }) => {
  return prisma.order.count({
    where: args
      ? {
          ...(args?.states ? { lastState: { state: { in: args.states } } } : {})
        }
      : undefined
  });
};

export const getOrder = async (id: string) => {
  return prisma.order.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      OrderItem: {
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
          }
        },
        orderBy: {
          ItemType: {
            name: 'asc'
          }
        }
      }
    }
  });
};
