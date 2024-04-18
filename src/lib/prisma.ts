import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
const allLogs = {
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
  prisma = new PrismaClient({});
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({});
  }
  prisma = global.prisma;
}

export default prisma;
