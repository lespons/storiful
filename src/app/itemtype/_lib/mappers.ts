import { ItemTypesReturnType } from '@/app/lib/actions/itemType';

export function mapItemType(
  itemTypes: ItemTypesReturnType,
  { id, name, type, ItemChild, image, unit }: ItemTypesReturnType[0]
) {
  return {
    id: id!,
    name,
    type: type,
    image,
    unit: unit,
    children: ItemChild.map((ch) => {
      const it = itemTypes.find((it) => it.id === ch.itemTypeId)!;

      return {
        id: ch.id,
        name: it.name,
        type: it.type,
        itemTypeId: ch.itemTypeId,
        quantity: ch.quantity
      };
    })
  };
}
