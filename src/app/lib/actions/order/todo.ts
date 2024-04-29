import prisma from '@/lib/prisma';

export const getTodoOrders = async () => {
  return prisma.order.findMany({
    where: {
      completed: false
    },
    orderBy: {
      num: 'asc'
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
