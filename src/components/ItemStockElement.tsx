'use client';

import { useState } from 'react';

function background(consumedItemsCount: number, value: number) {
  const useProgress = Math.max(Math.round((consumedItemsCount / value) * 100), 0);
  const existProgress = Math.round((value / consumedItemsCount) * 100);
  return (
    <div className="h-full w-full flex flex-row absolute z-0 left-0 top-0 rounded-md overflow-hidden">
      <div
        className={`bg-violet-300 group-hover:bg-violet-800`}
        style={{
          width: `${useProgress > 100 ? existProgress : useProgress}%`
        }}></div>
      <div
        className={`${consumedItemsCount > value ? 'bg-red-400 group-hover:bg-red-800' : 'bg-green-400 bg-opacity-50 group-hover:bg-green-800'}`}
        style={{
          width: `${useProgress > 100 ? 100 - existProgress : 100 - useProgress}%`
        }}></div>
    </div>
  );
}

export function ItemStockElement({
  consumedItemsCount,
  image,
  index,
  name,
  value
}: {
  name: string;
  value: number;
  image: string | null;
  consumedItemsCount: number;
  index: number;
}) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div
      className={`group flex flex-row relative gap-4 min-w-full justify-between px-4 py-1 rounded-md bg-white border-b-[1px] border-gray-400
            ${consumedItemsCount ? 'bg-opacity-100' : index % 2 === 0 ? 'bg-gray-100' : ''}
             hover:bg-black hover:text-white transition-transform duration-300
            `}
      onClick={() => setShowDetails((v) => !v)}>
      {consumedItemsCount ? background(consumedItemsCount, value) : null}
      <div className={`font-bold flex-3 z-10`}>
        <div>{name}</div>
        {showDetails ? (
          <div className={``}>
            {image ? <img alt={`image of ${name}`} src={image} className={'rounded-md'} /> : null}
          </div>
        ) : null}
      </div>

      <div className="flex-2 z-10 flex gap-1">
        <span>{value}</span>
        {consumedItemsCount > value ? (
          <span className="z-10 font-bold text-red-800 group-hover:text-white">
            ({consumedItemsCount - value})
          </span>
        ) : null}
      </div>
    </div>
  );
}
