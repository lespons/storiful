import prisma from '@/lib/prisma';
import { ItemChild, ItemType } from '@prisma/client';
import { OrderFormProps } from '@/components/order/OrderForm';
import { OrderCreateClient } from '@/app/_components/OrderCreateClient';
import { createOrder } from '@/app/_actions/createOrder';

export async function OrderCreate({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const itemStock = await prisma.itemStock.findMany({
    where: {
      value: {
        not: {
          equals: 0
        }
      }
    }
  });

  const itemStockById = itemStock.reduce(
    (result, stock) => {
      result[stock.itemTypeId] = stock.value;
      return result;
    },
    {} as { [id: string]: number }
  );
  return (
    <OrderCreateClient
      itemTypes={itemTypes.map(({ name, id, type, ItemChild }) => ({
        id,
        name,
        type,
        children: ItemChild.map((ic) => ({
          quantity: ic.quantity,
          name: itemTypes.find((it) => it.id === ic.itemTypeId)!.name,
          itemTypeId: ic.itemTypeId
        }))
      }))}
      itemStockById={itemStockById}
      onSubmit={createOrder as unknown as OrderFormProps['onSubmit']}
    />
  );
}
