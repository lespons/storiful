import { ItemType, ItemTypePrice, Order, OrderItem, Prisma } from '@prisma/client';

export function calcOrderPrice(
  order: Order & { OrderItem: (OrderItem & { ItemType: ItemType & { prices: ItemTypePrice[] } })[] }
): Prisma.Decimal {
  let price = new Prisma.Decimal(0);

  order.OrderItem.forEach((oi) => {
    if (oi.ItemType.prices[0]) {
      price = price.add(oi.ItemType.prices[0].price.mul(oi.quantity));
    }
  });

  return price;
}
