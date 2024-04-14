import prisma from '@/lib/prisma';
import { ItemTypeEditView } from '@/containers/ItemTypeEditView';

async function getProps() {
  const itemTypes = await prisma.itemType.findMany({
    include: {
      ItemChild: true
    }
  });
  return {
    itemTypes
  };
}

export default async function ItemType() {
  const { itemTypes } = await getProps();

  return (
    <div className="w-fit">
      <div className="flex flex-row gap-6 mt-4">
        <div className="flex-1 bg-fuchsia-700 bg-opacity-5 px-6 py-4 rounded-md max-h-[29rem]">
          <ItemTypeEditView
            itemsTypes={itemTypes.map(({ name, ItemChild, id, type }) => ({
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
          />
        </div>
        <div className="flex-[2] bg-fuchsia-700 bg-opacity-5 px-6 py-4 rounded-md  max-h-[calc(80vh)] overflow-auto">
          <div className="flex flex-row font-bold gap-5 border-b-0 mb-2">
            <label className="flex-1 text-sm">Name</label>
            <label className="flex-1 text-sm">Type</label>
            <label className="text-sm">ID</label>
          </div>
          {itemTypes.map((it) => (
            <div key={it.id} className="flex flex-row gap-5">
              <div className="flex-1 font-bold">{it.name}</div>
              <div className="flex-1">{it.type}</div>
              <div className="font-extralight w-60">{it.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
