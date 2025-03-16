import GanttChart from '@/components/GanttChart';
import { format } from 'date-fns';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { formatCurrency } from '@/lib/format';
import { getUTCEndOfDay } from '@/lib/date';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function GanttReports() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        {
          lastState: {
            date: {
              gte: startDate
            }
          }
        },
        {
          lastState: {
            state: {
              in: ['CREATED', 'COMPLETED']
            }
          }
        }
      ]
    },
    orderBy: {
      num: 'asc'
    },
    select: {
      id: true,
      num: true,
      price: true,
      deadlineAt: true,
      lastState: true,
      states: {
        orderBy: {
          date: 'asc'
        }
      }
    }
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case 'CREATED':
        return 'hsl(292 91.4% 72.5%)';
      case 'COMPLETED':
        return 'hsl(142.1 70.6% 45.3%)';
      default:
        return '#fff';
    }
  };
  return (
    <div className="container mx-auto flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Orders stat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg">
            Total order count: <span className={'font-bold'}>{orders.length}</span>
          </div>
          <div className="text-lg">
            Expect price:{' '}
            <span className={'font-bold'}>
              {formatCurrency(
                orders.reduce((acc, curr) => acc.add(curr.price ?? 0), new Decimal(0)).toString()
              )}
            </span>
          </div>
          <div className="text-lg">
            Deadlines reached:{' '}
            <span className={'font-bold'}>
              {
                orders
                  .filter((o) => o.deadlineAt)
                  .filter(
                    (o) =>
                      new Date(o.deadlineAt!).getTime() < new Date(o.lastState!.date!).getTime()
                  ).length
              }
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Orders time line</CardTitle>
          <CardDescription>
            {format(startDate, 'MMM d')} - {format(now, 'MMM d')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GanttChart
            items={orders.map(({ num, states, deadlineAt }) => ({
              id: `#${num}`,
              states: states
                .map(({ state, date }, index) => ({
                  start: date,
                  end: states[index + 1]?.date ? getUTCEndOfDay(states[index + 1].date) : undefined,
                  color: getStateColor(state),
                  state,
                  deadlineAt
                }))
                .filter(({ state }) => ['CREATED', 'COMPLETED'].includes(state))
                .map(({ start, end, color, deadlineAt, state }) => ({
                  start,
                  end,
                  color,
                  strike: end ? undefined : 'dashed',
                  markers:
                    deadlineAt &&
                    start.getTime() <= deadlineAt.getTime() &&
                    (end?.getTime() || now.getTime()) >= deadlineAt.getTime()
                      ? [
                          {
                            date: deadlineAt,
                            color: 'red',
                            width: 3
                          }
                        ]
                      : undefined
                }))
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
