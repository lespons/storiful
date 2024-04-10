import prisma from '@/lib/prisma';
import { ItemTypeView } from '@/containers/ItemTypeView';

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
    <div className="flex flex-col items-center">
      <div className="mt-10">
        <ItemTypeView
          itemsTypes={itemTypes.map(({ name, ItemChild, id }) => ({
            id: id!,
            name,
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
      <div className="border-t-2 min-w-full mt-5 mb-10" />
      <div className="flex flex-col max-h-50 overflow-auto">
        <div className="flex flex-row font-bold gap-5 border-b-0 mb-2">
          <label className="flex-1 text-sm">Name</label>
          <label className=" text-sm">ID</label>
        </div>
        {itemTypes.map((it) => (
          <div key={it.id} className="flex flex-row gap-5">
            <div className="flex-1">{it.name}</div>
            <div className="font-extralight">{it.id.slice(0, 13)}...</div>
          </div>
        ))}
      </div>
    </div>
  );
}
