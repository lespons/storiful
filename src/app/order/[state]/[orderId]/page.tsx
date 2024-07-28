'use server';

import { formatDate } from 'date-fns';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { ItemStock, ItemType } from '@prisma/client';
import { CheckIcon, ClockIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { getStock } from '@/app/lib/actions/stock';

export async function generateStaticParams() {
  return [];
}

export default async function OrdersPage({ params: { orderId } }: { params: { orderId: string } }) {
  const itemTypes = await unstable_cache(
    async () =>
      await prisma.itemType.findMany({
        include: {
          ItemChild: {
            include: {
              ItemType: true
            }
          }
        }
      }),
    ['item_types_order']
  )();

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
          ItemType: {
            include: {
              ItemChild: true
            }
          }
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
    {} as { [id: string]: ItemType }
  );
  const itemsStockById = itemsStock.reduce(
    (result, curr) => {
      result[curr.itemTypeId] = curr;
      return result;
    },
    {} as { [id: string]: ItemStock }
  );
  return (
    <div className={'flex gap-4 text-lg h-full'}>
      <div className={'px-6 py-4'}>
        <div className={'text-3xl mb-4'}>order #{order.num}</div>
        <div className={'font-semibold mb-2'}>{order.details}</div>
        {order.deadlineAt ? (
          <div className={'flex gap-2 mb-2'}>
            <ClockIcon className={'size-5 my-auto'} />
            <div>{formatDate(order.deadlineAt, 'dd MMMM yyyy HH:mm')}</div>
          </div>
        ) : null}
        <table className={'table-auto mt-4 text-base border-[1px] rounded-md w-fit'}>
          <tbody className={''}>
            {order.states.map((state, index) => {
              return (
                <tr key={state.id} className={`table-row ${index % 2 === 0 ? 'bg-black/5' : ''}`}>
                  <td className={'table-cell font-semibold px-4'}>{state.state.toLowerCase()}</td>
                  <td className={'table-cell px-4'}>
                    {formatDate(state.date, 'dd MMMM yyyy HH:mm')}
                  </td>
                  <td className={'table-cell px-4'}>by {state.User.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={'border-l-4 px-6 py-4 overflow-y-auto'}>
        <div className={'text-3xl mb-4'}>items</div>
        <table className={'table-auto border-collapse border-[1px] w-full'}>
          <tbody className={'overflow-y-auto'}>
            {order.OrderItem.map((orderItem, index) => (
              <>
                <tr
                  key={orderItem.id}
                  id={orderItem.id}
                  className={`${index % 2 === 0 ? 'bg-black/5' : ''} table-row hover:bg-black/10 row-span-[${orderItem.ItemType.ItemChild.length}] *:px-4`}>
                  <td className={'table-cell '}>
                    {orderItem.completed ? (
                      orderItem.fromStock ? (
                        <HomeModernIcon className={'size-6 text-blue-800'} />
                      ) : (
                        <CheckIcon className={'size-6 text-green-800'} />
                      )
                    ) : (
                      <ClockIcon className={'size-6 text-gray-500'} />
                    )}
                  </td>
                  <td className={'table-cell font-semibold text-green-800'}>
                    <a
                      href={'/itemtype/' + orderItem.itemTypeId}
                      className={'w-full flex hover:underline hover:text-amber-800'}>
                      {orderItem.ItemType.name}
                    </a>
                  </td>
                  <td className={'table-cell text-green-800'}>{orderItem.quantity}</td>
                  <td className={'table-cell'}>
                    <div
                      className={`${orderItem.ItemType.type === 'PRODUCT' ? 'text-fuchsia-900/80' : 'text-blue-900/80'} rounded-md px-2 font-semibold`}>
                      {orderItem.ItemType.type === 'INVENTORY' ? (
                        <ShoppingBagIcon className={'size-6'} />
                      ) : (
                        <WrenchScrewdriverIcon className={'size-6'} />
                      )}
                    </div>
                  </td>
                </tr>
                {orderItem.ItemType.ItemChild.map((itemChild, childIndex) => (
                  <tr
                    key={`${orderItem.id}_${itemChild.id}`}
                    className={`table-row group hover:bg-black/90 hover:text-white text-base border-y-2 *:px-4`}>
                    <td className={'table-cell'}></td>
                    <td className={'table-cell border-r-2'}>
                      <a
                        href={'/itemtype/' + itemChild.itemTypeId}
                        className={
                          'w-full flex hover:underline hover:text-amber-200 font-semibold'
                        }>
                        {itemsById[itemChild.itemTypeId]?.name}
                      </a>
                    </td>
                    {orderItem.completed ? (
                      <td className={`table-cell border-r-2font-light`}>
                        {itemChild.quantity * orderItem.quantity}
                      </td>
                    ) : (
                      <td
                        className={`table-cell border-r-2font-light ${itemChild.quantity * orderItem.quantity > itemsStockById[itemChild.itemTypeId].value ? 'text-red-700 group-hover:text-red-700 bg-red-100' : 'group-hover:text-black bg-green-100'}`}>
                        {itemChild.quantity * orderItem.quantity}/
                        {itemsStockById[itemChild.itemTypeId].value}
                      </td>
                    )}
                    <td
                      className={`table-cell ${itemsById[itemChild.itemTypeId].type === 'PRODUCT' ? 'text-fuchsia-900/80' : 'text-blue-900/80'} group-hover:text-white font-semibold`}>
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
