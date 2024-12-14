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
    return item.prices?.[0];
  };
  const totalPrice = order.price ? order.price.toString() : '$0';
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
    <div className={'flex gap-4 text-lg h-full'}>
      <div className={'px-6 py-4'}>
        <div className={'text-3xl mb-4'}>order #{order.num}</div>
        <div className={'font-semibold mb-2'}>{order.details}</div>
        {order.deadlineAt ? (
          <div className={'flex gap-2 mb-2'}>
            <ClockIcon className={'size-5 my-auto'} />
            <div>{formatDate(order.deadlineAt, 'dd MMM yyyy HH:mm')}</div>
          </div>
        ) : null}
        {
          <div className={'flex flex-col gap-2 mb-2'}>
            <div className={'flex px-2 rounded-md bg-green-400/50 gap-1 whitespace-nowrap'}>
              <div className={'font-semibold'}>{formatCurrency(totalPrice)}</div>
              <div className={''}>sell price</div>
            </div>
            <div className={'flex px-2 rounded-md bg-red-400/50 gap-1 whitespace-nowrap'}>
              <div className={'font-semibold'}>{formatCurrency(totalExpenses.toString())}</div>
              <div className={''}>expenses</div>
            </div>
          </div>
        }
        <table className={'table-auto mt-4 text-sm border-[1px] rounded-md w-fit italic'}>
          <tbody className={''}>
            {order.states.map((state, index) => {
              return (
                <tr key={state.id} className={`table-row ${index % 2 === 0 ? 'bg-gray-200' : ''}`}>
                  <td className={'table-cell px-4'}>{state.state.toLowerCase()}</td>
                  <td className={'table-cell px-4'}>by {state.User.name}</td>
                  <td className={'table-cell px-4 '}>{formatDate(state.date, 'dd/MM/yy HH:mm')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={'border-l-4 overflow-y-auto w-full'}>
        <table className={'table-auto border-collapse w-full'}>
          <tbody className={'overflow-y-auto text-base'}>
            {order.OrderItem.map((orderItem, index) => (
              <>
                <tr
                  key={orderItem.id}
                  id={orderItem.id}
                  className={`${index % 2 === 0 ? 'bg-black/5' : ''} table-row hover:bg-black/10 row-span-[${itemsById[orderItem.ItemType.id].ItemChild.length}] *:px-4`}>
                  <td className={'table-cell !p-2 !pr-0 text-center w-0'}>
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
                      className={'w-full flex hover:underline hover:text-amber-800'}>
                      {orderItem.ItemType.name}
                    </a>
                  </td>
                  <td className={'table-cell text-green-800'}>{orderItem.quantity}</td>
                  <td className={'table-cell '}>
                    {orderItem.ItemType.type === 'PRODUCT'
                      ? formatCurrency(
                          orderItem.ItemType.cost
                            ? orderItem.ItemType.cost.mul(orderItem.quantity).toString()
                            : '0'
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
                    className={`table-row group hover:bg-black/90 hover:text-white text-base border-y-2 *:px-4`}>
                    <td className={'table-cell'}></td>
                    <td className={'table-cell border-r-2'}>
                      <a
                        href={'/itemtype/' + itemChild.itemTypeId}
                        className={'w-full flex hover:underline hover:text-amber-200'}>
                        {itemsById[itemChild.itemTypeId]?.name}
                      </a>
                    </td>
                    {orderItem.completed ? (
                      <td className={`table-cell border-r-2font-light`}>
                        {formatCount(itemChild.quantity * orderItem.quantity)}
                      </td>
                    ) : (
                      <td
                        className={`table-cell border-r-2font-light ${itemChild.quantity * orderItem.quantity > itemsStockById[itemChild.itemTypeId].value ? 'text-red-700 group-hover:text-red-700 bg-red-100' : 'group-hover:text-black bg-green-100'}`}>
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
                      className={`table-cell ${itemsById[itemChild.itemTypeId].type === 'PRODUCT' ? 'text-fuchsia-600/80' : 'text-blue-600/80'} group-hover:text-white font-semibold`}>
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
