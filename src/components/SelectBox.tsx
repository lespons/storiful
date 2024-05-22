import { Combobox } from '@headlessui/react';
import React, { useCallback, useEffect, useState } from 'react';

type Item = { id: string; name: string; [key: string]: unknown } & unknown;

export function SelectBox({
  items,
  onSelect
}: {
  items: Item[];
  initialItem?: Item;
  onSelect: (item: Item | null) => void;
}) {
  const [options, setOptions] = useState(items);
  const search = useCallback(
    (v: string) => {
      setOptions(items.filter(({ name }) => name.toLowerCase().startsWith(v.toLowerCase())));
    },
    [items]
  );
  useEffect(() => {
    setOptions(items);
  }, [items]);
  return (
    <div className="relative">
      <Combobox value={null} onChange={onSelect}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300">
            <Combobox.Input
              className="w-full px-2 py-1 text-md rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(event) => search(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <div className="h-5 w-5 text-gray-400" aria-hidden="true">
                ^
              </div>
            </Combobox.Button>
          </div>
        </div>
        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none ">
          {!options.length ? (
            <div className="relative cursor-no-drop font-light px-6">No items</div>
          ) : null}
          {options.map((item) => (
            <Combobox.Option
              key={item.id}
              value={item}
              className={({ active }) =>
                `relative cursor-default select-none py-2 px-6 font-bold ${
                  active ? 'bg-violet-600 text-white' : 'text-gray-900'
                }`
              }>
              {item.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
