import ItemTypeForm, { ItemType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';
import { ActionButton, RedirectButton } from '@/components/Button';

export const dynamicParams = false;

export async function generateStaticParams() {
  const itemTypes = await prisma.itemType.findMany({
    select: {
      id: true
    }
  });

  return itemTypes.map((itemType) => ({
    itemid: itemType.id
  }));
}

async function getProps(itemid: string) {
  const itemTypes = await unstable_cache(
    async () =>
      prisma.itemType.findMany({
        include: {
          ItemChild: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
    ['item_types_edit'],
    {
      tags: ['item_types_edit']
    }
  )();

  const itemType = await unstable_cache(
    async () =>
      prisma.itemType.findUnique({
        where: {
          id: itemid
        },
        include: {
          ItemChild: true,
          ItemStock: true
        }
      }),
    [`item_types_edit_${itemid}`],
    {
      tags: ['item_types_edit']
    }
  )();
  return {
    itemTypes,
    itemType
  };
}

export default async function ItemTypeEditPage({ params }: { params: { itemid: string } }) {
  const { itemType, itemTypes } = await getProps(params.itemid);
  const submitData = async (values: ItemType) => {
    'use server';
    try {
      await prisma.$transaction(async (tx) => {
        const prevItemType = await tx.itemType.findUniqueOrThrow({
          where: {
            id: values.id
          },
          include: {
            ItemChild: true
          }
        });

        const childrenToDelete = prevItemType.ItemChild.filter((prevItemChild) => {
          return !values.children.some(
            ({ id: actualChildId }) => prevItemChild.id === actualChildId
          );
        });
        const childrenToUpdate = values.children.filter((actualChild) => {
          return prevItemType.ItemChild.some(
            ({ id: prevChildId }) => actualChild.id === prevChildId
          );
        });

        const childrenToAdd = values.children.filter((actualChild) => !actualChild.id);
        await tx.itemType.update({
          where: {
            id: values.id
          },
          data: {
            name: values.name,
            type: values.type,
            ItemChild: {
              deleteMany: {
                id: { in: childrenToDelete.map(({ id }) => id) }
              },
              createMany: {
                data: childrenToAdd.map((c) => ({
                  itemTypeId: c.itemTypeId,
                  quantity: c.quantity
                }))
              }
            }
          }
        });

        for (const cu of childrenToUpdate) {
          await tx.itemChild.update({
            where: {
              id: cu.id
            },
            data: {
              quantity: cu.quantity
            }
          });
        }
      });
      revalidateTag('item_types_edit');
      revalidatePath('/', 'layout');
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItemType = async (): Promise<{ error?: string; success?: boolean }> => {
    'use server';
    try {
      await prisma.$transaction(async (tx) => {
        await tx.itemStock.delete({
          where: {
            itemTypeId: params.itemid
          }
        });

        await tx.itemChild.deleteMany({
          where: {
            itemTypeId: params.itemid
          }
        });

        await tx.itemType.delete({
          where: {
            id: params.itemid
          }
        });
      });

      revalidatePath('/', 'layout');

      return { success: true };
    } catch (error) {
      return { error: 'Failed' };
    } finally {
      redirect('/itemtype');
    }
  };

  if (!itemType) {
    return <div>404</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <RedirectButton
          buttonElement={
            <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded-md font-bold">
              <span>Close edit</span>
              <span className="pl-2">❌</span>
            </button>
          }
          path={'/itemtype'}
        />
      </div>

      <ItemTypeForm
        action={'UPDATE'}
        onSubmit={submitData}
        itemsList={itemTypes.map(({ name, ItemChild, id, type }) => ({
          id: id!,
          name,
          type: type,
          children: ItemChild.map((ch) => {
            const it = itemTypes.find((it) => it.id === ch.itemTypeId)!;

            return {
              id: it.id,
              name: it.name,
              itemTypeId: ch.itemTypeId,
              quantity: ch.quantity
            };
          })
        }))}
        itemType={{
          type: itemType.type,
          id: itemType.id,
          name: itemType.name,
          children: itemType.ItemChild.map((ic) => ({
            id: ic.id,
            name: itemTypes.find((it) => it.id === ic.itemTypeId)!.name,
            quantity: ic.quantity,
            itemTypeId: ic.itemTypeId
          }))
        }}
      />

      <div className="pt-2 mt-2">
        <ActionButton
          click={deleteItemType}
          title={'Delete'}
          className={'text-gray-500 font-bold hover:text-red-700 w-full'}
        />
      </div>
    </div>
  );
}
