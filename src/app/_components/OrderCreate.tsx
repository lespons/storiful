import prisma from '@/lib/prisma';
import { OrderFormProps } from '@/components/order/OrderForm';
import { OrderCreateClient } from '@/app/_components/OrderCreateClient';
import { createOrder } from '@/app/_actions/createOrder';
import { ItemType } from '@/components/ItemTypeForm';

export async function OrderCreate({ itemTypes }: { itemTypes: ItemType[] }) {
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
      itemTypes={itemTypes}
      itemStockById={itemStockById}
      onSubmit={createOrder as unknown as OrderFormProps['onSubmit']}
    />
  );
}
