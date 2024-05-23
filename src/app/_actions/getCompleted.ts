import prisma from '@/lib/prisma';
import { getItemTypes } from '@/app/lib/actions/itemType';

export type CompletedOrdersReturnType = UnwrapPromise<ReturnType<typeof getCompleted>>;

export async function getCompleted() {
  'use server';
  return await prisma.order.findMany({
    where: {
      states: {
        some: {
          state: {
            in: ['COMPLETED', 'SENT']
          }
        }
      }
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
