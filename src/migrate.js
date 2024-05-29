'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var client_1 = require('@prisma/client');
var prisma;
var allLogs = {
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
    {
      emit: 'stdout',
      level: 'error'
    },
    {
      emit: 'stdout',
      level: 'info'
    },
    {
      emit: 'stdout',
      level: 'warn'
    }
  ]
};
if (process.env.NODE_ENV === 'production') {
  prisma = new client_1.PrismaClient({});
} else {
  if (!global.prisma) {
    global.prisma = new client_1.PrismaClient({});
  }
  prisma = global.prisma;
}

const submitData = async () => {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      completed: true,
      completedById: true,
      completedAt: true,
      createdById: true,
      createdAt: true
    }
  });
  for (const order of orders) {
    await prisma.$transaction(async (tx) => {
      if (
        (await tx.orderStatesHistory.count({
          where: {
            state: 'CREATED',
            orderId: order.id
          }
        })) > 0
      ) {
        return;
      }

      await tx.orderStatesHistory.create({
        data: {
          state: 'CREATED',
          date: order.createdAt,
          userId: order.createdById,
          orderId: order.id
        }
      });
    });
  }

  for (const order of orders.filter(({ completed }) => completed)) {
    await prisma.orderStatesHistory.create({
      data: {
        state: 'COMPLETED',
        date: order.completedAt,
        userId: order.completedById,
        orderId: order.id
      }
    });
  }

  for (const order of orders) {
    const latestState = await prisma.orderStatesHistory.findFirst({
      where: { orderId: order.id },
      orderBy: { date: 'desc' },
      select: { id: true }
    });
    await prisma.order.update({
      where: {
        id: order.id
      },
      data: {
        lastStateId: latestState.id
      }
    });
  }
};

submitData().catch(console.log);
