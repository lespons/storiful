'use client';

import { useRef, useState } from 'react';
import { Description, Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';

function background(consumedItemsCount: number, value: number) {
  const useProgress = Math.max(Math.round((consumedItemsCount / value) * 100), 0);
  const existProgress = Math.round((value / consumedItemsCount) * 100);
  return (
    <div className="h-full w-full flex flex-row absolute z-0 left-0 top-0 rounded-md overflow-hidden">
      <div
        className={`bg-violet-500/30 group-hover:bg-violet-700`}
        style={{
          width: `${useProgress > 100 ? existProgress : useProgress}%`
        }}></div>
      <div
        className={`${consumedItemsCount > value ? 'bg-red-500/30 group-hover:bg-red-700' : 'bg-green-500/30 group-hover:bg-green-700'}`}
        style={{
          width: `${useProgress > 100 ? 100 - existProgress : 100 - useProgress}%`
        }}></div>
    </div>
  );
}

export function ItemStockElement({
  id,
  consumedItemsCount,
  image,
  index,
  name,
  value,
  onAddStock
}: {
  id: string;
  name: string;
  value: number;
  image: string | null;
  consumedItemsCount: number;
  index: number;
  onAddStock: (value: number) => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  return (
    <div
      className={`group flex flex-col relative min-w-full rounded-md bg-white border-b-[1px] border-gray-400
            ${consumedItemsCount ? 'bg-opacity-100' : index % 2 === 0 ? 'bg-gray-100' : ''}
               transition-transform duration-300
            `}>
      <div
        className={
          'flex w-full justify-between group-hover:bg-black/90 group-hover:text-white rounded-md hover:cursor-pointer'
        }
        onClick={() => setShowDetails((v) => !v)}>
        <div className={`font-semibold w-full z-10 pl-4 py-1`}>
          <div className={'w-full'}>
            {image ? <div className={'absolute -left-2 -top-1'}>📎</div> : null}
            <div>{name}</div>
          </div>
        </div>

        <div className="flex-2 z-10 flex gap-1 px-4 py-1">
          <span>{value}</span>
          {consumedItemsCount > value ? (
            <span className="font-bold text-red-800 group-hover:text-white">
              ({consumedItemsCount - value})
            </span>
          ) : null}
        </div>
      </div>

      {showDetails ? (
        <>
          <div className={`z-20 bg-white group-hover:bg-white`}>
            <div className={'flex mt-2 gap-4 items-center justify-center mx-6'}>
              <input
                className={'rounded-md px-4 py-1 border-[2px]'}
                ref={inputRef}
                type={'number'}
                placeholder={'stock change'}
              />

              <button
                className={`flex-1 rounded-md bg-green-100 hover:bg-green-600 hover:text-white px-4 py-1`}
                disabled={isPending}
                onClick={() => {
                  setIsPending(true);
                  onAddStock(Number(inputRef.current?.value));
                }}>
                {!isPending ? 'add ➕' : '...'}
              </button>
            </div>
            <div
              className={
                'py-1 text-center font-semibold rounded-md mx-6 bg-blue-100 hover:bg-blue-600 hover:text-white my-2'
              }>
              <a className={'flex justify-center'} href={`/itemtype/${id}`}>
                open
              </a>
            </div>
            {image ? (
              <Image
                alt={`image of ${name}`}
                src={image}
                className={
                  'mt-2 border-4 border-transparent hover:cursor-pointer brightness-95 hover:brightness-100 hover:border-blue-600/80'
                }
                onClick={() => setOpenImage(true)}
                width={300}
                height={300}
                style={{
                  width: '100%',
                  height: 'auto'
                }}
              />
            ) : null}
          </div>
          <Dialog open={openImage} onClose={() => setOpenImage(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex w-full h-full items-center justify-center p-4 overflow-auto">
              <DialogPanel className="h-full w-[75vw] border bg-white p-4">
                <Description>
                  <img
                    alt={'full'}
                    src={image!}
                    className={'w-full'}
                    onClick={() => setOpenImage(false)}
                  />
                </Description>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      ) : null}
      {consumedItemsCount ? background(consumedItemsCount, value) : null}
    </div>
  );
}
