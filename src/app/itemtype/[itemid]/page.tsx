import ItemTypeForm, { ItemTypeFormValuesType } from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';
import { RedirectButton } from '@/components/Button';
import { getItemType } from '@/app/lib/actions/itemType';
import { mapItemType } from '@/app/itemtype/page';
import LongPressButton from '@/components/LongPressButton';

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
    async () => getItemType(itemid),
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
  const submitData = async (
    { itemType: prevItemType2 }: ItemTypeFormValuesType,
    { itemType }: ItemTypeFormValuesType
  ): Promise<ItemTypeFormValuesType> => {
    'use server';
    try {
      await prisma.$transaction(async (tx) => {
        const prevItemType = await tx.itemType.findUniqueOrThrow({
          where: {
            id: itemType.id
          },
          include: {
            ItemChild: true
          }
        });

        const childrenToDelete = prevItemType.ItemChild.filter((prevItemChild) => {
          return !itemType.children.some(
            ({ id: actualChildId }) => prevItemChild.id === actualChildId
          );
        });
        const childrenToUpdate = itemType.children.filter((actualChild) => {
          return prevItemType.ItemChild.some(
            ({ id: prevChildId }) => actualChild.id === prevChildId
          );
        });

        const childrenToAdd = itemType.children.filter((actualChild) => !actualChild.id);
        await tx.itemType.update({
          where: {
            id: itemType.id
          },
          data: {
            name: itemType.name,
            type: itemType.type,
            ItemChild: {
              deleteMany: {
                id: { in: childrenToDelete.map(({ id }) => id) }
              },
              createMany: {
                data: childrenToAdd.map((c) => ({
                  itemTypeId: c.itemTypeId,
                  quantity: Number(c.quantity)
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
              quantity: Number(cu.quantity)
            }
          });
        }
      });

      const newItemType = await getItemType(itemType.id);

      if (!newItemType) {
        throw Error('Item is not found');
      }

      return {
        success: true,
        itemType: mapItemType(itemTypes, {
          id: newItemType.id,
          type: newItemType.type,
          name: newItemType.name,
          ItemChild: newItemType.ItemChild
        })
      };
    } catch (error) {
      console.error(error);

      return {
        error:
          'message' in (error as { message: string })
            ? ((error as { message: string }).message as string)
            : 'unknown error',
        itemType
      };
    } finally {
      revalidateTag('item_types_edit');
      revalidatePath('/', 'layout');
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

        await tx.itemChild.deleteMany({
          where: {
            parentTypeId: params.itemid
          }
        });

        await tx.itemType.delete({
          where: {
            id: params.itemid
          }
        });
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { error: 'Failed' };
    } finally {
      revalidateTag('item_types_edit');
      revalidatePath('/itemtype', 'layout');
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
        itemsList={itemTypes.map((itemType) => mapItemType(itemTypes, itemType))}
        itemType={mapItemType(itemTypes, itemType)}
      />

      <div className="pt-2 mt-2">
        <LongPressButton
          onLongPress={deleteItemType}
          title={'Delete'}
          className={'text-gray-500 font-bold hover:text-red-700 w-full text-center'}
        />
      </div>
    </div>
  );
}
