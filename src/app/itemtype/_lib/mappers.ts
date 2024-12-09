import { ItemTypesReturnType } from '@/app/lib/actions/itemType';
import { ItemType } from '@/components/ItemTypeForm';

export function mapItemType(
  itemTypes: { id: string; name: string; type: ItemTypesReturnType[0]['type'] }[],
  { id, name, type, ItemChild, image, unit, prices, cost }: ItemTypesReturnType[0]
): ItemType {
  return {
    id: id!,
    name,
    type: type,
    image,
    unit: unit,
    price: prices?.[0]?.price?.toNumber(),
    cost: cost?.toString(),
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
