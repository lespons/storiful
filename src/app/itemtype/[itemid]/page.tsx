import ItemTypeForm from '@/components/ItemTypeForm';
import prisma from '@/lib/prisma';
import { RedirectButton } from '@/components/Button';
import { getCachedItemTypesForEdit } from '@/app/lib/actions/itemType';
import LongPressButton from '@/components/LongPressButton';
import { DocumentDuplicateIcon, TrashIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { mapItemType } from '@/app/itemtype/_lib/mappers';
import { createAsNewItemType } from '@/app/itemtype/_actions/createAsNewItemType';
import { deleteItemType } from '@/app/itemtype/_actions/deleteItemType';
import { updateItemType } from '@/app/itemtype/_actions/updateItemType';
import { ItemTreeView } from '@/app/itemtype/_components/ItemTreeView';

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
  const itemTypes = await getCachedItemTypesForEdit();

  return {
    itemTypes,
    itemType: itemTypes.find(({ id }) => id === itemid)
  };
}

export default async function ItemTypeEditPage({ params }: { params: { itemid: string } }) {
  const { itemType, itemTypes } = await getProps(params.itemid);
  if (!itemType) {
    return <div>404</div>;
  }
  const clientItemTypes = itemTypes.map(({ id, name, type }) => ({ id, name, type }));
  return (
    <div>
      <div className="mb-4">
        <RedirectButton
          buttonElement={
            <button className="flex gap-2 justify-center w-full bg-white bg-opacity-20 hover:bg-opacity-90 p-1 rounded-md font-bold">
              <div>close</div>
              <XCircleIcon className={'size-5 my-auto text-red-800'} />
            </button>
          }
          path={'/itemtype'}
        />
      </div>

      <div className="mb-4">
        <ItemTreeView
          builtItem={{
            id: itemType.id,
            name: itemType.name,
            ItemChild: itemType.ItemChild.map((ic) => ({
              itemTypeId: ic.itemTypeId,
              id: ic.id
            }))
          }}
          itemTypes={itemTypes.map((itemType) => ({
            id: itemType.id,
            name: itemType.name,
            ItemChild: itemType.ItemChild.map((ic) => ({
              itemTypeId: ic.itemTypeId,
              id: ic.id
            }))
          }))}
        />
      </div>

      <ItemTypeForm
        action={'UPDATE'}
        onSubmit={async function (prev, newdata) {
          'use server';
          return await updateItemType(prev, newdata, clientItemTypes);
        }}
        itemsList={itemTypes.map((itemType) => mapItemType(itemTypes, itemType))}
        itemType={mapItemType(itemTypes, itemType)}
      />

      <div className="pt-2 mt-2">
        <LongPressButton
          className={'group text-blue-900 font-bold hover:text-blue-950 w-full text-center'}
          bgColor={'bg-blue-200'}
          defaultHoldTime={1000}
          onLongPress={async function () {
            'use server';
            await createAsNewItemType(itemType.id);
          }}>
          <div className={'flex gap-2 w-full justify-center'}>
            <div>create as new</div>
            <DocumentDuplicateIcon className={'size-5 my-auto group-hover:animate-shake'} />
          </div>
        </LongPressButton>
      </div>

      <div className="pt-2 mt-2">
        <LongPressButton
          defaultHoldTime={2000}
          onLongPress={async function () {
            'use server';
            await deleteItemType(itemType.id);
          }}
          className={'group text-gray-500 font-bold hover:text-red-700 w-full text-center'}>
          <div className={'flex gap-2 w-full justify-center '}>
            <div>delete</div>
            <TrashIcon className={'size-5 my-auto group-hover:animate-shake'} />
          </div>
        </LongPressButton>
      </div>
    </div>
  );
}
