import prisma from '@/lib/prisma';
import { sub } from 'date-fns';

export type CompletedOrdersReturnType = UnwrapPromise<ReturnType<typeof getActualCompleted>>;

export async function getActualCompleted() {
  'use server';
  return prisma.order.findMany({
    where: {
      OR: [
        {
          states: {
            some: {
              state: {
                in: ['COMPLETED']
              }
            },
            none: {
              state: {
                in: ['SENT']
              }
            }
          }
        },
        {
          states: {
            some: {
              state: {
                in: ['SENT']
              },
              date: {
                gte: sub(new Date(), {
                  months: 1
                })
              }
            }
          }
        }
      ]
    },

    include: {
      states: {
        where: {
          state: 'COMPLETED'
        },
        take: 1
      },
      OrderItem: {
        include: {
          ItemType: {
            include: {
              ItemChild: true
            }
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
}

export async function getExpiredCount() {
  'use server';
  return prisma.order.count({
    where: {
      OR: [
        {
          states: {
            some: {
              state: {
                in: ['SENT']
              },
              date: {
                lt: sub(new Date(), {
                  months: 1
                })
              }
            }
          }
        }
      ]
    }
  });
}
