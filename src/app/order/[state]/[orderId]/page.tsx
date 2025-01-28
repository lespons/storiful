'use server';

import { formatDate } from 'date-fns';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { ItemStock, Prisma } from '@prisma/client';
import { CheckIcon, ClockIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { getStock } from '@/app/lib/actions/stock';
import { getCachedItemForOrders } from '@/app/lib/actions/itemType';
import { formatCount, formatCurrency } from '@/lib/format';
import { Decimal } from '@prisma/client/runtime/library';

export async function generateStaticParams() {
  return [];
}

export default async function OrdersPage({ params: { orderId } }: { params: { orderId: string } }) {
  const itemTypes = await getCachedItemForOrders();
  const itemsStock = await unstable_cache(getStock, ['item_stock'])();

  const order = await prisma.order.findUniqueOrThrow({
    where: {
      id: orderId
    },
    include: {
      lastState: true,
      OrderItem: {
        orderBy: {
          name: 'asc'
        },
        include: {
          ItemType: true
        }
      },
      states: {
        orderBy: {
          date: 'desc'
        },
        include: {
          User: true
        }
      }
    }
  });

  const itemsById = itemTypes.reduce(
    (result, curr) => {
      result[curr.id] = curr;
      return result;
    },
    {} as { [id: string]: (typeof itemTypes)[0] }
  );

  const itemsStockById = itemsStock.reduce(
    (result, curr) => {
      result[curr.itemTypeId] = curr;
      return result;
    },
    {} as { [id: string]: ItemStock }
  );

  const getItemPrice = (itemId: string) => {
    const item = itemsById[itemId];
    return item.prices?.[0] ?? { price: new Decimal(0) };
  };
  const totalPrice = order?.price ? order.price.toString() : '0';
  const totalExpenses = order.OrderItem.reduce(
    (acc, oi) =>
      acc.add(
        itemsById[oi.itemTypeId].type === 'INVENTORY'
          ? getItemPrice(oi.itemTypeId).price.mul(oi.quantity)
          : (oi.ItemType.cost?.mul(oi.quantity) ?? 0)
      ),
    new Prisma.Decimal(0)
  );

  return (
    <div className={'flex h-full gap-4 text-lg'}>
      <div className={'px-6 py-4'}>
        <div className={'mb-4 text-3xl'}>order #{order.num}</div>
        <div className={'mb-2 font-semibold'}>{order.details}</div>
        {order.deadlineAt ? (
          <div className={'mb-2 flex gap-2'}>
            <ClockIcon className={'my-auto size-5'} />
            <div>{formatDate(order.deadlineAt, 'dd MMM yyyy HH:mm')}</div>
          </div>
        ) : null}
        {
          <div className={'mb-2 flex flex-col gap-2'}>
            <div className={'flex gap-1 whitespace-nowrap rounded-md bg-green-400/50 px-2'}>
              <div className={'font-semibold'}>{formatCurrency(totalPrice)}</div>
              <div className={''}>sell price</div>
            </div>
            <div className={'flex gap-1 whitespace-nowrap rounded-md bg-red-400/50 px-2'}>
              <div className={'font-semibold'}>{formatCurrency(totalExpenses.toString())}</div>
              <div className={''}>expenses</div>
            </div>
          </div>
        }
        <table className={'mt-4 w-fit table-auto rounded-md border-[1px] text-sm italic'}>
          <tbody className={''}>
            {order.states.map((state, index) => {
              return (
                <tr key={state.id} className={`table-row ${index % 2 === 0 ? 'bg-gray-200' : ''}`}>
                  <td className={'table-cell px-4'}>{state.state.toLowerCase()}</td>
                  <td className={'table-cell px-4'}>by {state.User.name}</td>
                  <td className={'table-cell px-4'}>{formatDate(state.date, 'dd/MM/yy HH:mm')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={'w-full overflow-y-auto border-l-4'}>
        <table className={'w-full table-auto border-collapse'}>
          <tbody className={'overflow-y-auto text-base'}>
            {order.OrderItem.map((orderItem, index) => (
              <>
                <tr
                  key={orderItem.id}
                  id={orderItem.id}
                  className={`${index % 2 === 0 ? 'bg-black/5' : ''} table-row hover:bg-black/10 row-span-[${itemsById[orderItem.ItemType.id].ItemChild.length}] *:px-4`}>
                  <td className={'table-cell w-0 !p-2 !pr-0 text-center'}>
                    {orderItem.completed ? (
                      orderItem.fromStock ? (
                        <HomeModernIcon className={'size-5 text-blue-800'} />
                      ) : (
                        <CheckIcon className={'size-5 text-green-800'} />
                      )
                    ) : (
                      <ClockIcon className={'size-5 text-gray-500'} />
                    )}
                  </td>
                  <td className={'table-cell text-green-800'}>
                    <a
                      href={'/itemtype/' + orderItem.itemTypeId}
                      className={'flex w-full hover:text-amber-800 hover:underline'}>
                      {orderItem.ItemType.name}
                    </a>
                  </td>
                  <td className={'table-cell text-green-800'}>{orderItem.quantity}</td>
                  <td className={'table-cell'}>
                    {orderItem.ItemType.type === 'PRODUCT'
                      ? formatCurrency(
                          orderItem.ItemType.cost?.mul(orderItem.quantity).toString() ?? '0'
                        )
                      : formatCurrency(
                          getItemPrice(orderItem.itemTypeId)
                            ?.price?.mul(orderItem.quantity)
                            .toString()
                        )}
                  </td>
                  <td className={'table-cell'}>
                    <div
                      className={`${orderItem.ItemType.type === 'PRODUCT' ? 'text-fuchsia-600' : 'text-blue-600'} rounded-md px-2`}>
                      {orderItem.ItemType.type === 'INVENTORY' ? (
                        <ShoppingBagIcon className={'size-5'} />
                      ) : (
                        <WrenchScrewdriverIcon className={'size-5'} />
                      )}
                    </div>
                  </td>
                </tr>
                {itemsById[orderItem.ItemType.id].ItemChild.map((itemChild, childIndex) => (
                  <tr
                    key={`${orderItem.id}_${itemChild.id}`}
                    className={`group table-row border-y-2 text-base *:px-4 hover:bg-black/90 hover:text-white`}>
                    <td className={'table-cell'}></td>
                    <td className={'table-cell border-r-2'}>
                      <a
                        href={'/itemtype/' + itemChild.itemTypeId}
                        className={'flex w-full hover:text-amber-200 hover:underline'}>
                        {itemsById[itemChild.itemTypeId]?.name}
                      </a>
                    </td>
                    {orderItem.completed ? (
                      <td className={`border-r-2font-light table-cell`}>
                        {formatCount(itemChild.quantity * orderItem.quantity)}
                      </td>
                    ) : (
                      <td
                        className={`border-r-2font-light table-cell ${itemChild.quantity * orderItem.quantity > itemsStockById[itemChild.itemTypeId].value ? 'bg-red-100 text-red-700 group-hover:text-red-700' : 'bg-green-100 group-hover:text-black'}`}>
                        {formatCount(itemChild.quantity * orderItem.quantity)}/
                        {formatCount(itemsStockById[itemChild.itemTypeId].value)}
                      </td>
                    )}
                    <td className={'table-cell text-red-600/80'}>
                      {formatCurrency(
                        itemsById[itemChild.itemTypeId]?.type === 'INVENTORY'
                          ? getItemPrice(itemChild.itemTypeId)
                              ?.price.mul(itemChild.quantity * orderItem.quantity)
                              .toString()
                          : itemsById[itemChild.itemTypeId]?.cost
                              ?.mul(itemChild.quantity * orderItem.quantity)
                              .toString() || '0'
                      )}
                    </td>
                    <td
                      className={`table-cell ${itemsById[itemChild.itemTypeId].type === 'PRODUCT' ? 'text-fuchsia-600/80' : 'text-blue-600/80'} font-semibold group-hover:text-white`}>
                      {itemsById[itemChild.itemTypeId].type === 'INVENTORY' ? (
                        <ShoppingBagIcon className={'size-5'} />
                      ) : (
                        <WrenchScrewdriverIcon className={'size-5'} />
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
