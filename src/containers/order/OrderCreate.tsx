import prisma from '@/lib/prisma';
import { ItemChild, ItemType } from '@prisma/client';
import { OrderFormProps, OrderFormValue } from '@/components/order/OrderForm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { OrderCreateClient } from '@/containers/order/OrderCreateClient';

export async function OrderCreate({
  itemTypes
}: {
  itemTypes: (ItemType & { ItemChild: ItemChild[] })[];
}) {
  const submitData = async (
    prevData: { order: OrderFormValue },
    values: { order: OrderFormValue }
  ) => {
    'use server';
    const session = await auth();
    try {
      if (!values.order.items.length) {
        throw Error('No items are selected');
      }
      await prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            createdAt: new Date(),
            createdById: session!.user!.id!,
            deadlineAt: values.order.deadline ? new Date(values.order.deadline) : null,
            details: values.order.details,
            OrderItem: {
              createMany: {
                data: values.order.items.map(({ id, itemId, quantity, name }) => ({
                  itemTypeId: itemId,
                  quantity: Number(quantity)
                }))
              }
            }
          }
        });
      });

      return {
        order: { items: [] },
        success: true
      };
    } catch (e) {
      console.error(e);
      return { error: (e as { message: string }).message };
    } finally {
      revalidatePath('/');
    }
  };

  return (
    <div>
      <div className="text-lg font-bold">Create an order:</div>
      <OrderCreateClient
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
    </div>
  );
}
