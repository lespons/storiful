'use client';

import { ReactNode, startTransition, useEffect, useState } from 'react';
import { $Enums, Order, OrderStatesHistory } from '@prisma/client';
import { formatDate } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { TodoOrdersResponseData } from '@/pages/api/order/todo';
import { fetcher } from '@/lib/rest_fecther';
import { FindOneResponseData } from '@/pages/api/order/findOne';
import { Paging } from '@/components/Paging';
import { CalendarIcon } from '@heroicons/react/24/solid';

export function OrderItem({
  order,
  active,
  className
}: {
  className?: string;
  active?: boolean;
  order: Order & { lastState: OrderStatesHistory | null };
}) {
  return (
    <div
      className={`group flex flex-col px-6 py-2 rounded-md bg-white/90 min-w-80 text-sm hover:cursor-pointer hover:bg-black/5
       ${active ? 'border-[1px] border-l-4 border-black/50' : 'border-[1px] border-black/30'}`}>
      <div className={'flex gap-1'}>
        <div className={'font-light my-auto'}>#{order.num}</div>
        {order.details ? (
          <div
            className={`px-2 py-1 text-black/80 line-clamp-1 max-w-64 font-semibold whitespace-break-spaces overflow-ellipsis overflow-hidden`}>
            {order.details}
          </div>
        ) : null}
      </div>
      <div className={'flex gap-1 mt-2 text-xs'}>
        {order.lastState ? (
          <div className="flex flex-row gap-2">
            <CalendarIcon className={'size-3 my-auto'} />
            <div className={'font-sm font-light'}>
              {formatDate(order.lastState.date, 'dd MMMM yyyy')}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SimpleOrderList({
  className,
  rightSection,
  defaultParams,
  ordersCount
}: {
  orders: Array<Order & { lastState: OrderStatesHistory | null }>;
  defaultParams: { limit: number; skip: number; states: $Enums.OrderStates[] };
  rightSection?: ReactNode;
  ordersCount: number;
  className?: string;
}) {
  const { orderId, state } = useParams() as { orderId: string; state: string };
  const router = useRouter();

  const [params, setParams] = useState(defaultParams);

  const { data: orderPage, isLoading: orderIsLoading } = useSWR<FindOneResponseData>(
    orderId ? ['/api/order/findOne', { orderId }] : null,
    async ([url, data]) => fetcher(url, JSON.stringify(data)),
    {
      keepPreviousData: true
    }
  );

  const { data, isLoading } = useSWR<TodoOrdersResponseData>(
    ['/api/order/find', params],
    async ([url, data]) => fetcher(url, JSON.stringify(data)),
    {
      keepPreviousData: true,
      onSuccess: (data) => console.log(data)
    }
  );

  const [pageIsLoading, setPageIsLoading] = useState(false);

  useEffect(() => {
    if (!orderPage) {
      return;
    }
    if (
      orderPage.orderCountBefore >= params.skip ||
      orderPage.orderCountBefore <= params.skip - params.limit
    ) {
      startTransition(() => {
        setParams((state) => ({
          ...state,
          skip: orderPage.orderCountBefore - (orderPage.orderCountBefore % params.limit)
        }));
        setPageIsLoading(false);
      });
    }
  }, [orderPage]);

  return (
    <div
      className={`${pageIsLoading || orderIsLoading || isLoading ? 'bg-[size:200%] bg-black-gradient animate-shift rounded-md' : ''} group/orders flex flex-col gap-2 w-full py-2 px-2 h-full`}>
      <div className={`group/orders flex w-full gap-2 ${className}`}>
        <div className={'flex min-w-fit flex-col gap-0.5 overflow-y-auto pr-1'}>
          {data!.orders.map((order) => (
            <div
              id={`${order.id}`}
              key={order.id}
              onClick={() =>
                router.push(`/order/${state}/${order.id}#${order.id}`, { scroll: false })
              }>
              <OrderItem order={order} key={order.id} active={orderId === order.id} />
            </div>
          ))}
        </div>
        <div className={'w-full bg-white/90 rounded-md'}>{rightSection}</div>
      </div>
      <div className={`flex w-full`}>
        <Paging
          max={Math.ceil(ordersCount / params.limit)}
          defaultValue={Math.round(params.skip / params.limit) + 1}
          onChange={(page) => {
            setPageIsLoading(true);
            fetcher(
              '/api/order/find',
              JSON.stringify({
                skip: (page - 1) * params.limit,
                limit: 1,
                states: params.states
              })
            ).then((res) => {
              router.push(`/order/${state}/${res.orders[0].id}`);
            });
          }}
        />
      </div>
    </div>
  );
}
