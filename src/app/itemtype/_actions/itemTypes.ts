import { Prisma, PrismaClient } from '@prisma/client';
import * as runtime from '@prisma/client/runtime/library';
import { ItemType } from '@/components/ItemTypeForm';

export async function calcItemTypeCost(
  tx: Omit<PrismaClient, runtime.ITXClientDenyList>,
  itemType: ItemType
): Promise<Prisma.Decimal> {
  const childCosts = await tx.itemType.findMany({
    where: {
      id: {
        in: itemType.children.map((c) => c.itemTypeId)
      }
    },
    select: {
      id: true,
      cost: true,
      prices: {
        where: {
          type: 'BUY'
        },
        orderBy: {
          date: 'desc'
        },
        take: 1
      }
    }
  });
  const childrenQuantity = itemType.children.reduce(
    (result, curr) => {
      result[curr.itemTypeId] = curr.quantity;
      return result;
    },
    {} as { [itemTypeId: string]: number }
  );
  return childCosts.reduce(
    (acc, curr) =>
      acc.add(
        (!curr.cost || curr.cost.isZero()
          ? (curr.prices?.[0]?.price ?? new Prisma.Decimal(0))
          : curr.cost
        ).mul(childrenQuantity[curr.id])
      ),
    new Prisma.Decimal(0)
  );
}
