'use server';

import { formatDate } from 'date-fns';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { ItemType } from '@prisma/client';

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
  return (
    <div className={'flex gap-4 text-lg h-full'}>
      <div className={'px-6 py-4'}>
        <div className={'text-3xl mb-4'}>order #{order.num}</div>
        <div className={'font-semibold mb-2'}>{order.details}</div>
        {order.deadlineAt ? (
          <div className={'flex gap-2 mb-2'}>
            <div>🕙</div>
            <div>{formatDate(order.deadlineAt, 'dd MMMM yyyy HH:mm')}</div>
          </div>
        ) : null}
        <table className={'mt-4 text-base border-[1px] rounded-md w-fit'}>
          <tbody className={''}>
            {order.states.map((state, index) => {
              return (
                <tr key={state.id} className={`${index % 2 === 0 ? 'bg-black/5' : ''}`}>
                  <td className={'font-semibold px-4'}>{state.state.toLowerCase()}</td>
                  <td className={'px-4'}>{formatDate(state.date, 'dd MMMM yyyy HH:mm')}</td>
                  <td className={'px-4'}>by {state.User.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={'border-l-4 px-6 py-4 overflow-y-auto'}>
        <div className={'text-3xl mb-4'}>items</div>
        <table className={'border-[1px]'}>
          <tbody className={'overflow-y-auto align-top text-left'}>
            {order.OrderItem.map((orderItem, index) => (
              <>
                <tr
                  key={orderItem.id}
                  id={orderItem.id}
                  className={`${index % 2 === 0 ? 'bg-black/5' : ''} hover:bg-black/10 row-span-[${orderItem.ItemType.ItemChild.length}] *:px-4`}>
                  <td className={'font-semibold'}>{orderItem.ItemType.name}</td>
                  <td className={'font-light'}>{orderItem.quantity}</td>
                  <td className={''}>
                    <div
                      className={`${orderItem.ItemType.type === 'PRODUCT' ? 'text-fuchsia-900/80' : 'text-blue-900/80'} rounded-md px-2 font-semibold`}>
                      {orderItem.ItemType.type.toLowerCase()}
                    </div>
                  </td>
                </tr>
                {orderItem.ItemType.ItemChild.map((itemChild, childIndex) => (
                  <tr
                    key={`${orderItem.id}_${itemChild.id}`}
                    className={`group hover:bg-black/90 hover:text-white text-base border-y-2 *:px-4`}>
                    <td className={'border-r-2'}>{itemsById[itemChild.itemTypeId]?.name}</td>
                    <td className={'border-r-2font-light'}>{itemChild.quantity}</td>
                    <td
                      className={`${itemsById[itemChild.itemTypeId].type === 'PRODUCT' ? 'text-fuchsia-900/80' : 'text-blue-900/80'} group-hover:text-white font-semibold`}>
                      {itemsById[itemChild.itemTypeId].type.toLowerCase()}
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
