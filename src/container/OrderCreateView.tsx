'use server';
import prisma from '@/lib/prisma';
import { ItemChild, ItemType } from '@prisma/client';
import OrderOrderForm, { OrderFormProps, OrderFormValue } from '@/components/ItemOrderForm';
import { revalidatePath } from 'next/cache';

export async function OrderCreateView({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const submitData = async (
    prevData: { order: OrderFormValue },
    values: { order: OrderFormValue }
  ) => {
    'use server';

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            createdAt: new Date(),
            OrderItem: {
              createMany: {
                data: values.order.items.map(({ id, quantity, name }) => ({
                  itemTypeId: id,
                  quantity
                }))
              }
            }
          }
        });
      });

      return {
        order: {},
        success: true
      };
    } catch (e) {
      console.error(e);
      return { error: (e as { message: string }).message };
    } finally {
      // redisClient.publish('orders', 'new order!');
      revalidatePath('/order');
    }
  };

  return (
    <>
      <div className="text-lg font-bold">Create an order:</div>
      <OrderOrderForm
        itemTypes={itemTypes.map(({ name, id, ItemChild }) => ({
          id,
          name,
          children: ItemChild.map((ic) => ({
            quantity: ic.quantity,
            name: itemTypes.find((it) => it.id === ic.itemTypeId)!.name
          }))
        }))}
        onSubmit={submitData as unknown as OrderFormProps['onSubmit']}
      />
    </>
  );
}
