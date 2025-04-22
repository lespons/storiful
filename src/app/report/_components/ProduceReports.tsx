import { getItemTypes } from '@/app/lib/actions/itemType';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { ItemType } from '@prisma/client';
import { format } from 'date-fns';
import { ProducesBarChart } from './BarcChart';

export async function ProduceReports() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const buildQuery = (start: Date, end: Date) => ({
    where: {
      OR: [
        {
          lastState: {
            date: {
              gte: start,
              lte: end
            }
          }
        }
      ]
    },
    select: {
      id: true,
      lastState: true,
      OrderItem: {
        where: {
          completed: true,
          fromStock: false,
          completedAt: {
            gte: start,
            lte: end
          }
        }
      }
    }
  });
  const itemTypes = await getItemTypes();
  const itemTypesMap = itemTypes.reduce(
    (result, itemType) => {
      result[itemType.id] = itemType;
      return result;
    },
    {} as { [id: string]: ItemType }
  );

  const currentOrders = await prisma.order.findMany(buildQuery(startDate, now));

  const prevMonthOrders = await prisma.order.findMany(
    buildQuery(new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1), startDate)
  );

  const itemsProducedThisMonth = currentOrders.reduce(
    (result, order) => {
      order.OrderItem.forEach((orderItem) => {
        result[orderItem.itemTypeId] = (result[orderItem.itemTypeId] ?? 0) + orderItem.quantity;
      });
      return result;
    },
    {} as { [itemTypeId: string]: number }
  );

  const itemsProducedPrevMonth = prevMonthOrders.reduce(
    (result, order) => {
      order.OrderItem.forEach((orderItem) => {
        result[orderItem.itemTypeId] = (result[orderItem.itemTypeId] ?? 0) + orderItem.quantity;
      });
      return result;
    },
    {} as { [itemTypeId: string]: number }
  );

  Object.entries(itemsProducedPrevMonth).forEach(([itemTypeId, quantity]) => {
    if (!itemsProducedThisMonth[itemTypeId]) {
      itemsProducedThisMonth[itemTypeId] = 0;
    }
  });

  return (
    <div className="container mx-auto flex flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Items produced</CardTitle>
          <CardDescription>
            {format(startDate, 'MMM dd')} - {format(now, 'MMM dd')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProducesBarChart
            data={Object.entries(itemsProducedThisMonth)
              .sort(([, c1], [, c2]) => c2 - c1)
              .map(([itemTypeId, current]) => ({
                itemName: itemTypesMap[itemTypeId]?.name ?? '',
                current,
                prev: itemsProducedPrevMonth[itemTypeId] ?? 0
              }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
