import prisma from '@/lib/prisma';

export const getTodoOrders = async () => {
  return prisma.order.findMany({
    where: {
      lastState: {
        state: { in: ['CREATED', 'INPROGRESS'] }
      }
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
  });
};

export const getOrder = async (id: string) => {
  return prisma.order.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      CreatedBy: true,
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
