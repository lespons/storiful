import type { Metadata } from 'next';
import { TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { SWRProvider } from '@/components/swr';
import { SimpleOrderList } from '@/app/order/[state]/_components/SimpleOrderList';
import { $Enums } from '@prisma/client';
import { getOrders, getOrdersCount } from '@/app/lib/actions/order';
import OrdersNav from '@/app/order/[state]/_components/OrdersNav';
import { unstable_serialize } from 'swr';

export const metadata: Metadata = {
  title: 'Storiful | Orders',
  description: ''
};

export default async function OrdersLayout({
  children,
  params: { state }
}: Readonly<{
  children: React.ReactNode;
  params: { state: string };
}>) {
  const listParams = { skip: 0, limit: 10, states: [state.toUpperCase()] as $Enums.OrderStates[] };
  const orders = await getOrders(listParams);
  const ordersCount = await getOrdersCount(listParams);

  const colorsMap: { [color: string]: string } = {
    created: 'bg-violet-500/10',
    completed: 'bg-green-500/10',
    sent: 'bg-orange-500/10',
    archive: 'bg-gray-500/10'
  };
  const tabBaseStyle = 'rounded-t-md py-1 px-3 font-semibold outline-0  data-[selected]:text-black';
  return (
    <div className="flex mt-6 w-full">
      <TabGroup
        className="w-full"
        defaultIndex={['created', 'completed', 'sent', 'archive'].indexOf(state)}
        manual={true}>
        <TabList className="flex gap-2 text-lg ml-2">
          <OrdersNav className={tabBaseStyle} />
        </TabList>
        <TabPanels>
          <TabPanel className={`${colorsMap[state]} w-full flex flex-row rounded-md`} static={true}>
            <SWRProvider
              fallback={{
                [unstable_serialize(['/api/order/find', listParams])]: {
                  orders: orders
                }
              }}>
              <SimpleOrderList
                className={`h-[80vh]`}
                rightSection={children}
                defaultParams={listParams}
                ordersCount={ordersCount}
              />
            </SWRProvider>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
