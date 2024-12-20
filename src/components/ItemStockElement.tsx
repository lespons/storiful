'use client';

import { useEffect, useRef, useState } from 'react';
import { Description, Dialog, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { ArrowRightEndOnRectangleIcon, FolderOpenIcon, PlusIcon } from '@heroicons/react/24/solid';
import LongPressButton from '@/components/LongPressButton';
import { formatCount } from '@/lib/format';

function background(consumedItemsCount: number, value: number) {
  const useProgress = Math.max(Math.round((consumedItemsCount / value) * 100), 0);
  const existProgress = Math.round((value / consumedItemsCount) * 100);
  return (
    <div className="h-full w-full flex flex-row absolute z-0 left-0 top-0 rounded-md overflow-hidden">
      <div
        className={`bg-violet-600/20 group-hover:bg-violet-700/50`}
        style={{
          width: `${useProgress > 100 ? existProgress : useProgress}%`
        }}></div>
      <div
        className={`${consumedItemsCount > value ? 'bg-red-600/30 group-hover:bg-red-600' : 'bg-green-600/15 group-hover:bg-green-700/50'}`}
        style={{
          width: `${useProgress > 100 ? 100 - existProgress : 100 - useProgress}%`
        }}></div>
    </div>
  );
}

function ItemStockItem(props: {
  onClick: () => void;
  image: string | null;
  name: string;
  value: number;
  unit: string | null | undefined;
  consumedItemsCount: number;
}) {
  return (
    <div
      className={
        'flex w-full justify-between group-hover:bg-black/90 group-hover:text-white rounded-md hover:cursor-pointer'
      }
      onClick={props.onClick}>
      <div className={`font-semibold w-full z-10 pl-4 py-1`}>
        <div className={'w-full'}>
          {props.image ? (
            <div className={'absolute -left-1 top-0'}>
              <PaperClipIcon className={'size-5 text-black/90'} />
            </div>
          ) : null}
          <div>{props.name}</div>
        </div>
      </div>

      <div className="flex-2 z-10 flex gap-1 px-4 py-1" role={'contentinfo'}>
        <span>{formatCount(props.value)}</span>
        <span>{props.unit}</span>
        {props.consumedItemsCount > props.value ? (
          <span className="font-semibold text-red-800 group-hover:text-white">
            ({formatCount(props.consumedItemsCount - props.value)})
          </span>
        ) : null}
        {props.consumedItemsCount && props.consumedItemsCount < props.value ? (
          <span className="font-semibold text-green-800 group-hover:text-white">
            ({formatCount(props.value - props.consumedItemsCount)})
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ItemStockDetails({
  id,
  image,
  onAddStock
}: Readonly<{
  id: string;
  image: string | null;
  onAddStock: (value: number, action: 'SET' | 'CHANGE') => void;
}>) {
  const [openImage, setOpenImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  return (
    <>
      <div className={`z-10 bg-white group-hover:bg-white rounded-b-md`}>
        <div className={'flex mt-2 gap-4 items-center justify-center mx-6'}>
          <input
            className={'w-32 rounded-md px-4 py-1 border-[2px]'}
            ref={inputRef}
            type={'number'}
            placeholder={'stock change'}
          />

          <button
            className={`flex-1 rounded-md bg-green-100 hover:bg-green-600 hover:text-white px-4 py-1`}
            disabled={isPending}
            onClick={(e) => {
              if (inputRef.current?.value) {
                setIsPending(true);
                onAddStock(Number(inputRef.current?.value), 'CHANGE');
              }
            }}>
            {!isPending ? (
              <div className={'flex gap-1 justify-center'}>
                add
                <PlusIcon className={'size-4 my-auto'} />
              </div>
            ) : (
              '...'
            )}
          </button>
          <LongPressButton
            onLongPress={() => {
              if (inputRef.current?.value) {
                setIsPending(true);
                onAddStock(Number(inputRef.current?.value), 'SET');
              }
            }}
            defaultHoldTime={1000}
            className={`flex-1 rounded-md bg-pink-100 hover:bg-pink-400 hover:text-white px-4 py-1`}
            bgColor={'bg-pink-500'}>
            {!isPending ? (
              <div className={'flex gap-1 justify-center w-full'}>
                set
                <ArrowRightEndOnRectangleIcon className={'size-4 my-auto'} />
              </div>
            ) : (
              '...'
            )}
          </LongPressButton>
        </div>
        <div
          className={
            'py-1 text-center font-semibold rounded-md mx-6 bg-blue-100 hover:bg-blue-600 hover:text-white my-2'
          }>
          <a className={'flex gap-1 justify-center'} href={`/itemtype/${id}`}>
            open
            <FolderOpenIcon className={'size-5 my-auto'} />
          </a>
        </div>
        {image ? (
          <Image
            alt={`image of ${name}`}
            src={image}
            className={
              'mt-2 border-4 border-transparent hover:cursor-pointer brightness-95 hover:brightness-100 hover:border-blue-600/80 mx-auto'
            }
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenImage(true);
            }}
            width={200}
            height={300}
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
  );
}

export function ItemStockElement({
  item: { id, consumedItemsCount, image, name, value, unit },
  index,
  isSelected,
  onAddStock,
  hoverCallback
}: Readonly<{
  item: {
    id: string;
    name: string;
    value: number;
    image: string | null;
    consumedItemsCount: number;
    unit?: string | null;
  };

  index: number;
  isSelected?: boolean;
  onAddStock: (value: number, action: 'SET' | 'CHANGE') => void;
  hoverCallback: (id: string | null) => void;
}>) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView();
    }
  }, [isSelected, ref]);

  return (
    <div
      id={`itemstock_${id}`}
      data-testid={`itemtype_${name}`}
      ref={ref}
      className={`group flex flex-col relative min-w-full rounded-md bg-white border-b-[1px] border-gray-400
            ${consumedItemsCount ? 'bg-opacity-100' : index % 2 === 0 ? 'bg-gray-100' : ''}
               transition-transform duration-300
               ${isSelected ? 'ring-2' : ''}
             scroll-mt-16
            `}
      data-id={`${id}`}>
      <ItemStockItem
        onClick={() => {
          hoverCallback(id);
        }}
        image={image}
        name={name}
        value={value}
        unit={unit}
        consumedItemsCount={consumedItemsCount}
      />
      {isSelected ? <ItemStockDetails id={id} image={image} onAddStock={onAddStock} /> : null}
      {consumedItemsCount ? background(consumedItemsCount, value) : null}
    </div>
  );
}
